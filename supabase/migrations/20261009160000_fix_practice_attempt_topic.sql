-- Inclui o tópico obrigatório nas tentativas em bancos com catálogo normalizado.
create or replace function public.submit_practice_answer(
    p_question_id uuid,
    p_option_id uuid,
    p_elapsed_seconds integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_area text;
    v_topic_id uuid;
    v_explanation text;
    v_correct_option_id uuid;
    v_is_correct boolean;
    v_progress_id uuid;
    v_correct_answers integer;
    v_total_answers integer;
    v_has_attempt_topic boolean;
    v_has_question_topic boolean;
begin
    if v_user_id is null then
        raise exception 'Autenticação necessária.' using errcode = '42501';
    end if;
    if p_elapsed_seconds is null or p_elapsed_seconds < 0 or p_elapsed_seconds > 3600 then
        raise exception 'Tempo de resposta inválido.' using errcode = '22023';
    end if;

    select q.area, q.explanation, correct_option.id
      into v_area, v_explanation, v_correct_option_id
      from public.questions q
      join public.question_options correct_option
        on correct_option.question_id = q.id and correct_option.is_correct
     where q.id = p_question_id and q.status = 'approved';

    if not found then
        raise exception 'Questão indisponível.' using errcode = '22023';
    end if;

    select opt.is_correct into v_is_correct
      from public.question_options opt
     where opt.id = p_option_id and opt.question_id = p_question_id;

    if not found then
        raise exception 'Alternativa inválida.' using errcode = '22023';
    end if;

    select exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'question_attempts'
          and column_name = 'topic_id'
    ) into v_has_attempt_topic;
    select exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'questions'
          and column_name = 'topic_id'
    ) into v_has_question_topic;

    if v_has_attempt_topic then
        if not v_has_question_topic then
            raise exception 'O banco exige tópico na tentativa, mas a questão não possui topic_id.'
                using errcode = '23502';
        end if;

        execute 'select topic_id from public.questions where id = $1'
            into v_topic_id using p_question_id;
        if v_topic_id is null then
            raise exception 'Esta questão ainda não está associada a um tópico.'
                using errcode = '23502';
        end if;

        execute '
            insert into public.question_attempts (
                user_id, question_id, topic_id, selected_option_id, is_correct, elapsed_seconds
            ) values ($1, $2, $3, $4, $5, $6)
        ' using v_user_id, p_question_id, v_topic_id, p_option_id, v_is_correct, p_elapsed_seconds;
    else
        insert into public.question_attempts (
            user_id, question_id, selected_option_id, is_correct, elapsed_seconds
        ) values (
            v_user_id, p_question_id, p_option_id, v_is_correct, p_elapsed_seconds
        );
    end if;

    -- Serializa as atualizações da mesma área para não perder tentativas concorrentes.
    perform pg_advisory_xact_lock(hashtext(v_user_id::text), hashtext(v_area));

    select progress.id into v_progress_id
      from public.study_progress progress
     where progress.user_id = v_user_id and progress.area = v_area
     order by progress.updated_at desc
     limit 1
     for update;

    if v_progress_id is null then
        insert into public.study_progress (
            user_id, area, score, correct_answers, total_answers, last_activity_at
        ) values (
            v_user_id, v_area, case when v_is_correct then 100 else 0 end,
            case when v_is_correct then 1 else 0 end, 1, now()
        ) returning id, correct_answers, total_answers
          into v_progress_id, v_correct_answers, v_total_answers;
    else
        update public.study_progress progress
           set correct_answers = progress.correct_answers + case when v_is_correct then 1 else 0 end,
               total_answers = progress.total_answers + 1,
               score = round(
                   (progress.correct_answers + case when v_is_correct then 1 else 0 end)::numeric
                   * 100 / (progress.total_answers + 1)
               )::integer,
               last_activity_at = now(),
               updated_at = now()
         where progress.id = v_progress_id
         returning progress.correct_answers, progress.total_answers
          into v_correct_answers, v_total_answers;
    end if;

    return jsonb_build_object(
        'is_correct', v_is_correct,
        'correct_option_id', v_correct_option_id,
        'explanation', v_explanation,
        'correct_answers', v_correct_answers,
        'total_answers', v_total_answers
    );
end;
$$;

revoke all on function public.submit_practice_answer(uuid, uuid, integer) from public, anon;
grant execute on function public.submit_practice_answer(uuid, uuid, integer) to authenticated;

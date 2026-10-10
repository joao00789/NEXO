-- Registra tentativas geradas sob demanda sem manter um banco de questões.
create table if not exists public.ai_question_attempts (
    id uuid primary key,
    user_id uuid not null references public.profiles(id) on delete cascade,
    area text not null check (area in ('matematica', 'linguagens', 'humanas', 'natureza')),
    subject text not null check (length(trim(subject)) between 2 and 100),
    topic text not null check (length(trim(topic)) between 2 and 160),
    is_correct boolean not null,
    elapsed_seconds integer not null check (elapsed_seconds between 0 and 3600),
    created_at timestamptz not null default now()
);

create index if not exists ai_question_attempts_user_created_idx
    on public.ai_question_attempts (user_id, created_at desc);

alter table public.ai_question_attempts enable row level security;
drop policy if exists "Usuário visualiza suas tentativas de questões geradas" on public.ai_question_attempts;
create policy "Usuário visualiza suas tentativas de questões geradas"
on public.ai_question_attempts for select
using (auth.uid() = user_id);
revoke all on public.ai_question_attempts from public, anon, authenticated;
grant select on public.ai_question_attempts to authenticated;

create or replace function public.reward_ai_question_coins()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_balance integer;
    v_earned_today integer;
    v_day_start timestamptz := date_trunc('day', new.created_at at time zone 'UTC') at time zone 'UTC';
    v_day_end timestamptz := v_day_start + interval '1 day';
    v_transaction_id uuid;
    v_source_key text;
begin
    perform pg_advisory_xact_lock(
        hashtext(new.user_id::text),
        hashtext((new.created_at at time zone 'UTC')::date::text)
    );
    select profile.coins into v_balance
    from public.profiles profile
    where profile.id = new.user_id
    for update;
    if not found then
        return new;
    end if;

    select coalesce(sum(transaction.amount), 0)::integer into v_earned_today
    from public.coin_transactions transaction
    where transaction.user_id = new.user_id
      and transaction.reason in ('question_answered', 'question_correct')
      and transaction.created_at >= v_day_start
      and transaction.created_at < v_day_end;

    v_source_key := 'ai-question-answered:' || new.user_id::text || ':' || new.id::text
        || ':' || (new.created_at at time zone 'UTC')::date::text;
    if v_earned_today + 2 <= 50 then
        insert into public.coin_transactions (
            user_id, amount, balance_after, reason, reference_id, source_key
        ) values (
            new.user_id, 2, v_balance + 2, 'question_answered', new.id, v_source_key
        )
        on conflict (source_key) do nothing
        returning id into v_transaction_id;
        if v_transaction_id is not null then
            update public.profiles set coins = coins + 2 where id = new.user_id;
            v_balance := v_balance + 2;
            v_earned_today := v_earned_today + 2;
        end if;
    end if;

    if new.is_correct and v_earned_today + 3 <= 50 then
        v_source_key := 'ai-question-correct:' || new.user_id::text || ':' || new.id::text
            || ':' || (new.created_at at time zone 'UTC')::date::text;
        insert into public.coin_transactions (
            user_id, amount, balance_after, reason, reference_id, source_key
        ) values (
            new.user_id, 3, v_balance + 3, 'question_correct', new.id, v_source_key
        )
        on conflict (source_key) do nothing
        returning id into v_transaction_id;
        if v_transaction_id is not null then
            update public.profiles set coins = coins + 3 where id = new.user_id;
        end if;
    end if;

    return new;
end;
$$;
revoke all on function public.reward_ai_question_coins() from public, anon, authenticated;
drop trigger if exists ai_question_attempt_coin_reward on public.ai_question_attempts;
create trigger ai_question_attempt_coin_reward
after insert on public.ai_question_attempts
for each row execute function public.reward_ai_question_coins();

create or replace function public.reward_ai_question_coins()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_balance integer;
    v_earned_today integer;
    v_day_start timestamptz := date_trunc('day', new.created_at at time zone 'UTC') at time zone 'UTC';
    v_day_end timestamptz := v_day_start + interval '1 day';
    v_transaction_id uuid;
    v_source_key text;
begin
    perform pg_advisory_xact_lock(
        hashtext(new.user_id::text),
        hashtext((new.created_at at time zone 'UTC')::date::text)
    );
    select profile.coins into v_balance
    from public.profiles profile
    where profile.id = new.user_id
    for update;
    if not found then
        return new;
    end if;

    select coalesce(sum(transaction.amount), 0)::integer into v_earned_today
    from public.coin_transactions transaction
    where transaction.user_id = new.user_id
      and transaction.reason in ('question_answered', 'question_correct')
      and transaction.created_at >= v_day_start
      and transaction.created_at < v_day_end;

    v_source_key := 'ai-question-answered:' || new.user_id::text || ':' || new.id::text
        || ':' || (new.created_at at time zone 'UTC')::date::text;
    if v_earned_today + 2 <= 50 then
        insert into public.coin_transactions (
            user_id, amount, balance_after, reason, reference_id, source_key
        ) values (
            new.user_id, 2, v_balance + 2, 'question_answered', new.id, v_source_key
        )
        on conflict (source_key) do nothing
        returning id into v_transaction_id;
        if v_transaction_id is not null then
            update public.profiles set coins = coins + 2 where id = new.user_id;
            v_balance := v_balance + 2;
            v_earned_today := v_earned_today + 2;
        end if;
    end if;

    if new.is_correct and v_earned_today + 3 <= 50 then
        v_source_key := 'ai-question-correct:' || new.user_id::text || ':' || new.id::text
            || ':' || (new.created_at at time zone 'UTC')::date::text;
        insert into public.coin_transactions (
            user_id, amount, balance_after, reason, reference_id, source_key
        ) values (
            new.user_id, 3, v_balance + 3, 'question_correct', new.id, v_source_key
        )
        on conflict (source_key) do nothing
        returning id into v_transaction_id;
        if v_transaction_id is not null then
            update public.profiles set coins = coins + 3 where id = new.user_id;
        end if;
    end if;

    return new;
end;
$$;
revoke all on function public.reward_ai_question_coins() from public, anon, authenticated;
drop trigger if exists ai_question_attempt_coin_reward on public.ai_question_attempts;
create trigger ai_question_attempt_coin_reward
after insert on public.ai_question_attempts
for each row execute function public.reward_ai_question_coins();

create or replace function public.record_ai_question_attempt(
    p_attempt_id uuid,
    p_area text,
    p_subject text,
    p_topic text,
    p_is_correct boolean,
    p_elapsed_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user_id uuid := auth.uid();
    v_correct_answers integer;
    v_total_answers integer;
    v_xp_earned integer := 5;
begin
    if v_user_id is null then
        raise exception 'Autenticação necessária.' using errcode = '42501';
    end if;
    if p_area is null or p_area not in ('matematica', 'linguagens', 'humanas', 'natureza')
       or p_subject is null or length(trim(p_subject)) not between 2 and 100
       or p_topic is null or length(trim(p_topic)) not between 2 and 160
       or p_is_correct is null
       or p_elapsed_seconds is null or p_elapsed_seconds not between 0 and 3600 then
        raise exception 'Dados da tentativa inválidos.' using errcode = '22023';
    end if;

    perform pg_advisory_xact_lock(hashtext(v_user_id::text), hashtext(p_area));
    insert into public.ai_question_attempts (
        id, user_id, area, subject, topic, is_correct, elapsed_seconds
    ) values (
        p_attempt_id, v_user_id, p_area, trim(p_subject), trim(p_topic),
        p_is_correct, p_elapsed_seconds
    );

    insert into public.study_progress (
        user_id, area, score, correct_answers, total_answers, last_activity_at
    ) values (
        v_user_id, p_area, case when p_is_correct then 100 else 0 end,
        case when p_is_correct then 1 else 0 end, 1, now()
    )
    on conflict (user_id, area) do update
    set correct_answers = public.study_progress.correct_answers
            + case when p_is_correct then 1 else 0 end,
        total_answers = public.study_progress.total_answers + 1,
        score = round(
            (public.study_progress.correct_answers
                + case when p_is_correct then 1 else 0 end)::numeric
            / (public.study_progress.total_answers + 1) * 100
        )::integer,
        last_activity_at = now(),
        updated_at = now()
    returning correct_answers, total_answers
    into v_correct_answers, v_total_answers;

    update public.profiles
       set xp = xp + v_xp_earned
     where id = v_user_id;
    if not found then
        raise exception 'Perfil do estudante não encontrado.' using errcode = 'P0002';
    end if;

    return jsonb_build_object(
        'is_correct', p_is_correct,
        'correct_answers', v_correct_answers,
        'total_answers', v_total_answers,
        'xp_earned', v_xp_earned
    );
end;
$$;

revoke all on function public.record_ai_question_attempt(uuid, text, text, text, boolean, integer)
    from public, anon;
grant execute on function public.record_ai_question_attempt(uuid, text, text, text, boolean, integer)
    to authenticated;

create or replace function public.claim_question_mission(p_mission_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user_id uuid := auth.uid();
    v_mission record;
    v_period date;
    v_count integer;
    v_balance integer;
begin
    if v_user_id is null then
        raise exception 'Autenticação necessária.' using errcode = '42501';
    end if;
    select * into v_mission
    from public.missions
    where id = p_mission_id and is_active and mission_type = 'questions';
    if not found then
        raise exception 'Missão indisponível.' using errcode = '22023';
    end if;
    perform 1 from public.profiles where id = v_user_id for update;
    if not found then
        raise exception 'Perfil não encontrado.' using errcode = 'P0002';
    end if;

    v_period := case
        when v_mission.cadence = 'weekly'
            then date_trunc('week', now() at time zone 'UTC')::date
        else (now() at time zone 'UTC')::date
    end;
    perform pg_advisory_xact_lock(
        hashtext(v_user_id::text),
        hashtext(p_mission_id || v_period::text)
    );

    if v_mission.id = 'daily-math-3' then
        select count(*)::integer into v_count
        from (
            select a.question_id as id
            from public.question_attempts a
            join public.questions q on q.id = a.question_id
            where a.user_id = v_user_id
              and a.created_at >= (v_period::timestamp at time zone 'UTC')
              and q.area = 'matematica'
            union all
            select generated.id
            from public.ai_question_attempts generated
            where generated.user_id = v_user_id
              and generated.created_at >= (v_period::timestamp at time zone 'UTC')
              and generated.area = 'matematica'
        ) attempts;
    else
        select count(*)::integer into v_count
        from (
            select a.question_id as id
            from public.question_attempts a
            where a.user_id = v_user_id
              and a.created_at >= (v_period::timestamp at time zone 'UTC')
            union all
            select generated.id
            from public.ai_question_attempts generated
            where generated.user_id = v_user_id
              and generated.created_at >= (v_period::timestamp at time zone 'UTC')
        ) attempts;
    end if;

    insert into public.mission_progress (
        user_id, mission_id, period_start, progress_count, completed_at
    ) values (
        v_user_id, p_mission_id, v_period,
        least(v_count, v_mission.target_count),
        case when v_count >= v_mission.target_count then now() end
    )
    on conflict (user_id, mission_id, period_start) do update
    set progress_count = excluded.progress_count,
        completed_at = coalesce(public.mission_progress.completed_at, excluded.completed_at);

    if v_count < v_mission.target_count then
        raise exception 'Missão ainda não concluída.' using errcode = '22023';
    end if;
    update public.mission_progress
       set claimed_at = now()
     where user_id = v_user_id and mission_id = p_mission_id
       and period_start = v_period and claimed_at is null;
    if not found then
        raise exception 'Recompensa desta missão já resgatada.' using errcode = '23505';
    end if;

    update public.profiles
       set xp = xp + v_mission.reward_xp,
           coins = coins + v_mission.reward_coins
     where id = v_user_id
    returning coins into v_balance;

    if v_mission.reward_coins > 0 then
        insert into public.coin_transactions (
            user_id, amount, balance_after, reason, source_key
        ) values (
            v_user_id, v_mission.reward_coins, v_balance, 'mission_reward',
            'mission:' || v_user_id::text || ':' || p_mission_id || ':' || v_period::text
        );
    end if;

    return jsonb_build_object(
        'progress', v_count,
        'target', v_mission.target_count,
        'xp', v_mission.reward_xp,
        'coins', v_mission.reward_coins,
        'balance', v_balance
    );
end;
$$;
revoke all on function public.claim_question_mission(text) from public, anon;
grant execute on function public.claim_question_mission(text) to authenticated;

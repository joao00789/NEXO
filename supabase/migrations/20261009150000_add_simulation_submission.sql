-- Registra uma sessão completa como uma única transação: uma resposta inválida
-- não deixa o simulado parcialmente gravado.
create or replace function public.submit_simulation_answers(p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_answer jsonb;
    v_question_id uuid;
    v_option_id uuid;
    v_elapsed_seconds integer;
    v_answer_result jsonb;
    v_results jsonb := '[]'::jsonb;
    v_count integer;
    v_correct_count integer := 0;
begin
    if v_user_id is null then
        raise exception 'Autenticação necessária.' using errcode = '42501';
    end if;
    if p_answers is null or jsonb_typeof(p_answers) <> 'array' then
        raise exception 'As respostas do simulado são inválidas.' using errcode = '22023';
    end if;

    v_count := jsonb_array_length(p_answers);
    if v_count < 1 or v_count > 20 then
        raise exception 'O simulado deve conter de 1 a 20 respostas.' using errcode = '22023';
    end if;

    if exists (
        select 1
        from jsonb_array_elements(p_answers) as entry(value)
        where jsonb_typeof(entry.value) <> 'object'
           or jsonb_typeof(entry.value->'question_id') <> 'string'
           or jsonb_typeof(entry.value->'option_id') <> 'string'
           or jsonb_typeof(entry.value->'elapsed_seconds') <> 'number'
           or (entry.value->>'elapsed_seconds')::numeric <> trunc((entry.value->>'elapsed_seconds')::numeric)
           or (entry.value->>'elapsed_seconds')::integer not between 0 and 3600
    ) then
        raise exception 'Uma ou mais respostas do simulado são inválidas.' using errcode = '22023';
    end if;

    if (
        select count(distinct entry.value->>'question_id')
        from jsonb_array_elements(p_answers) as entry(value)
    ) <> v_count then
        raise exception 'O simulado contém questões repetidas.' using errcode = '22023';
    end if;

    for v_answer in
        select entry.value
        from jsonb_array_elements(p_answers) with ordinality as entry(value, position)
        order by entry.position
    loop
        v_question_id := (v_answer->>'question_id')::uuid;
        v_option_id := (v_answer->>'option_id')::uuid;
        v_elapsed_seconds := (v_answer->>'elapsed_seconds')::integer;
        v_answer_result := public.submit_practice_answer(
            v_question_id,
            v_option_id,
            v_elapsed_seconds
        );
        v_results := v_results || jsonb_build_array(
            v_answer_result || jsonb_build_object('question_id', v_question_id)
        );
        if (v_answer_result->>'is_correct')::boolean then
            v_correct_count := v_correct_count + 1;
        end if;
    end loop;

    return jsonb_build_object(
        'results', v_results,
        'correct_count', v_correct_count,
        'total_count', v_count
    );
end;
$$;

revoke all on function public.submit_simulation_answers(jsonb) from public, anon;
grant execute on function public.submit_simulation_answers(jsonb) to authenticated;

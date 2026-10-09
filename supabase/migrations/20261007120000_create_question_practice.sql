-- Banco de questões e tentativas. A resposta correta só é retornada após o envio.
create table if not exists public.questions (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    area text not null check (area in ('matematica', 'linguagens', 'humanas', 'natureza')),
    subject text not null check (length(trim(subject)) between 2 and 100),
    topic text not null check (length(trim(topic)) between 2 and 160),
    difficulty text not null check (difficulty in ('facil', 'medio', 'dificil', 'enem')),
    statement text not null check (length(trim(statement)) between 10 and 10000),
    explanation text not null check (length(trim(explanation)) between 5 and 10000),
    source text not null default 'NEXO',
    origin text not null default 'manual'
        check (origin in ('oficial', 'licenciada', 'adaptada', 'gerada_ia', 'manual')),
    status text not null default 'draft'
        check (status in ('draft', 'review', 'approved', 'archived')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Completa tabelas questions que já existiam com um schema antigo.
alter table public.questions add column if not exists slug text;
alter table public.questions add column if not exists area text default 'matematica';
alter table public.questions add column if not exists subject text default 'Matemática';
alter table public.questions add column if not exists topic text default 'Tema pendente';
alter table public.questions add column if not exists difficulty text default 'medio';
alter table public.questions add column if not exists statement text default 'Enunciado pendente de revisão.';
alter table public.questions add column if not exists explanation text default 'Explicação pendente de revisão.';
alter table public.questions add column if not exists source text default 'NEXO';
alter table public.questions add column if not exists origin text default 'manual';
alter table public.questions add column if not exists status text default 'draft';
alter table public.questions add column if not exists created_at timestamptz default now();
alter table public.questions add column if not exists updated_at timestamptz default now();

-- Remove checks antigos de dificuldade (alguns bancos usavam easy/medium/hard)
-- para normalizar os dados e aplicar a escala usada pela prática do NEXO.
do $$
declare
    v_constraint record;
begin
    for v_constraint in
        select constraint_row.conname
        from pg_constraint constraint_row
        where constraint_row.conrelid = 'public.questions'::regclass
          and constraint_row.contype = 'c'
          and pg_get_constraintdef(constraint_row.oid) ilike '%difficulty%'
    loop
        execute format('alter table public.questions drop constraint %I', v_constraint.conname);
    end loop;
end;
$$;

update public.questions
set area = coalesce(nullif(trim(area), ''), 'matematica'),
    subject = coalesce(nullif(trim(subject), ''), 'Matemática'),
    topic = coalesce(nullif(trim(topic), ''), 'Tema pendente'),
    difficulty = case lower(coalesce(nullif(trim(difficulty), ''), 'medio'))
        when 'easy' then 'facil'
        when 'beginner' then 'facil'
        when 'medium' then 'medio'
        when 'intermediate' then 'medio'
        when 'hard' then 'dificil'
        when 'advanced' then 'dificil'
        when 'expert' then 'enem'
        when 'facil' then 'facil'
        when 'medio' then 'medio'
        when 'dificil' then 'dificil'
        when 'enem' then 'enem'
        else 'medio'
    end,
    statement = coalesce(nullif(trim(statement), ''), 'Enunciado pendente de revisão.'),
    explanation = coalesce(nullif(trim(explanation), ''), 'Explicação pendente de revisão.'),
    source = coalesce(nullif(trim(source), ''), 'NEXO'),
    origin = coalesce(nullif(trim(origin), ''), 'manual'),
    status = coalesce(nullif(trim(status), ''), 'draft'),
    created_at = coalesce(created_at, now()),
    updated_at = coalesce(updated_at, now());

alter table public.questions alter column area set not null;
update public.questions
set slug = 'legacy-' || id::text
where slug is null or trim(slug) = '';
alter table public.questions alter column slug set not null;
create unique index if not exists questions_slug_unique_idx on public.questions (slug);
alter table public.questions alter column subject set not null;
alter table public.questions alter column topic set not null;
alter table public.questions alter column difficulty set not null;
alter table public.questions alter column statement set not null;
alter table public.questions alter column explanation set not null;
alter table public.questions alter column source set not null;
alter table public.questions alter column origin set not null;
alter table public.questions alter column status set not null;
alter table public.questions alter column created_at set not null;
alter table public.questions alter column updated_at set not null;
alter table public.questions drop constraint if exists questions_difficulty_supported_check;
alter table public.questions add constraint questions_difficulty_supported_check
    check (difficulty in ('facil', 'medio', 'dificil', 'enem'));

create table if not exists public.question_options (
    id uuid primary key default gen_random_uuid(),
    question_id uuid not null references public.questions(id) on delete cascade,
    label text not null check (label in ('A', 'B', 'C', 'D', 'E')),
    content text not null check (length(trim(content)) between 1 and 2000),
    is_correct boolean not null default false,
    created_at timestamptz not null default now(),
    constraint question_options_label_unique unique (question_id, label),
    constraint question_options_id_question_unique unique (id, question_id)
);

create unique index if not exists question_options_one_correct_idx
    on public.question_options (question_id)
    where is_correct;

create table if not exists public.question_attempts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    question_id uuid not null references public.questions(id) on delete restrict,
    selected_option_id uuid not null,
    is_correct boolean not null,
    elapsed_seconds integer not null default 0 check (elapsed_seconds between 0 and 3600),
    created_at timestamptz not null default now(),
    constraint question_attempts_selected_option_fk
        foreign key (selected_option_id, question_id)
        references public.question_options (id, question_id)
);

create index if not exists questions_practice_filter_idx
    on public.questions (area, difficulty, status);
create index if not exists question_attempts_user_created_idx
    on public.question_attempts (user_id, created_at desc);
create index if not exists question_attempts_user_question_idx
    on public.question_attempts (user_id, question_id);

-- A tabela pode não existir em bancos que não aplicaram a migration-base.
create table if not exists public.study_progress (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    area text not null check (area in ('matematica', 'linguagens', 'humanas', 'natureza')),
    score integer not null default 0 check (score between 0 and 100),
    correct_answers integer not null default 0 check (correct_answers >= 0),
    total_answers integer not null default 0 check (total_answers >= 0),
    last_activity_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint study_progress_area_answers check (total_answers >= correct_answers)
);

alter table public.study_progress enable row level security;
drop policy if exists "Usuários podem visualizar seu progresso" on public.study_progress;
create policy "Usuários podem visualizar seu progresso"
on public.study_progress for select
using (auth.uid() = user_id);
drop policy if exists "Usuários podem atualizar seu progresso" on public.study_progress;
drop policy if exists "Usuários podem atualizar seu progresso existente" on public.study_progress;
drop policy if exists "Usuários podem excluir seu progresso" on public.study_progress;
revoke insert, update, delete on public.study_progress from anon, authenticated;

-- Consolida registros antigos antes de garantir uma linha de progresso por área.
with ranked_progress as (
    select progress.id,
        row_number() over (
            partition by progress.user_id, progress.area
            order by progress.updated_at desc, progress.created_at desc, progress.id
        ) as row_number,
        sum(progress.correct_answers) over (
            partition by progress.user_id, progress.area
        )::integer as correct_answers,
        sum(progress.total_answers) over (
            partition by progress.user_id, progress.area
        )::integer as total_answers,
        max(progress.last_activity_at) over (
            partition by progress.user_id, progress.area
        ) as last_activity_at
    from public.study_progress progress
)
update public.study_progress progress
   set correct_answers = ranked.correct_answers,
       total_answers = ranked.total_answers,
       score = case when ranked.total_answers = 0 then 0 else
           round(ranked.correct_answers::numeric * 100 / ranked.total_answers)::integer end,
       last_activity_at = ranked.last_activity_at
  from ranked_progress ranked
 where ranked.row_number = 1 and ranked.id = progress.id;

with ranked_progress as (
    select progress.id,
        row_number() over (
            partition by progress.user_id, progress.area
            order by progress.updated_at desc, progress.created_at desc, progress.id
        ) as row_number
    from public.study_progress progress
)
delete from public.study_progress progress
 using ranked_progress ranked
 where ranked.row_number > 1 and ranked.id = progress.id;

create unique index if not exists study_progress_user_area_unique_idx
    on public.study_progress (user_id, area);

alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.question_attempts enable row level security;

drop policy if exists "Questões aprovadas são visíveis" on public.questions;
create policy "Questões aprovadas são visíveis"
on public.questions for select
using (status = 'approved');

drop policy if exists "Usuário visualiza suas tentativas" on public.question_attempts;
create policy "Usuário visualiza suas tentativas"
on public.question_attempts for select
using (auth.uid() = user_id);

-- Opções ficam sem policy de leitura direta para não revelar is_correct.
revoke all on public.question_options from anon, authenticated;
revoke insert, update, delete on public.question_attempts from anon, authenticated;

drop function if exists public.get_practice_questions(text, text, integer);

create or replace function public.get_practice_questions(
    p_area text default null,
    p_difficulty text default null,
    p_subject text default null,
    p_topic text default null,
    p_limit integer default 10
)
returns table (
    question_id uuid,
    area text,
    subject text,
    topic text,
    difficulty text,
    statement text,
    options jsonb
)
language sql
security definer
set search_path = public
as $$
    select q.id, q.area, q.subject, q.topic, q.difficulty, q.statement,
        (
            select jsonb_agg(jsonb_build_object(
                'id', o.id,
                'label', o.label,
                'content', o.content
            ) order by o.label)
            from public.question_options o
            where o.question_id = q.id
        ) as options
    from (
        select question.*
        from public.questions question
        where question.status = 'approved'
          and (p_area is null or question.area = p_area)
          and (p_difficulty is null or question.difficulty = p_difficulty)
          and (p_subject is null or lower(question.subject) = lower(trim(p_subject)))
          and (p_topic is null or lower(question.topic) = lower(trim(p_topic)))
        order by random()
        limit greatest(1, least(coalesce(p_limit, 10), 20))
    ) q
    where exists (
        select 1 from public.question_options opt
        where opt.question_id = q.id
        group by opt.question_id
        having count(*) between 2 and 5 and bool_or(opt.is_correct)
    );
$$;

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
    v_explanation text;
    v_correct_option_id uuid;
    v_is_correct boolean;
    v_progress_id uuid;
    v_correct_answers integer;
    v_total_answers integer;
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

    insert into public.question_attempts (
        user_id, question_id, selected_option_id, is_correct, elapsed_seconds
    ) values (
        v_user_id, p_question_id, p_option_id, v_is_correct, p_elapsed_seconds
    );

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

revoke all on function public.get_practice_questions(text, text, text, text, integer) from public, anon;
grant execute on function public.get_practice_questions(text, text, text, text, integer) to authenticated;
revoke all on function public.submit_practice_answer(uuid, uuid, integer) from public, anon;
grant execute on function public.submit_practice_answer(uuid, uuid, integer) to authenticated;

-- Questão de exemplo compatível com o schema antigo (texto) e com o catálogo
-- normalizado já existente em alguns projetos (subject_id/topic_id/subtopic_id).
do $$
declare
    v_subject_id uuid;
    v_topic_id uuid;
    v_subtopic_id uuid;
    v_columns text[] := array[
        'id', 'slug', 'area', 'subject', 'topic', 'difficulty', 'statement',
        'explanation', 'source', 'origin', 'status'
    ];
    v_values text[] := array[
        quote_literal('a1070000-0000-4000-8000-000000000001'),
        quote_literal('nexo-desconto-porcentagem'),
        quote_literal('matematica'), quote_literal('Matemática'), quote_literal('Porcentagem'),
        quote_literal('facil'),
        quote_literal('Uma mochila custa R$ 240 após receber um desconto de 20% sobre o preço original. Qual era o preço antes do desconto?'),
        quote_literal('Se o desconto foi de 20%, o preço final representa 80% do preço original. Assim, 240 ÷ 0,8 = 300. O preço original era R$ 300.'),
        quote_literal('Questão original NEXO'), quote_literal('manual'), quote_literal('approved')
    ];
    v_sql text;
begin
    if to_regclass('public.subjects') is not null
       and to_regclass('public.topics') is not null
       and to_regclass('public.subtopics') is not null then
        execute 'select id from public.subjects where slug = $1 limit 1'
            into v_subject_id using 'matematica';
        if v_subject_id is null then
            if exists (select 1 from information_schema.columns where table_schema='public' and table_name='subjects' and column_name='area') then
                execute $sql$
                    insert into public.subjects (name, slug, area)
                    values ('Matemática', 'matematica', 'Matemática')
                    returning id
                $sql$ into v_subject_id;
            else
                execute $sql$
                    insert into public.subjects (name, slug)
                    values ('Matemática', 'matematica')
                    returning id
                $sql$ into v_subject_id;
            end if;
        end if;

        execute 'select id from public.topics where subject_id = $1 and slug = $2 limit 1'
            into v_topic_id using v_subject_id, 'porcentagem';
        if v_topic_id is null then
            execute $sql$
                insert into public.topics (subject_id, name, slug)
                values ($1, 'Porcentagem', 'porcentagem')
                returning id
            $sql$ into v_topic_id using v_subject_id;
        end if;

        execute 'select id from public.subtopics where topic_id = $1 and slug = $2 limit 1'
            into v_subtopic_id using v_topic_id, 'desconto-percentual';
        if v_subtopic_id is null then
            execute $sql$
                insert into public.subtopics (topic_id, name, slug)
                values ($1, 'Desconto percentual', 'desconto-percentual')
                returning id
            $sql$ into v_subtopic_id using v_topic_id;
        end if;

        if exists (select 1 from information_schema.columns where table_schema='public' and table_name='questions' and column_name='subject_id') then
            v_columns := array_append(v_columns, 'subject_id');
            v_values := array_append(v_values, quote_literal(v_subject_id));
        end if;
        if exists (select 1 from information_schema.columns where table_schema='public' and table_name='questions' and column_name='topic_id') then
            v_columns := array_append(v_columns, 'topic_id');
            v_values := array_append(v_values, quote_literal(v_topic_id));
        end if;
        if exists (select 1 from information_schema.columns where table_schema='public' and table_name='questions' and column_name='subtopic_id') then
            v_columns := array_append(v_columns, 'subtopic_id');
            v_values := array_append(v_values, quote_literal(v_subtopic_id));
        end if;
    end if;

    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='questions' and column_name='question_type') then
        v_columns := array_append(v_columns, 'question_type');
        v_values := array_append(v_values, quote_literal('multiple_choice'));
    end if;
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='questions' and column_name='options') then
        v_columns := array_append(v_columns, 'options');
        v_values := array_append(v_values, quote_literal('[{"label":"A","content":"R$ 288"},{"label":"B","content":"R$ 300"},{"label":"C","content":"R$ 320"},{"label":"D","content":"R$ 360"},{"label":"E","content":"R$ 400"}]') || '::jsonb');
    end if;
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='questions' and column_name='correct_answer') then
        v_columns := array_append(v_columns, 'correct_answer');
        v_values := array_append(v_values, quote_literal('B'));
    end if;
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='questions' and column_name='source_label') then
        v_columns := array_append(v_columns, 'source_label');
        v_values := array_append(v_values, quote_literal('Questão original NEXO'));
    end if;
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='questions' and column_name='is_official') then
        v_columns := array_append(v_columns, 'is_official');
        v_values := array_append(v_values, 'false');
    end if;

    v_sql := format(
        'insert into public.questions (%s) values (%s) on conflict (id) do nothing',
        array_to_string(v_columns, ', '), array_to_string(v_values, ', ')
    );
    execute v_sql;
end;
$$;

do $$
begin
    if exists (
        select 1 from information_schema.columns
        where table_schema = 'public'
          and table_name = 'question_options'
          and column_name = 'position'
    ) then
        insert into public.question_options (id, question_id, label, content, is_correct, position) values
            ('a1070000-0000-4000-8000-000000000011', 'a1070000-0000-4000-8000-000000000001', 'A', 'R$ 288', false, 1),
            ('a1070000-0000-4000-8000-000000000012', 'a1070000-0000-4000-8000-000000000001', 'B', 'R$ 300', true, 2),
            ('a1070000-0000-4000-8000-000000000013', 'a1070000-0000-4000-8000-000000000001', 'C', 'R$ 320', false, 3),
            ('a1070000-0000-4000-8000-000000000014', 'a1070000-0000-4000-8000-000000000001', 'D', 'R$ 360', false, 4),
            ('a1070000-0000-4000-8000-000000000015', 'a1070000-0000-4000-8000-000000000001', 'E', 'R$ 400', false, 5)
        on conflict (id) do nothing;
    else
        insert into public.question_options (id, question_id, label, content, is_correct) values
            ('a1070000-0000-4000-8000-000000000011', 'a1070000-0000-4000-8000-000000000001', 'A', 'R$ 288', false),
            ('a1070000-0000-4000-8000-000000000012', 'a1070000-0000-4000-8000-000000000001', 'B', 'R$ 300', true),
            ('a1070000-0000-4000-8000-000000000013', 'a1070000-0000-4000-8000-000000000001', 'C', 'R$ 320', false),
            ('a1070000-0000-4000-8000-000000000014', 'a1070000-0000-4000-8000-000000000001', 'D', 'R$ 360', false),
            ('a1070000-0000-4000-8000-000000000015', 'a1070000-0000-4000-8000-000000000001', 'E', 'R$ 400', false)
        on conflict (id) do nothing;
    end if;
end;
$$;

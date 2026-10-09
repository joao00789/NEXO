-- Criação da base de perfil e progresso para a primeira versão do NEXO.
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null check (length(trim(full_name)) between 2 and 80),
    display_name text,
    avatar_url text,
    level integer not null default 1 check (level >= 1),
    xp integer not null default 0 check (xp >= 0),
    coins integer not null default 0 check (coins >= 0),
    streak_days integer not null default 0 check (streak_days >= 0),
    estimated_score integer not null default 0 check (estimated_score between 0 and 1000),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

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

create unique index if not exists profiles_display_name_unique
    on public.profiles (lower(display_name))
    where display_name is not null;

create index if not exists profiles_level_idx on public.profiles (level);
create index if not exists study_progress_user_area_idx on public.study_progress (user_id, area);
create index if not exists study_progress_updated_at_idx on public.study_progress (updated_at desc);

alter table public.profiles enable row level security;
alter table public.study_progress enable row level security;

drop policy if exists "Usuários podem visualizar seu próprio perfil" on public.profiles;
create policy "Usuários podem visualizar seu próprio perfil"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Usuários podem atualizar seu próprio perfil" on public.profiles;
create policy "Usuários podem atualizar seu próprio perfil"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Usuários podem visualizar seu progresso" on public.study_progress;
create policy "Usuários podem visualizar seu progresso"
on public.study_progress
for select
using (auth.uid() = user_id);

drop policy if exists "Usuários podem atualizar seu progresso" on public.study_progress;
create policy "Usuários podem atualizar seu progresso"
on public.study_progress
for insert
with check (auth.uid() = user_id);

drop policy if exists "Usuários podem atualizar seu progresso existente" on public.study_progress;
create policy "Usuários podem atualizar seu progresso existente"
on public.study_progress
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Usuários podem excluir seu progresso" on public.study_progress;
create policy "Usuários podem excluir seu progresso"
on public.study_progress
for delete
using (auth.uid() = user_id);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

drop trigger if exists study_progress_updated_at on public.study_progress;
create trigger study_progress_updated_at
before update on public.study_progress
for each row
execute function public.handle_updated_at();

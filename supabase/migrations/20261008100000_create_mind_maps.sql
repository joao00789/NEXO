-- Mapas mentais editáveis de cada estudante.
create table if not exists public.mind_maps (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    title text not null check (length(trim(title)) between 2 and 120),
    subject text not null check (length(trim(subject)) between 2 and 100),
    topic text not null check (length(trim(topic)) between 2 and 160),
    nodes jsonb not null default '[]'::jsonb
        check (case when jsonb_typeof(nodes) = 'array' then jsonb_array_length(nodes) between 1 and 40 else false end),
    edges jsonb not null default '[]'::jsonb
        check (case when jsonb_typeof(edges) = 'array' then jsonb_array_length(edges) <= 80 else false end),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists mind_maps_user_updated_idx
    on public.mind_maps (user_id, updated_at desc);

alter table public.mind_maps enable row level security;

drop policy if exists "Estudante visualiza seus mapas mentais" on public.mind_maps;
create policy "Estudante visualiza seus mapas mentais"
on public.mind_maps for select
using (auth.uid() = user_id);

drop policy if exists "Estudante cria seus mapas mentais" on public.mind_maps;
create policy "Estudante cria seus mapas mentais"
on public.mind_maps for insert
with check (auth.uid() = user_id);

drop policy if exists "Estudante atualiza seus mapas mentais" on public.mind_maps;
create policy "Estudante atualiza seus mapas mentais"
on public.mind_maps for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Estudante exclui seus mapas mentais" on public.mind_maps;
create policy "Estudante exclui seus mapas mentais"
on public.mind_maps for delete
using (auth.uid() = user_id);

revoke all on public.mind_maps from anon;
grant select, insert, update, delete on public.mind_maps to authenticated;

-- Cria o perfil dentro da mesma transação que cria o usuário no Supabase Auth.
-- Compatibilidade com instalações onde `profiles` já existia antes da migration-base.
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists level integer default 1;
alter table public.profiles add column if not exists xp integer default 0;
alter table public.profiles add column if not exists coins integer default 0;
alter table public.profiles add column if not exists streak_days integer default 0;
alter table public.profiles add column if not exists estimated_score integer default 0;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- Mantém nomes antigos quando existirem; corrige valores ausentes ou fora do limite.
do $$
declare
    v_expression text := 'NULLIF(trim(full_name), '''')';
    v_candidate text;
begin
    foreach v_candidate in array array['name', 'display_name', 'username'] loop
        if exists (
            select 1 from information_schema.columns
            where table_schema = 'public'
              and table_name = 'profiles'
              and column_name = v_candidate
        ) then
            v_expression := format(
                'COALESCE(%s, NULLIF(trim(%I::text), ''''))',
                v_expression,
                v_candidate
            );
        end if;
    end loop;

    execute format(
        'UPDATE public.profiles SET full_name = CASE '
        'WHEN length(trim(%1$s)) BETWEEN 2 AND 80 THEN left(trim(%1$s), 80) '
        'ELSE ''Estudante'' END',
        v_expression
    );
end;
$$;

update public.profiles
set level = greatest(coalesce(level, 1), 1),
    xp = greatest(coalesce(xp, 0), 0),
    coins = greatest(coalesce(coins, 0), 0),
    streak_days = greatest(coalesce(streak_days, 0), 0),
    estimated_score = least(greatest(coalesce(estimated_score, 0), 0), 1000),
    created_at = coalesce(created_at, now()),
    updated_at = coalesce(updated_at, now());

alter table public.profiles alter column full_name set default 'Estudante';
alter table public.profiles alter column full_name set not null;
alter table public.profiles alter column level set default 1;
alter table public.profiles alter column level set not null;
alter table public.profiles alter column xp set default 0;
alter table public.profiles alter column xp set not null;
alter table public.profiles alter column coins set default 0;
alter table public.profiles alter column coins set not null;
alter table public.profiles alter column streak_days set default 0;
alter table public.profiles alter column streak_days set not null;
alter table public.profiles alter column estimated_score set default 0;
alter table public.profiles alter column estimated_score set not null;
alter table public.profiles alter column created_at set default now();
alter table public.profiles alter column created_at set not null;
alter table public.profiles alter column updated_at set default now();
alter table public.profiles alter column updated_at set not null;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_full_name text;
begin
    v_full_name := left(
        regexp_replace(
            trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')),
            '[[:space:]]+', ' ', 'g'
        ),
        80
    );

    if length(v_full_name) < 2 then
        v_full_name := left(trim(coalesce(split_part(new.email, '@', 1), '')), 80);
    end if;

    if length(v_full_name) < 2 then
        v_full_name := 'Estudante';
    end if;

    insert into public.profiles (id, full_name)
    values (new.id, v_full_name)
    on conflict (id) do nothing;

    return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

-- Corrige contas que foram criadas antes do trigger e ficaram sem perfil.
insert into public.profiles (id, full_name)
select
    users.id,
    case
        when length(trim(coalesce(users.raw_user_meta_data ->> 'full_name', ''))) >= 2
            then left(trim(users.raw_user_meta_data ->> 'full_name'), 80)
        when length(trim(coalesce(split_part(users.email, '@', 1), ''))) >= 2
            then left(trim(split_part(users.email, '@', 1)), 80)
        else 'Estudante'
    end
from auth.users users
where not exists (
    select 1
    from public.profiles profiles
    where profiles.id = users.id
)
on conflict (id) do nothing;

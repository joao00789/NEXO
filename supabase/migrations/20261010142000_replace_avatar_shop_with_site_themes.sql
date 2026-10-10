-- A loja passa a vender temas visuais; compras de avatar existentes permanecem intactas.
create table if not exists public.site_themes (
    id text primary key check (id in ('aurora', 'nebula', 'sunrise')),
    name text not null check (length(trim(name)) between 2 and 80),
    description text not null check (length(trim(description)) between 2 and 240),
    price integer not null check (price between 1 and 10000),
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

insert into public.site_themes (id, name, description, price)
values
    ('aurora', 'Aurora', 'Verde profundo, brilho suave e entrada leve para cada tela.', 180),
    ('nebula', 'Nebulosa', 'Violeta noturno com transições discretas e atmosfera cósmica.', 240),
    ('sunrise', 'Amanhecer', 'Tons quentes, contraste confortável e movimento acolhedor.', 210)
on conflict (id) do update
set name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    is_active = true;

create table if not exists public.user_site_themes (
    user_id uuid not null references public.profiles(id) on delete cascade,
    theme_id text not null references public.site_themes(id) on delete restrict,
    acquired_at timestamptz not null default now(),
    primary key (user_id, theme_id)
);

create index if not exists user_site_themes_user_idx
    on public.user_site_themes (user_id);

alter table public.profiles
    add column if not exists active_theme_id text
    references public.site_themes(id) on delete set null;

alter table public.site_themes enable row level security;
alter table public.user_site_themes enable row level security;

drop policy if exists "Temas ativos são visíveis" on public.site_themes;
create policy "Temas ativos são visíveis"
on public.site_themes for select
to authenticated
using (is_active);

drop policy if exists "Estudante vê seus temas" on public.user_site_themes;
create policy "Estudante vê seus temas"
on public.user_site_themes for select
to authenticated
using (auth.uid() = user_id);

revoke all on public.site_themes, public.user_site_themes from public, anon, authenticated;
grant select on public.site_themes, public.user_site_themes to authenticated;

alter table public.coin_transactions
    drop constraint if exists coin_transactions_reason_check;
alter table public.coin_transactions
    add constraint coin_transactions_reason_check
    check (reason in (
        'opening_balance',
        'question_answered',
        'question_correct',
        'cosmetic_purchase',
        'mission_reward',
        'theme_purchase'
    ));

create or replace function public.purchase_site_theme(p_theme_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user_id uuid := auth.uid();
    v_price integer;
    v_balance integer;
begin
    if v_user_id is null then
        raise exception 'Autenticação necessária.' using errcode = '42501';
    end if;

    select theme.price into v_price
    from public.site_themes theme
    where theme.id = p_theme_id and theme.is_active;
    if not found then
        raise exception 'Tema indisponível.' using errcode = '22023';
    end if;

    select profile.coins into v_balance
    from public.profiles profile
    where profile.id = v_user_id
    for update;
    if not found then
        raise exception 'Perfil não encontrado.' using errcode = 'P0002';
    end if;

    if exists (
        select 1 from public.user_site_themes owned
        where owned.user_id = v_user_id and owned.theme_id = p_theme_id
    ) then
        raise exception 'Você já possui este tema.' using errcode = '23505';
    end if;
    if v_balance < v_price then
        raise exception 'Saldo insuficiente.' using errcode = '22023';
    end if;

    update public.profiles
    set coins = coins - v_price
    where id = v_user_id
    returning coins into v_balance;

    insert into public.coin_transactions (user_id, amount, balance_after, reason, source_key)
    values (
        v_user_id,
        -v_price,
        v_balance,
        'theme_purchase',
        'theme-purchase:' || v_user_id::text || ':' || p_theme_id
    );

    insert into public.user_site_themes (user_id, theme_id)
    values (v_user_id, p_theme_id);

    return jsonb_build_object('balance', v_balance, 'theme_id', p_theme_id);
end;
$$;

create or replace function public.set_active_site_theme(p_theme_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user_id uuid := auth.uid();
    v_active_theme_id text;
begin
    if v_user_id is null then
        raise exception 'Autenticação necessária.' using errcode = '42501';
    end if;

    if p_theme_id is not null and not exists (
        select 1 from public.user_site_themes owned
        where owned.user_id = v_user_id and owned.theme_id = p_theme_id
    ) then
        raise exception 'Você precisa possuir este tema para ativá-lo.' using errcode = '42501';
    end if;

    update public.profiles
    set active_theme_id = p_theme_id
    where id = v_user_id
    returning active_theme_id into v_active_theme_id;
    if not found then
        raise exception 'Perfil não encontrado.' using errcode = 'P0002';
    end if;

    return jsonb_build_object('active_theme_id', v_active_theme_id);
end;
$$;

revoke all on function public.purchase_site_theme(text) from public, anon;
grant execute on function public.purchase_site_theme(text) to authenticated;
revoke all on function public.set_active_site_theme(text) from public, anon;
grant execute on function public.set_active_site_theme(text) to authenticated;

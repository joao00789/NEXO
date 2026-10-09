-- Catálogo cosmético, inventário e ledger de NEXO Coins.
create table if not exists public.cosmetic_items (
    id text primary key check (id ~ '^[a-z0-9-]{2,80}$'),
    name text not null check (length(trim(name)) between 2 and 80),
    description text not null check (length(trim(description)) between 2 and 240),
    category text not null check (category in ('headwear', 'outfit', 'accessory', 'effect', 'background', 'frame')),
    rarity text not null default 'common' check (rarity in ('common', 'uncommon', 'rare', 'epic')),
    icon text not null check (icon in ('graduation-cap', 'shirt', 'glasses', 'headphones', 'sparkles', 'library', 'award', 'crown', 'backpack')),
    accent text not null check (accent in ('blue', 'cyan', 'violet', 'teal', 'amber', 'rose')),
    price integer not null check (price between 1 and 10000),
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists public.user_inventory (
    user_id uuid not null references public.profiles(id) on delete cascade,
    item_id text not null references public.cosmetic_items(id) on delete restrict,
    is_equipped boolean not null default false,
    acquired_at timestamptz not null default now(),
    primary key (user_id, item_id)
);

create index if not exists user_inventory_user_equipped_idx
    on public.user_inventory (user_id, is_equipped);

create table if not exists public.coin_transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    amount integer not null check (amount <> 0),
    balance_after integer not null check (balance_after >= 0),
    reason text not null check (reason in ('opening_balance', 'question_answered', 'question_correct', 'cosmetic_purchase')),
    reference_id uuid,
    source_key text not null unique check (length(source_key) between 3 and 200),
    created_at timestamptz not null default now()
);

create index if not exists coin_transactions_user_created_idx
    on public.coin_transactions (user_id, created_at desc);

alter table public.cosmetic_items enable row level security;
alter table public.user_inventory enable row level security;
alter table public.coin_transactions enable row level security;

drop policy if exists "Catálogo cosmético ativo é visível" on public.cosmetic_items;
create policy "Catálogo cosmético ativo é visível"
on public.cosmetic_items for select
to authenticated
using (is_active);

drop policy if exists "Estudante visualiza seu inventário" on public.user_inventory;
create policy "Estudante visualiza seu inventário"
on public.user_inventory for select
using (auth.uid() = user_id);

drop policy if exists "Estudante visualiza suas transações de moedas" on public.coin_transactions;
create policy "Estudante visualiza suas transações de moedas"
on public.coin_transactions for select
using (auth.uid() = user_id);

revoke all on public.cosmetic_items from anon, authenticated;
grant select on public.cosmetic_items to authenticated;
revoke all on public.user_inventory from anon, authenticated;
grant select on public.user_inventory to authenticated;
revoke all on public.coin_transactions from anon, authenticated;
grant select on public.coin_transactions to authenticated;

-- O perfil continua editável pelo próprio aluno, mas o saldo só muda no servidor.
revoke update on public.profiles from public, anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

insert into public.cosmetic_items (id, name, description, category, rarity, icon, accent, price)
values
    ('cap-blueprint', 'Capelo azul', 'Um capelo para marcar sua jornada de estudos.', 'headwear', 'common', 'graduation-cap', 'blue', 45),
    ('crown-focus', 'Coroa do foco', 'Um detalhe especial para quem mantém a concentração.', 'headwear', 'rare', 'crown', 'amber', 110),
    ('hoodie-midnight', 'Moletom meia-noite', 'Moletom escuro com detalhe azul NEXO.', 'outfit', 'common', 'shirt', 'violet', 75),
    ('jacket-turquoise', 'Jaqueta turquesa', 'Uma jaqueta leve em tom turquesa.', 'outfit', 'uncommon', 'shirt', 'teal', 95),
    ('glasses-lab', 'Óculos de laboratório', 'Armação colorida para suas sessões de foco.', 'accessory', 'common', 'glasses', 'cyan', 55),
    ('headphones-study', 'Fone de concentração', 'Um acessório para entrar no ritmo dos estudos.', 'accessory', 'uncommon', 'headphones', 'rose', 80),
    ('aura-stardust', 'Aura estelar', 'Um brilho discreto ao redor do seu avatar.', 'effect', 'epic', 'sparkles', 'violet', 160),
    ('background-library', 'Biblioteca', 'Um fundo inspirado em um espaço de leitura.', 'background', 'uncommon', 'library', 'amber', 100),
    ('frame-laurel', 'Moldura conquista', 'Uma moldura com símbolo de conquista.', 'frame', 'rare', 'award', 'teal', 130),
    ('backpack-trail', 'Mochila de jornada', 'Uma mochila para acompanhar sua evolução.', 'accessory', 'common', 'backpack', 'blue', 65)
on conflict (id) do nothing;

-- Registra saldos antigos no ledger para manter o histórico coerente.
insert into public.coin_transactions (user_id, amount, balance_after, reason, source_key)
select profiles.id, profiles.coins, profiles.coins, 'opening_balance', 'opening-balance:' || profiles.id::text
from public.profiles profiles
where profiles.coins > 0
on conflict (source_key) do nothing;

create or replace function public.purchase_cosmetic_item(p_item_id text)
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
    if p_item_id is null or length(p_item_id) > 80 then
        raise exception 'Item inválido.' using errcode = '22023';
    end if;

    select item.price into v_price
    from public.cosmetic_items item
    where item.id = p_item_id and item.is_active;
    if not found then
        raise exception 'Item indisponível.' using errcode = '22023';
    end if;

    select profile.coins into v_balance
    from public.profiles profile
    where profile.id = v_user_id
    for update;
    if not found then
        raise exception 'Perfil não encontrado.' using errcode = 'P0002';
    end if;

    if exists (
        select 1 from public.user_inventory inventory
        where inventory.user_id = v_user_id and inventory.item_id = p_item_id
    ) then
        raise exception 'Você já possui este item.' using errcode = '23505';
    end if;
    if v_balance < v_price then
        raise exception 'Saldo insuficiente.' using errcode = '22023';
    end if;

    update public.profiles
    set coins = coins - v_price
    where id = v_user_id
    returning coins into v_balance;

    insert into public.coin_transactions (user_id, amount, balance_after, reason, reference_id, source_key)
    values (v_user_id, -v_price, v_balance, 'cosmetic_purchase', null, 'purchase:' || v_user_id::text || ':' || p_item_id);

    insert into public.user_inventory (user_id, item_id)
    values (v_user_id, p_item_id);

    return jsonb_build_object('balance', v_balance, 'item_id', p_item_id);
end;
$$;

create or replace function public.toggle_cosmetic_equip(p_item_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user_id uuid := auth.uid();
    v_category text;
    v_is_equipped boolean;
begin
    if v_user_id is null then
        raise exception 'Autenticação necessária.' using errcode = '42501';
    end if;

    select item.category, inventory.is_equipped
    into v_category, v_is_equipped
    from public.user_inventory inventory
    join public.cosmetic_items item on item.id = inventory.item_id
    where inventory.user_id = v_user_id and inventory.item_id = p_item_id and item.is_active;
    if not found then
        raise exception 'Este item não está no seu inventário.' using errcode = '42501';
    end if;

    perform pg_advisory_xact_lock(hashtext(v_user_id::text), hashtext(v_category));

    update public.user_inventory inventory
    set is_equipped = false
    from public.cosmetic_items item
    where inventory.user_id = v_user_id
      and inventory.item_id = item.id
      and item.category = v_category
      and inventory.is_equipped;

    if not v_is_equipped then
        update public.user_inventory
        set is_equipped = true
        where user_id = v_user_id and item_id = p_item_id;
    end if;

    return jsonb_build_object('item_id', p_item_id, 'is_equipped', not v_is_equipped, 'category', v_category);
end;
$$;

create or replace function public.reward_question_coins()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_balance integer;
    v_earned_today integer;
    v_day_start timestamptz := (date_trunc('day', new.created_at at time zone 'UTC') at time zone 'UTC');
    v_day_end timestamptz := v_day_start + interval '1 day';
    v_transaction_id uuid;
    v_source_key text;
begin
    perform pg_advisory_xact_lock(hashtext(new.user_id::text), hashtext((new.created_at at time zone 'UTC')::date::text));

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

    v_source_key := 'question-answered:' || new.user_id::text || ':' || new.question_id::text || ':' || (new.created_at at time zone 'UTC')::date::text;
    if v_earned_today + 2 <= 50 then
        insert into public.coin_transactions (user_id, amount, balance_after, reason, reference_id, source_key)
        values (new.user_id, 2, v_balance + 2, 'question_answered', new.id, v_source_key)
        on conflict (source_key) do nothing
        returning id into v_transaction_id;
        if v_transaction_id is not null then
            update public.profiles set coins = coins + 2 where id = new.user_id;
            v_balance := v_balance + 2;
            v_earned_today := v_earned_today + 2;
        end if;
    end if;

    if new.is_correct and v_earned_today + 3 <= 50 then
        v_source_key := 'question-correct:' || new.user_id::text || ':' || new.question_id::text || ':' || (new.created_at at time zone 'UTC')::date::text;
        v_transaction_id := null;
        insert into public.coin_transactions (user_id, amount, balance_after, reason, reference_id, source_key)
        values (new.user_id, 3, v_balance + 3, 'question_correct', new.id, v_source_key)
        on conflict (source_key) do nothing
        returning id into v_transaction_id;
        if v_transaction_id is not null then
            update public.profiles set coins = coins + 3 where id = new.user_id;
        end if;
    end if;

    return new;
end;
$$;

drop trigger if exists question_attempt_coin_reward on public.question_attempts;
create trigger question_attempt_coin_reward
after insert on public.question_attempts
for each row execute function public.reward_question_coins();

revoke all on function public.reward_question_coins() from public, anon, authenticated;
revoke all on function public.purchase_cosmetic_item(text) from public, anon;
grant execute on function public.purchase_cosmetic_item(text) to authenticated;
revoke all on function public.toggle_cosmetic_equip(text) from public, anon;
grant execute on function public.toggle_cosmetic_equip(text) to authenticated;

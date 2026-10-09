-- Missões, redações, coleção de animais e batalhas educativas.

create table if not exists public.missions (
    id text primary key check (id ~ '^[a-z0-9-]{2,80}$'),
    title text not null check (length(trim(title)) between 3 and 100),
    description text not null check (length(trim(description)) between 5 and 240),
    mission_type text not null check (mission_type in ('questions', 'video')),
    target_count integer not null check (target_count between 1 and 1000),
    reward_xp integer not null default 0 check (reward_xp between 0 and 10000),
    reward_coins integer not null default 0 check (reward_coins between 0 and 1000),
    cadence text not null default 'daily' check (cadence in ('daily', 'weekly')),
    is_active boolean not null default true
);

create table if not exists public.mission_progress (
    user_id uuid not null references public.profiles(id) on delete cascade,
    mission_id text not null references public.missions(id) on delete cascade,
    period_start date not null,
    progress_count integer not null default 0 check (progress_count >= 0),
    completed_at timestamptz,
    claimed_at timestamptz,
    primary key (user_id, mission_id, period_start)
);

insert into public.missions (id, title, description, mission_type, target_count, reward_xp, reward_coins, cadence)
values
 ('daily-questions-5', 'Ritmo de estudo', 'Responda 5 questões hoje.', 'questions', 5, 40, 8, 'daily'),
 ('daily-math-3', 'Aquecimento de Matemática', 'Resolva 3 questões de Matemática hoje.', 'questions', 3, 30, 6, 'daily'),
 ('weekly-questions-25', 'Constância semanal', 'Responda 25 questões nesta semana.', 'questions', 25, 150, 25, 'weekly'),
 ('video-lesson-1', 'Uma aula por dia', 'Assista a uma aula de estudo do NEXO.', 'video', 1, 20, 0, 'daily')
on conflict (id) do nothing;

alter table public.missions enable row level security;
alter table public.mission_progress enable row level security;
drop policy if exists "Missões ativas são visíveis" on public.missions;
create policy "Missões ativas são visíveis" on public.missions for select to authenticated using (is_active);
drop policy if exists "Estudante vê seu progresso em missões" on public.mission_progress;
create policy "Estudante vê seu progresso em missões" on public.mission_progress for select to authenticated using (auth.uid() = user_id);
revoke all on public.missions, public.mission_progress from anon, authenticated;
grant select on public.missions, public.mission_progress to authenticated;

-- As recompensas só são concedidas após conferir tentativas registradas no banco.
alter table public.coin_transactions drop constraint if exists coin_transactions_reason_check;
alter table public.coin_transactions add constraint coin_transactions_reason_check
 check (reason in ('opening_balance', 'question_answered', 'question_correct', 'cosmetic_purchase', 'mission_reward'));

create or replace function public.claim_question_mission(p_mission_id text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 v_user_id uuid := auth.uid(); v_mission record; v_period date; v_count integer; v_balance integer;
begin
 if v_user_id is null then raise exception 'Autenticação necessária.' using errcode = '42501'; end if;
 select * into v_mission from public.missions where id = p_mission_id and is_active and mission_type = 'questions';
 if not found then raise exception 'Missão indisponível.' using errcode = '22023'; end if;
 perform 1 from public.profiles where id = v_user_id for update;
 if not found then raise exception 'Perfil não encontrado.' using errcode = 'P0002'; end if;
 v_period := case when v_mission.cadence = 'weekly' then date_trunc('week', now() at time zone 'UTC')::date else (now() at time zone 'UTC')::date end;
 perform pg_advisory_xact_lock(hashtext(v_user_id::text), hashtext(p_mission_id || v_period::text));
 if v_mission.id = 'daily-math-3' then
   select count(distinct a.question_id)::integer into v_count from public.question_attempts a join public.questions q on q.id = a.question_id
    where a.user_id = v_user_id and a.created_at >= (v_period::timestamp at time zone 'UTC') and q.area = 'matematica';
 else
   select count(distinct a.question_id)::integer into v_count from public.question_attempts a
    where a.user_id = v_user_id and a.created_at >= (v_period::timestamp at time zone 'UTC');
 end if;
 insert into public.mission_progress(user_id, mission_id, period_start, progress_count, completed_at)
 values (v_user_id, p_mission_id, v_period, least(v_count, v_mission.target_count), case when v_count >= v_mission.target_count then now() end)
 on conflict (user_id, mission_id, period_start) do update set progress_count = excluded.progress_count, completed_at = coalesce(public.mission_progress.completed_at, excluded.completed_at);
 if v_count < v_mission.target_count then raise exception 'Missão ainda não concluída.' using errcode = '22023'; end if;
 update public.mission_progress set claimed_at = now()
  where user_id = v_user_id and mission_id = p_mission_id and period_start = v_period and claimed_at is null;
 if not found then raise exception 'Recompensa desta missão já resgatada.' using errcode = '23505'; end if;
 update public.profiles set xp = xp + v_mission.reward_xp, coins = coins + v_mission.reward_coins
  where id = v_user_id returning coins into v_balance;
 if v_mission.reward_coins > 0 then
   insert into public.coin_transactions(user_id, amount, balance_after, reason, source_key)
   values (v_user_id, v_mission.reward_coins, v_balance, 'mission_reward', 'mission:' || v_user_id::text || ':' || p_mission_id || ':' || v_period::text);
 end if;
 return jsonb_build_object('progress', v_count, 'target', v_mission.target_count, 'xp', v_mission.reward_xp, 'coins', v_mission.reward_coins, 'balance', v_balance);
end $$;
revoke all on function public.claim_question_mission(text) from public, anon;
grant execute on function public.claim_question_mission(text) to authenticated;

create table if not exists public.essay_themes (
 id text primary key,
 title text not null check (length(trim(title)) between 10 and 240),
 category text not null check (category in ('social', 'ambiental', 'tecnologia', 'educacao', 'cidadania', 'cultura', 'economia')),
 motivation text not null,
 source_label text not null default 'Tema autoral NEXO',
 source_url text,
 is_official boolean not null default false,
 created_at timestamptz not null default now()
);

insert into public.essay_themes (id, title, category, motivation) values
 ('nexo-desinformacao', 'Desafios para combater a desinformação entre jovens no Brasil', 'tecnologia', 'Considere os impactos da circulação de conteúdos falsos na formação cidadã e no debate público.'),
 ('nexo-acessibilidade', 'Caminhos para ampliar a acessibilidade nos espaços públicos brasileiros', 'cidadania', 'Reflita sobre barreiras físicas, comunicacionais e atitudinais enfrentadas por pessoas com deficiência.'),
 ('nexo-desperdicio', 'Medidas para reduzir o desperdício de alimentos no Brasil', 'ambiental', 'Considere a relação entre consumo, distribuição de alimentos e segurança alimentar.'),
 ('nexo-leitura', 'A importância da formação de leitores críticos na sociedade brasileira', 'educacao', 'Discuta o papel da escola, da família e do acesso à cultura na formação leitora.'),
 ('nexo-ansiedade-digital', 'Os efeitos do uso excessivo de redes sociais na saúde de adolescentes', 'social', 'Analise desafios de saúde, convivência e educação midiática ligados ao ambiente digital.'),
 ('nexo-memoria', 'A preservação da memória cultural de comunidades brasileiras', 'cultura', 'Considere como políticas públicas e participação social podem proteger patrimônios e tradições.')
on conflict (id) do nothing;

insert into public.essay_themes(id, title, category, motivation, source_label, source_url, is_official) values
 ('enem-2024-regular', 'Desafios para a valorização da herança africana no Brasil', 'cultura', 'Tema aplicado na prova regular do ENEM 2024. Esta referência serve para treino retrospectivo; consulte a proposta e os textos motivadores oficiais.', 'ENEM 2024 · INEP', 'https://download.inep.gov.br/publicacoes/institucionais/avaliacoes_e_exames_da_educacao_basica/a_redacao_no_enem_2025_cartilha_do_participante.pdf', true),
 ('enem-2023-regular', 'Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil', 'social', 'Tema aplicado na prova regular do ENEM 2023. Esta referência serve para treino retrospectivo; consulte a proposta e os textos motivadores oficiais.', 'ENEM 2023 · INEP', 'https://download.inep.gov.br/enem/provas_e_gabaritos/tema_redacao_2023.pdf', true),
 ('enem-2020-digital', 'O desafio de reduzir as desigualdades entre as regiões do Brasil', 'social', 'Tema da redação do ENEM 2020 Digital, conforme divulgação oficial do INEP.', 'ENEM Digital 2020 · INEP', 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/noticias/enem/desigualdade-regional-e-tema-da-redacao-do-enem-digital', true)
on conflict (id) do nothing;

create table if not exists public.essays (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 theme_id text references public.essay_themes(id) on delete set null,
 theme_title text not null check (length(trim(theme_title)) between 10 and 240),
 body text not null default '' check (length(body) <= 12000),
 correction jsonb,
 submitted_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists essays_user_created_idx on public.essays(user_id, updated_at desc);
alter table public.essay_themes enable row level security;
alter table public.essays enable row level security;
drop policy if exists "Temas de redação visíveis" on public.essay_themes;
create policy "Temas de redação visíveis" on public.essay_themes for select to authenticated using (true);
drop policy if exists "Estudante gerencia suas redações" on public.essays;
create policy "Estudante gerencia suas redações" on public.essays for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
revoke all on public.essay_themes, public.essays from anon, authenticated;
grant select on public.essay_themes to authenticated;
grant select, insert, update, delete on public.essays to authenticated;

create table if not exists public.essay_ai_usage (
 user_id uuid not null references public.profiles(id) on delete cascade,
 task text not null check (task in ('correction', 'theme')),
 created_at timestamptz not null default now()
);
alter table public.essay_ai_usage enable row level security;
revoke all on public.essay_ai_usage from public, anon, authenticated;
create or replace function public.consume_essay_ai_quota(p_task text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_user uuid:=auth.uid(); v_count integer;
begin
 if v_user is null then raise exception 'Autenticação necessária.' using errcode='42501'; end if;
 if p_task not in ('correction','theme') then raise exception 'Ação inválida.' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtext(v_user::text), hashtext('essay-ai-' || p_task || '-' || (now() at time zone 'UTC')::date::text));
 select count(*)::integer into v_count from public.essay_ai_usage where user_id=v_user and task=p_task and created_at >= ((now() at time zone 'UTC')::date::timestamp at time zone 'UTC');
 if (p_task = 'correction' and v_count >= 5) or (p_task = 'theme' and v_count >= 10) then return false; end if;
 insert into public.essay_ai_usage(user_id,task) values(v_user,p_task);
 return true;
end $$;
revoke all on function public.consume_essay_ai_quota(text) from public, anon;
grant execute on function public.consume_essay_ai_quota(text) to authenticated;

-- Espécies animais iniciais, com ilustrações vetoriais próprias do NEXO.
create table if not exists public.animal_species (
 id text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
 name text not null,
 description text not null,
 accent text not null check (accent in ('blue', 'cyan', 'violet', 'teal', 'amber', 'rose')),
 is_active boolean not null default true
);
insert into public.animal_species(id, name, description, accent) values
 ('fox', 'Raposa', 'Ágil e estratégica.', 'amber'),
 ('owl', 'Coruja', 'Atenta e sábia.', 'violet'),
 ('turtle', 'Tartaruga', 'Resistente e constante.', 'teal'),
 ('cat', 'Gato', 'Curioso e veloz.', 'cyan'),
 ('wolf', 'Lobo', 'Determinado e colaborativo.', 'blue'),
 ('rabbit', 'Coelho', 'Rápido para aprender.', 'rose')
on conflict (id) do nothing;
alter table public.profiles add column if not exists animal_id text references public.animal_species(id);
update public.profiles set animal_id = 'fox' where animal_id is null;
alter table public.animal_species enable row level security;
drop policy if exists "Espécies animais ativas são visíveis" on public.animal_species;
create policy "Espécies animais ativas são visíveis" on public.animal_species for select to authenticated using (is_active);
revoke all on public.animal_species from anon, authenticated;
grant select on public.animal_species to authenticated;

create table if not exists public.animal_battles (
 id uuid primary key default gen_random_uuid(),
 status text not null default 'waiting' check (status in ('waiting', 'active', 'finished', 'cancelled')),
 question_id uuid references public.questions(id) on delete set null,
 current_player_id uuid references public.profiles(id) on delete set null,
 winner_id uuid references public.profiles(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.animal_battle_players (
 battle_id uuid not null references public.animal_battles(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 animal_id text not null references public.animal_species(id),
 health integer not null default 100 check (health between 0 and 100),
 joined_at timestamptz not null default now(),
 primary key (battle_id, user_id)
);
create table if not exists public.animal_battle_answers (
 id uuid primary key default gen_random_uuid(),
 battle_id uuid not null references public.animal_battles(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 question_id uuid not null references public.questions(id),
 selected_option_id uuid not null references public.question_options(id),
 is_correct boolean not null,
 damage integer not null default 0 check (damage between 0 and 100),
 created_at timestamptz not null default now()
);
alter table public.animal_battles enable row level security;
alter table public.animal_battle_players enable row level security;
alter table public.animal_battle_answers enable row level security;
create or replace function public.is_animal_battle_participant(p_battle_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.animal_battle_players p where p.battle_id = p_battle_id and p.user_id = auth.uid());
$$;
revoke all on function public.is_animal_battle_participant(uuid) from public, anon;
grant execute on function public.is_animal_battle_participant(uuid) to authenticated;
drop policy if exists "Participantes veem batalhas" on public.animal_battles;
create policy "Participantes veem batalhas" on public.animal_battles for select to authenticated
 using (public.is_animal_battle_participant(id));
drop policy if exists "Participantes veem os dois animais" on public.animal_battle_players;
create policy "Participantes veem os dois animais" on public.animal_battle_players for select to authenticated
 using (public.is_animal_battle_participant(battle_id));
drop policy if exists "Participantes veem suas respostas de batalha" on public.animal_battle_answers;
create policy "Participantes veem suas respostas de batalha" on public.animal_battle_answers for select to authenticated
 using (public.is_animal_battle_participant(battle_id));
revoke all on public.animal_battles, public.animal_battle_players, public.animal_battle_answers from anon, authenticated;
grant select on public.animal_battles, public.animal_battle_players, public.animal_battle_answers to authenticated;

-- Contas do ranking exibem apenas dados básicos e saldo/coins nunca são gravados pelo cliente.
create or replace function public.get_study_leaderboard(p_limit integer default 20)
returns table (rank bigint, user_id uuid, display_name text, xp integer, level integer)
language sql stable security definer set search_path = '' as $$
 select ranked.rank, ranked.id, ranked.display_name, ranked.xp, ranked.level
 from (select row_number() over(order by p.xp desc, p.level desc, p.id) as rank,
              p.id, coalesce(nullif(split_part(p.full_name, ' ', 1), ''), 'Estudante') as display_name, p.xp, p.level
       from public.profiles p) ranked
 order by ranked.rank limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;
revoke all on function public.get_study_leaderboard(integer) from public, anon;
grant execute on function public.get_study_leaderboard(integer) to authenticated;

create or replace function public.set_avatar_animal(p_animal_id text)
returns text language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'Autenticação necessária.' using errcode = '42501'; end if;
 if not exists(select 1 from public.animal_species where id = p_animal_id and is_active) then
   raise exception 'Espécie indisponível.' using errcode = '22023';
 end if;
 update public.profiles set animal_id = p_animal_id where id = auth.uid();
 return p_animal_id;
end $$;
revoke all on function public.set_avatar_animal(text) from public, anon;
grant execute on function public.set_avatar_animal(text) to authenticated;

create or replace function public.find_or_create_animal_battle(p_animal_id text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_battle uuid; v_q uuid; v_other uuid;
begin
 if v_user is null then raise exception 'Autenticação necessária.' using errcode = '42501'; end if;
 if not exists(select 1 from public.animal_species where id = p_animal_id and is_active) then raise exception 'Animal indisponível.' using errcode = '22023'; end if;
 perform pg_advisory_xact_lock(70014008);
 select p.battle_id into v_battle from public.animal_battle_players p join public.animal_battles b on b.id=p.battle_id
  where p.user_id=v_user and b.status in ('waiting','active') order by b.created_at desc limit 1;
 if v_battle is not null then return jsonb_build_object('battle_id',v_battle,'status','existing'); end if;
 select b.id into v_battle from public.animal_battles b join public.animal_battle_players p on p.battle_id=b.id
  where b.status='waiting' and p.user_id <> v_user order by b.created_at limit 1 for update of b skip locked;
 if v_battle is null then
   insert into public.animal_battles(status) values('waiting') returning id into v_battle;
   insert into public.animal_battle_players(battle_id,user_id,animal_id) values(v_battle,v_user,p_animal_id);
   return jsonb_build_object('battle_id',v_battle,'status','waiting');
 end if;
 select p.user_id into v_other from public.animal_battle_players p where p.battle_id=v_battle limit 1;
 insert into public.animal_battle_players(battle_id,user_id,animal_id) values(v_battle,v_user,p_animal_id);
 select q.id into v_q from public.questions q where q.status='approved' and exists(select 1 from public.question_options o where o.question_id=q.id and o.is_correct)
  and (select count(*) from public.question_options o where o.question_id=q.id) between 2 and 5
  order by random() limit 1;
 if v_q is null then raise exception 'Não há questões aprovadas para iniciar uma batalha.' using errcode='22023'; end if;
 update public.animal_battles set status='active', question_id=v_q, current_player_id=v_other, updated_at=now() where id=v_battle;
 return jsonb_build_object('battle_id',v_battle,'status','active');
end $$;
revoke all on function public.find_or_create_animal_battle(text) from public, anon;
grant execute on function public.find_or_create_animal_battle(text) to authenticated;

create or replace function public.get_animal_battle(p_battle_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_battle public.animal_battles; v_user uuid := auth.uid(); v_options jsonb; v_players jsonb;
begin
 if v_user is null or not public.is_animal_battle_participant(p_battle_id) then raise exception 'Batalha não encontrada.' using errcode='42501'; end if;
 select * into v_battle from public.animal_battles where id=p_battle_id;
 select coalesce(jsonb_agg(jsonb_build_object('user_id',p.user_id,'animal_id',p.animal_id,'name',coalesce(nullif(split_part(pr.full_name,' ',1),''),'Estudante'),'health',p.health) order by p.joined_at), '[]'::jsonb)
  into v_players from public.animal_battle_players p join public.profiles pr on pr.id=p.user_id where p.battle_id=p_battle_id;
 select coalesce(jsonb_agg(jsonb_build_object('id',o.id,'label',o.label,'content',o.content) order by o.label),'[]'::jsonb)
  into v_options from public.question_options o where o.question_id=v_battle.question_id;
 return jsonb_build_object('id',v_battle.id,'status',v_battle.status,'question_id',v_battle.question_id,'current_player_id',v_battle.current_player_id,'winner_id',v_battle.winner_id,'players',v_players,
  'question',(select jsonb_build_object('statement',q.statement,'options',v_options) from public.questions q where q.id=v_battle.question_id));
end $$;
revoke all on function public.get_animal_battle(uuid) from public, anon;
grant execute on function public.get_animal_battle(uuid) to authenticated;

create or replace function public.answer_animal_battle(p_battle_id uuid, p_option_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user uuid:=auth.uid(); v_q uuid; v_correct boolean; v_opponent uuid; v_health integer; v_next uuid; v_winner uuid; v_status text;
begin
 if v_user is null or not public.is_animal_battle_participant(p_battle_id) then raise exception 'Batalha não encontrada.' using errcode='42501'; end if;
 select question_id into v_q from public.animal_battles where id=p_battle_id and status='active' and current_player_id=v_user for update;
 if not found then raise exception 'Aguarde sua vez.' using errcode='22023'; end if;
 select is_correct into v_correct from public.question_options where id=p_option_id and question_id=v_q;
 if not found then raise exception 'Alternativa inválida.' using errcode='22023'; end if;
 select user_id into v_opponent from public.animal_battle_players where battle_id=p_battle_id and user_id<>v_user;
 if v_opponent is null then raise exception 'A batalha ainda não tem adversário.' using errcode='22023'; end if;
 insert into public.animal_battle_answers(battle_id,user_id,question_id,selected_option_id,is_correct,damage)
 values(p_battle_id,v_user,v_q,p_option_id,v_correct,case when v_correct then 20 else 0 end);
 if v_correct then update public.animal_battle_players set health=greatest(health-20,0) where battle_id=p_battle_id and user_id=v_opponent returning health into v_health;
 else select health into v_health from public.animal_battle_players where battle_id=p_battle_id and user_id=v_opponent; end if;
 if v_correct and v_health=0 then v_winner:=v_user; v_status:='finished';
   update public.animal_battles set status='finished',winner_id=v_winner,current_player_id=null,updated_at=now() where id=p_battle_id;
 else
   select q.id into v_next from public.questions q where q.status='approved' and q.id<>v_q and exists(select 1 from public.question_options o where o.question_id=q.id and o.is_correct)
    and (select count(*) from public.question_options o where o.question_id=q.id) between 2 and 5 order by random() limit 1;
   if v_next is null then v_next:=v_q; end if;
   update public.animal_battles set question_id=v_next,current_player_id=v_opponent,updated_at=now() where id=p_battle_id returning status into v_status;
 end if;
 return jsonb_build_object('correct',v_correct,'damage',case when v_correct then 20 else 0 end,'opponent_health',v_health,'status',v_status,'winner_id',v_winner);
end $$;
revoke all on function public.answer_animal_battle(uuid,uuid) from public, anon;
grant execute on function public.answer_animal_battle(uuid,uuid) to authenticated;

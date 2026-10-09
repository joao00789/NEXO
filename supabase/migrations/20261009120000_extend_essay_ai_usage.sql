-- Adiciona cotas de IA para mapas mentais.
alter table public.essay_ai_usage
drop constraint if exists essay_ai_usage_task_check;
alter table public.essay_ai_usage
  add constraint essay_ai_usage_task_check
    check (task in ('correction', 'theme', 'mindmap'));

create or replace function public.consume_mindmap_ai_quota()
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_count integer;
begin
  if v_user is null then
    raise exception 'Autenticação necessária.' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(hashtext(v_user::text), hashtext('mindmap-ai-' || (now() at time zone 'UTC')::date::text));
  select count(*)::integer into v_count
    from public.essay_ai_usage
    where user_id = v_user
      and task = 'mindmap'
      and created_at >= ((now() at time zone 'UTC')::date::timestamp at time zone 'UTC');
  if v_count >= 20 then
    return false;
  end if;
  insert into public.essay_ai_usage (user_id, task) values (v_user, 'mindmap');
  return true;
end $$;

revoke all on function public.consume_mindmap_ai_quota() from public, anon;
grant execute on function public.consume_mindmap_ai_quota() to authenticated;

-- Cada 100 XP acumulados avançam o perfil em um nível.
create or replace function public.sync_profile_level_from_xp()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.level := (greatest(new.xp, 0) / 100) + 1;
    return new;
end;
$$;

drop trigger if exists profiles_sync_level_from_xp on public.profiles;
create trigger profiles_sync_level_from_xp
before update of xp on public.profiles
for each row
execute function public.sync_profile_level_from_xp();

update public.profiles
set level = (greatest(xp, 0) / 100) + 1
where level is distinct from (greatest(xp, 0) / 100) + 1;

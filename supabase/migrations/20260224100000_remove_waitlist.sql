-- Remove waitlist behavior by default-approving users

alter table public.profiles
  alter column is_approved set default true;

update public.profiles
  set is_approved = true
  where is_approved = false;

-- Ensure new users are created as approved
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.profiles (id, full_name, avatar_url, is_approved)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), null, true);

  -- Auto-assign content_strategist role for small teams
  insert into public.user_roles (user_id, role)
  values (new.id, 'content_strategist');

  return new;
end;
$function$;


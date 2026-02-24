-- Workspaces, workspace membership, and calendars

-- Workspaces owned by a single user but with multiple members
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
alter table public.workspaces enable row level security;

-- Members of a workspace with per-workspace role
create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);
alter table public.workspace_members enable row level security;

-- Calendars within a workspace
create table public.calendars (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now()
);
alter table public.calendars enable row level security;

-- Function helpers for workspace membership
create or replace function public.is_workspace_member(_workspace_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = _workspace_id
      and wm.user_id = _user_id
  );
$$;

create or replace function public.has_workspace_role(_workspace_id uuid, _user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = _workspace_id
      and wm.user_id = _user_id
      and wm.role = _role
  );
$$;

-- RLS for workspaces
create policy "workspace_select_members"
  on public.workspaces
  for select
  to authenticated
  using (
    owner_id = auth.uid()
    or public.is_workspace_member(id, auth.uid())
  );

create policy "workspace_insert_owner"
  on public.workspaces
  for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "workspace_update_owner"
  on public.workspaces
  for update
  to authenticated
  using (owner_id = auth.uid());

-- RLS for workspace_members
create policy "workspace_members_select"
  on public.workspace_members
  for select
  to authenticated
  using (
    public.is_workspace_member(workspace_id, auth.uid())
    or exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.owner_id = auth.uid()
    )
  );

create policy "workspace_members_manage_owner"
  on public.workspace_members
  for all
  to authenticated
  using (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.owner_id = auth.uid()
    )
  );

-- RLS for calendars
create policy "calendars_select_members"
  on public.calendars
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.workspaces w
      where w.id = calendars.workspace_id
        and (w.owner_id = auth.uid() or public.is_workspace_member(w.id, auth.uid()))
    )
  );

create policy "calendars_insert_members"
  on public.calendars
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.workspaces w
      where w.id = workspace_id
        and (
          w.owner_id = auth.uid()
          or public.has_workspace_role(w.id, auth.uid(), 'admin')
          or public.has_workspace_role(w.id, auth.uid(), 'content_strategist')
        )
    )
  );

create policy "calendars_update_members"
  on public.calendars
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.workspaces w
      where w.id = workspace_id
        and (
          w.owner_id = auth.uid()
          or public.has_workspace_role(w.id, auth.uid(), 'admin')
          or public.has_workspace_role(w.id, auth.uid(), 'content_strategist')
        )
    )
  );

-- Attach posts to calendars
alter table public.posts
  add column if not exists calendar_id uuid;

alter table public.shared_calendars
  add column if not exists calendar_id uuid;

-- Backfill: create a default workspace and calendar per existing user
insert into public.workspaces (owner_id, name)
select p.id, coalesce(p.full_name, 'My workspace')
from public.profiles p
on conflict do nothing;

insert into public.workspace_members (workspace_id, user_id, role, invited_by)
select w.id, w.owner_id, 'admin'::public.app_role, w.owner_id
from public.workspaces w
on conflict (workspace_id, user_id) do nothing;

insert into public.calendars (workspace_id, name, color)
select w.id, 'Main calendar', null
from public.workspaces w
on conflict do nothing;

-- Helper: choose the first calendar for a workspace owner
update public.posts p
set calendar_id = c.id
from public.calendars c
join public.workspaces w on w.id = c.workspace_id
where p.created_by = w.owner_id
  and p.calendar_id is null
  and c.created_at = (
    select min(c2.created_at) from public.calendars c2 where c2.workspace_id = w.id
  );

update public.shared_calendars sc
set calendar_id = c.id
from public.calendars c
join public.workspaces w on w.id = c.workspace_id
where sc.created_by = w.owner_id
  and sc.calendar_id is null
  and c.created_at = (
    select min(c2.created_at) from public.calendars c2 where c2.workspace_id = w.id
  );

alter table public.posts
  alter column calendar_id set not null;

alter table public.shared_calendars
  alter column calendar_id set not null;

alter table public.posts
  add constraint posts_calendar_id_fkey
    foreign key (calendar_id) references public.calendars(id) on delete cascade;

alter table public.shared_calendars
  add constraint shared_calendars_calendar_id_fkey
    foreign key (calendar_id) references public.calendars(id) on delete cascade;

-- Update RLS on posts to use workspace membership via calendars
drop policy if exists "Team members can view posts" on public.posts;
drop policy if exists "Admins and strategists can create posts" on public.posts;
drop policy if exists "Post editors can update" on public.posts;
drop policy if exists "Admins and strategists can delete posts" on public.posts;

create policy "workspace_members_can_view_posts"
  on public.posts
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.calendars c
      join public.workspaces w on w.id = c.workspace_id
      where c.id = posts.calendar_id
        and (w.owner_id = auth.uid() or public.is_workspace_member(w.id, auth.uid()))
    )
  );

create policy "workspace_members_can_create_posts"
  on public.posts
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.calendars c
      join public.workspaces w on w.id = c.workspace_id
      where c.id = calendar_id
        and (
          w.owner_id = auth.uid()
          or public.has_workspace_role(w.id, auth.uid(), 'admin')
          or public.has_workspace_role(w.id, auth.uid(), 'content_strategist')
        )
    )
  );

create policy "workspace_members_can_update_posts"
  on public.posts
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.calendars c
      join public.workspaces w on w.id = c.workspace_id
      where c.id = calendar_id
        and (
          w.owner_id = auth.uid()
          or public.has_workspace_role(w.id, auth.uid(), 'admin')
          or public.has_workspace_role(w.id, auth.uid(), 'content_strategist')
        )
    )
  );

create policy "workspace_members_can_delete_posts"
  on public.posts
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.calendars c
      join public.workspaces w on w.id = c.workspace_id
      where c.id = calendar_id
        and (
          w.owner_id = auth.uid()
          or public.has_workspace_role(w.id, auth.uid(), 'admin')
          or public.has_workspace_role(w.id, auth.uid(), 'content_strategist')
        )
    )
  );


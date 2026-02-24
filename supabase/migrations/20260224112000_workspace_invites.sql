-- Workspace-based invitation tokens

create table public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text,
  token text not null unique default gen_random_uuid()::text,
  role public.app_role not null default 'content_strategist',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz
);

alter table public.workspace_invites enable row level security;

-- RLS: allow workspace owners/admins/strategists to view and create invites
create policy "workspace_invites_select_members"
  on public.workspace_invites
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.workspaces w
      where w.id = workspace_invites.workspace_id
        and (
          w.owner_id = auth.uid()
          or public.is_workspace_member(w.id, auth.uid())
        )
    )
  );

create policy "workspace_invites_insert_owners_admins"
  on public.workspace_invites
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.workspaces w
      where w.id = workspace_invites.workspace_id
        and (
          w.owner_id = auth.uid()
          or public.has_workspace_role(w.id, auth.uid(), 'admin')
          or public.has_workspace_role(w.id, auth.uid(), 'content_strategist')
        )
    )
  );


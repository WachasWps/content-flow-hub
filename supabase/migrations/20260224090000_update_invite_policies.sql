-- Restrict creation of invite tokens to admins only
drop policy if exists "Admins and strategists can create invite tokens" on public.invite_tokens;

create policy "Admins can create invite tokens"
  on public.invite_tokens for insert
  with check (is_admin(auth.uid()));


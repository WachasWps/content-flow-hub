
-- Table for invite tokens (bypass waitlist)
CREATE TABLE public.invite_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_by uuid NOT NULL,
  used_by uuid,
  used_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view invite tokens"
  ON public.invite_tokens FOR SELECT
  USING (is_team_member(auth.uid()));

CREATE POLICY "Admins and strategists can create invite tokens"
  ON public.invite_tokens FOR INSERT
  WITH CHECK (is_admin(auth.uid()) OR is_content_strategist(auth.uid()));

CREATE POLICY "Admins and strategists can update invite tokens"
  ON public.invite_tokens FOR UPDATE
  USING (is_admin(auth.uid()) OR is_content_strategist(auth.uid()));

-- Table for shared calendar links
CREATE TABLE public.shared_calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_by uuid NOT NULL,
  label text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view shared calendars"
  ON public.shared_calendars FOR SELECT
  USING (is_team_member(auth.uid()));

CREATE POLICY "Admins and strategists can create shared calendars"
  ON public.shared_calendars FOR INSERT
  WITH CHECK (is_admin(auth.uid()) OR is_content_strategist(auth.uid()));

CREATE POLICY "Admins and strategists can update shared calendars"
  ON public.shared_calendars FOR UPDATE
  USING (is_admin(auth.uid()) OR is_content_strategist(auth.uid()));

CREATE POLICY "Admins and strategists can delete shared calendars"
  ON public.shared_calendars FOR DELETE
  USING (is_admin(auth.uid()) OR is_content_strategist(auth.uid()));

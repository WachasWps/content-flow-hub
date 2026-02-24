
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'content_strategist', 'editor', 'social_media_manager');

-- Platform enum
CREATE TYPE public.platform_type AS ENUM ('instagram', 'youtube', 'linkedin', 'twitter');

-- Post status enum
CREATE TYPE public.post_status AS ENUM ('idea', 'in_editing', 'under_review', 'ready_to_post', 'posted');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  caption TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  script TEXT,
  status post_status NOT NULL DEFAULT 'idea',
  publish_date TIMESTAMPTZ,
  platform platform_type NOT NULL DEFAULT 'instagram',
  reference_link TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_editor UUID REFERENCES auth.users(id),
  assigned_sm_manager UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Post files metadata table
CREATE TABLE public.post_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.post_files ENABLE ROW LEVEL SECURITY;

-- Storage bucket for post assets
INSERT INTO storage.buckets (id, name, public) VALUES ('post-assets', 'post-assets', true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Security definer helper functions (avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

CREATE OR REPLACE FUNCTION public.is_content_strategist(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'content_strategist')
$$;

CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id
  )
$$;

-- RLS: profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- RLS: user_roles
CREATE POLICY "Team members can view roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- RLS: posts
CREATE POLICY "Team members can view posts" ON public.posts FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));
CREATE POLICY "Admins and strategists can create posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()) OR public.is_content_strategist(auth.uid()));
CREATE POLICY "Post editors can update" ON public.posts FOR UPDATE TO authenticated USING (
  public.is_admin(auth.uid()) OR public.is_content_strategist(auth.uid()) OR assigned_editor = auth.uid() OR assigned_sm_manager = auth.uid()
);
CREATE POLICY "Admins and strategists can delete posts" ON public.posts FOR DELETE TO authenticated USING (public.is_admin(auth.uid()) OR public.is_content_strategist(auth.uid()));

-- RLS: comments
CREATE POLICY "Team members can view comments" ON public.comments FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));
CREATE POLICY "Team members can add comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (public.is_team_member(auth.uid()) AND auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- RLS: post_files
CREATE POLICY "Team members can view files" ON public.post_files FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));
CREATE POLICY "Team members can upload files" ON public.post_files FOR INSERT TO authenticated WITH CHECK (public.is_team_member(auth.uid()) AND auth.uid() = uploaded_by);
CREATE POLICY "Admins and strategists can delete files" ON public.post_files FOR DELETE TO authenticated USING (public.is_admin(auth.uid()) OR public.is_content_strategist(auth.uid()) OR auth.uid() = uploaded_by);

-- Storage policies for post-assets bucket
CREATE POLICY "Authenticated users can view post assets" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'post-assets');
CREATE POLICY "Team members can upload post assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'post-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own uploads" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'post-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;

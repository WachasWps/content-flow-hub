import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/lib/workspace";
import { CalendarDays, ArrowLeft } from "lucide-react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("workspaceToken");
  const { reload, setActiveWorkspaceId } = useWorkspace();

  const handleWorkspaceInviteJoin = async (userId: string) => {
    if (!inviteToken) return;
    const { error, data } = await supabase.functions.invoke("redeem-workspace-invite", {
      body: { token: inviteToken, userId },
    });
    if (error || data?.error) {
      toast({
        title: "Workspace invite error",
        description: error?.message ?? data?.error ?? "Could not join the invited workspace.",
        variant: "destructive",
      });
      return;
    }

    const workspaceId = (data as { workspace_id?: string } | null)?.workspace_id ?? null;
    if (workspaceId) {
      setActiveWorkspaceId(workspaceId);
    }
    reload();
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      if (data.user) {
        await handleWorkspaceInviteJoin(data.user.id);
      }
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const fullName = (formData.get("fullName") as string) || "";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    if (data.session && data.user) {
      await handleWorkspaceInviteJoin(data.user.id);
      navigate("/dashboard");
    } else {
      toast({
        title: "Check your email",
        description: "We sent you a confirmation link. Confirm your email, then sign in.",
      });
      setMode("signin");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
            <CalendarDays className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to your workspace" : "Start planning your content in minutes"}
          </p>
        </div>

        <Card className="shadow-xl shadow-primary/5">
          {mode === "signin" ? (
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" name="email" type="email" required placeholder="you@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" name="password" type="password" required placeholder="••••••••" />
                </div>
                <Button type="submit" className="w-full shadow-md shadow-primary/20" disabled={loading}>
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </CardContent>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full name</Label>
                  <Input id="signup-name" name="fullName" placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" name="email" type="email" required placeholder="you@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" name="password" type="password" required minLength={6} placeholder="••••••••" />
                </div>
                <Button type="submit" className="w-full shadow-md shadow-primary/20" disabled={loading}>
                  {loading ? "Creating…" : "Create account"}
                </Button>
              </CardContent>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>
              New here?{" "}
              <button className="font-medium text-primary hover:underline" onClick={() => setMode("signup")} type="button">
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button className="font-medium text-primary hover:underline" onClick={() => setMode("signin")} type="button">
                Sign in
              </button>
            </>
          )}
        </p>

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/" className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
            <ArrowLeft className="h-3 w-3" />
            Back to homepage
          </Link>
        </p>
      </div>
    </div>
  );
}

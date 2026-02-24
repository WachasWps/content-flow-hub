import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import calyLogo from "@/assets/caly-logo.png";

export default function InviteLogin() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setValidating(false);
      setErrorMsg("No invite token provided. Ask your admin to resend your invite link.");
      return;
    }

    const validate = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("validate-invite", {
          body: { token },
        });
        if (error || !data?.valid) {
          setErrorMsg(data?.error || "Invalid or already used invite link.");
        } else {
          setValid(true);
        }
      } catch {
        setErrorMsg("Failed to validate invite. Please try again or contact your admin.");
      }
      setValidating(false);
    };

    validate();
  }, [token]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // If this is the first time they are using this invite token, mark it as used and auto-approve.
    if (token && data.user) {
      await supabase.functions.invoke("redeem-invite", {
        body: { token, userId: data.user.id },
      });
    }

    navigate("/dashboard");
  };

  if (validating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="space-y-4 text-center">
          <img src={calyLogo} alt="Caly" className="mx-auto h-10" />
          <p className="font-medium text-destructive">{errorMsg}</p>
          <p className="text-xs text-muted-foreground">
            Make sure you're using the most recent invite email, or ask your team admin to send a new one.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Go to standard login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
            <KeyRound className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Invite-only login</h1>
          <p className="text-sm text-muted-foreground">Sign in with the same email your Caly invite was sent to.</p>
        </div>

        <Card className="shadow-xl shadow-primary/5">
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
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Lost your invite? Ask your team admin to send you a fresh invite link.
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


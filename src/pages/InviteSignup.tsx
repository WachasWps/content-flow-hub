import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import calyLogo from "@/assets/caly-logo.png";

export default function InviteSignup() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setValidating(false);
      setErrorMsg("No invite token provided.");
      return;
    }
    const validate = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("validate-invite", {
          body: { token },
        });
        if (error || !data?.valid) {
          setErrorMsg(data?.error || "Invalid invite link.");
        } else {
          setValid(true);
        }
      } catch {
        setErrorMsg("Failed to validate invite.");
      }
      setValidating(false);
    };
    validate();
  }, [token]);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    const { data: authData, error } = await supabase.auth.signUp({
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

    // Redeem the invite to auto-approve
    if (authData.user) {
      await supabase.functions.invoke("redeem-invite", {
        body: { token, userId: authData.user.id },
      });
    }

    toast({ title: "Welcome to Caly! ✦", description: "Check your email to confirm, then you're all set." });
    setLoading(false);
    navigate("/auth");
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
        <div className="text-center space-y-4">
          <img src={calyLogo} alt="Caly" className="mx-auto h-10" />
          <p className="text-destructive font-medium">{errorMsg}</p>
          <Link
            to="/invite-login"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Go to invite login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <img src={calyLogo} alt="Caly" className="h-10" />
          <div className="flex items-center gap-2 rounded-full bg-pop-green/10 px-3 py-1 text-[12px] font-medium text-pop-green">
            <UserPlus className="h-3.5 w-3.5" />
            You've been invited!
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Join Caly</h1>
          <p className="text-sm text-muted-foreground">Create your account to get started</p>
        </div>

        <Card className="shadow-xl shadow-primary/5">
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" name="fullName" required placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="you@company.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required minLength={6} placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full shadow-md shadow-primary/20" disabled={loading}>
                {loading ? "Creating account…" : "Join the team"}
              </Button>
            </CardContent>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            to={token ? `/invite-login?token=${encodeURIComponent(token)}` : "/invite-login"}
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Already have an account? Use invite login
          </Link>
        </p>
      </div>
    </div>
  );
}

import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Clock, LogOut, Mail } from "lucide-react";
import calyLogo from "@/assets/caly-logo.png";

export default function PendingApproval() {
  const { signOut, user } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <img src={calyLogo} alt="Caly" className="mx-auto h-12 w-auto" />

        <div className="rounded-2xl border bg-card p-8 shadow-xl shadow-primary/5 space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-7 w-7 text-primary" />
          </div>

          <h1 className="font-serif-display text-2xl font-semibold text-foreground">
            You're on the waitlist!
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Thanks for signing up, <span className="font-medium text-foreground">{user?.email}</span>. 
            Your account is pending approval. We'll notify you once you're in!
          </p>

          <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0" />
            <span>You'll receive an email when your access is approved.</span>
          </div>

          <Button variant="outline" className="w-full gap-2" onClick={signOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

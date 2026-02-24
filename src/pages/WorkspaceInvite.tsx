import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useWorkspace } from "@/lib/workspace";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export default function WorkspaceInvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { reload, setActiveWorkspaceId } = useWorkspace();
  const [status, setStatus] = useState<"idle" | "redeeming" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const redeem = async () => {
      if (!token || !user) return;
      setStatus("redeeming");
      setErrorMsg(null);

      const { error, data } = await supabase.functions.invoke("redeem-workspace-invite", {
        body: { token, userId: user.id },
      });

      if (error || data?.error) {
        setErrorMsg(error?.message ?? data?.error ?? "Failed to redeem invite.");
        setStatus("error");
        return;
      }

      // Successfully joined workspace: reload workspace context, switch to this workspace, and go to dashboard
      const workspaceId = (data as { workspace_id?: string } | null)?.workspace_id ?? null;
      if (workspaceId) {
        setActiveWorkspaceId(workspaceId);
      }
      reload();
      setStatus("success");
      navigate("/dashboard");
    };

    if (token && user) {
      void redeem();
    }
  }, [token, user]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="rounded-xl border bg-card px-6 py-8 text-center max-w-sm space-y-3">
          <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
          <h1 className="text-lg font-semibold">Invalid invite link</h1>
          <p className="text-sm text-muted-foreground">
            This workspace invite link is missing a token. Please ask the person who sent it to share it again.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="rounded-xl border bg-card px-6 py-8 text-center max-w-sm space-y-4">
          <AlertTriangle className="mx-auto h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">Log in to join this workspace</h1>
          <p className="text-sm text-muted-foreground">
            Log in or create an account to join this workspace. We&apos;ll automatically connect you after login.
          </p>
          <Button onClick={() => navigate(`/auth?workspaceToken=${encodeURIComponent(token)}`)}>
            Go to login
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (status === "redeeming") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="rounded-xl border bg-card px-6 py-8 text-center max-w-sm space-y-3">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          <h1 className="text-lg font-semibold">Joining workspace…</h1>
          <p className="text-sm text-muted-foreground">Hang tight while we accept your invite.</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="rounded-xl border bg-card px-6 py-8 text-center max-w-sm space-y-3">
          <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
          <h1 className="text-lg font-semibold">Invite error</h1>
          <p className="text-sm text-destructive">{errorMsg ?? "Something went wrong with this invite."}</p>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Go to dashboard
          </Button>
        </div>
      </div>
    );
  }

  // We immediately navigate to the dashboard on success, so this should rarely render.
  return null;
}


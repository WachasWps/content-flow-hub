import { useState } from "react";
import { Shield, Clock, UserPlus, Copy, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { useWorkspace } from "@/lib/workspace";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const roleConfig: Record<string, { label: string; bg: string }> = {
  admin: { label: "Admin", bg: "bg-primary/15 text-primary" },
  content_strategist: { label: "Strategist", bg: "bg-pop-blue/15 text-pop-blue" },
  editor: { label: "Editor", bg: "bg-pop-blue/15 text-pop-blue" },
  social_media_manager: { label: "SM Manager", bg: "bg-pop-green/15 text-pop-green" },
};

const avatarColors = ["bg-primary/20", "bg-pop-pink/20", "bg-pop-blue/20", "bg-pop-green/20", "bg-pop-purple/20"];

export default function MembersPage() {
  const [roleFilter, setRoleFilter] = useState("all");
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeWorkspaceId } = useWorkspace();
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  const { data: members = [], refetch: refetchMembers } = useQuery({
    queryKey: ["members", activeWorkspaceId],
    queryFn: async () => {
      if (!activeWorkspaceId) return [];

      const { data: memberships, error: wmError } = await supabase
        .from("workspace_members")
        .select("*")
        .eq("workspace_id", activeWorkspaceId);

      if (wmError) throw wmError;

      const userIds = [...new Set((memberships ?? []).map((m) => m.user_id))];
      if (userIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      return userIds.map((uid) => {
        const membership = memberships?.find((m) => m.user_id === uid);
        const profile = profiles?.find((p) => p.id === uid);
        return {
          id: uid,
          name: profile?.full_name || "Team Member",
          avatar_url: profile?.avatar_url,
          roles: membership ? [membership.role] : [],
          primaryRole: membership?.role || "editor",
          lastActive: profile?.updated_at || profile?.created_at || new Date().toISOString(),
        };
      });
    },
  });

  const { data: myMembership } = useQuery({
    queryKey: ["workspace-membership", activeWorkspaceId, user?.id],
    queryFn: async () => {
      if (!activeWorkspaceId || !user?.id) return null;
      const { data, error } = await supabase
        .from("workspace_members")
        .select("role")
        .eq("workspace_id", activeWorkspaceId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as { role: string } | null;
    },
    enabled: !!activeWorkspaceId && !!user?.id,
  });

  const canManageMembers = myMembership?.role === "admin";

  const handleRemoveFromWorkspace = async (memberId: string) => {
    if (!activeWorkspaceId) return;
    const confirmed = window.confirm("Remove this member from the workspace?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("workspace_id", activeWorkspaceId)
      .eq("user_id", memberId);

    if (error) {
      toast({
        title: "Failed to remove member",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Member removed from workspace" });
    void refetchMembers();
  };

  const filtered = roleFilter === "all" ? members : members.filter((m) => m.roles.includes(roleFilter as any));

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border bg-[hsl(var(--warm-white))] px-4 sm:px-8 py-4">
        <h1 className="font-serif-display text-[18px] sm:text-[22px] font-semibold text-foreground">👤 Members</h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-9 w-[130px] text-[13px]"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent className="z-[100] bg-popover">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="content_strategist">Strategist</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="social_media_manager">SM Manager</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all shadow-[0_2px_8px_hsl(18_63%_47%/0.25)] hover:-translate-y-px">
                <UserPlus className="h-4 w-4" />
                Invite to workspace
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3 space-y-3" align="end">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Invite Link</p>
              {!inviteLink ? (
                <button
                  disabled={!activeWorkspaceId}
                  onClick={async () => {
                    if (!user || !activeWorkspaceId) return;
                    const { data, error } = await supabase
                      .from("workspace_invites")
                      .insert({
                        workspace_id: activeWorkspaceId,
                        created_by: user.id,
                        role: "content_strategist",
                      })
                      .select("token")
                      .single();
                    if (error || !data) {
                      toast({
                        title: "Failed to create invite",
                        description: error?.message,
                        variant: "destructive",
                      });
                      return;
                    }
                    const link = `${window.location.origin}/workspace-invite?token=${data.token}`;
                    setInviteLink(link);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-[13px] font-medium transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <UserPlus className="h-4 w-4 text-primary" />
                  Generate invite link
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-lg border bg-card px-2 py-1.5">
                    <input
                      readOnly
                      value={inviteLink}
                      className="flex-1 bg-transparent text-[11px] text-foreground outline-none truncate"
                    />
                    <button
                      onClick={() => {
                        if (!inviteLink) return;
                        navigator.clipboard.writeText(inviteLink);
                        setInviteCopied(true);
                        toast({ title: "Invite link copied!" });
                        setTimeout(() => setInviteCopied(false), 2000);
                      }}
                      className="shrink-0 p-1 rounded hover:bg-muted"
                      title="Copy invite link"
                    >
                      {inviteCopied ? (
                        <Check className="h-3.5 w-3.5 text-pop-green" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Share this link with teammates. They’ll join your workspace after logging in.
                  </p>
                  <button
                    onClick={() => setInviteLink(null)}
                    className="text-[11px] text-primary font-medium hover:underline"
                  >
                    Generate new link
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <Tabs defaultValue="team">
          <TabsList className="mb-6">
            <TabsTrigger value="team">Team ({filtered.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="team">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="font-serif-body italic text-muted-foreground text-lg">No team members found ✦</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
                  {filtered.map((member, i) => {
                    const role = roleConfig[member.primaryRole] || roleConfig.editor;
                    return (
                      <div key={member.id} className="rounded-xl border border-border bg-[hsl(var(--warm-white))] p-5 text-center transition-all hover:shadow-md hover:-translate-y-0.5">
                        <div className={cn("w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-serif-display font-bold text-foreground", avatarColors[i % avatarColors.length])}>
                          {member.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <h3 className="font-serif-display text-[15px] font-semibold text-foreground mb-1">{member.name}</h3>
                        <span className={cn("inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold mb-2", role.bg)}>{role.label}</span>
                        <p className="font-serif-body italic text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last active {format(new Date(member.lastActive), "MMM d")}
                        </p>
                        {canManageMembers && member.id !== user?.id && (
                          <div className="mt-3 flex justify-center">
                            <button
                              onClick={() => handleRemoveFromWorkspace(member.id)}
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-destructive hover:bg-destructive/5"
                            >
                              <Trash2 className="h-3 w-3" />
                              Remove from workspace
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-border bg-[hsl(var(--warm-white))] p-6">
                  <h2 className="font-serif-display text-[16px] font-semibold text-foreground mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    {filtered.slice(0, 5).map((member, i) => (
                      <div key={`activity-${i}`} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-foreground", avatarColors[i % avatarColors.length])}>
                          {member.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] text-foreground">
                            <span className="font-medium">{member.name}</span>
                            <span className="text-muted-foreground"> is active</span>
                          </p>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{format(new Date(member.lastActive), "MMM d")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

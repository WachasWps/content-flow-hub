import { useState } from "react";
import { UserPlus, Shield, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const { data: members = [], refetch: refetchMembers } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data: roles, error: rolesErr } = await supabase.from("user_roles").select("*");
      if (rolesErr) throw rolesErr;

      const userIds = [...new Set(roles.map((r) => r.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("*").in("id", userIds);

      return userIds.map((uid) => {
        const profile = profiles?.find((p) => p.id === uid);
        const userRoles = roles.filter((r) => r.user_id === uid);
        return {
          id: uid,
          name: profile?.full_name || "Team Member",
          avatar_url: profile?.avatar_url,
          roles: userRoles.map((r) => r.role),
          primaryRole: userRoles[0]?.role || "editor",
          lastActive: profile?.updated_at || profile?.created_at || new Date().toISOString(),
          isApproved: profile?.is_approved ?? false,
        };
      });
    },
  });

  const { data: pendingUsers = [], refetch: refetchPending } = useQuery({
    queryKey: ["pending-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_approved", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleApprove = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: true })
      .eq("id", userId);
    if (error) {
      toast({ title: "Failed to approve", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "User approved! ✦" });
      refetchPending();
      refetchMembers();
    }
  };

  const handleReject = async (userId: string) => {
    // Remove their role and mark profile
    await supabase.from("user_roles").delete().eq("user_id", userId);
    toast({ title: "User removed from waitlist" });
    refetchPending();
    refetchMembers();
  };

  const filtered = roleFilter === "all" ? members.filter(m => m.isApproved) : members.filter((m) => m.isApproved && m.roles.includes(roleFilter as any));

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-border bg-[hsl(var(--warm-white))] px-8 py-4">
        <h1 className="font-serif-display text-[22px] font-semibold text-foreground">👤 Members</h1>
        <div className="flex items-center gap-3">
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
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <Tabs defaultValue="team">
          <TabsList className="mb-6">
            <TabsTrigger value="team">Team ({filtered.length})</TabsTrigger>
            <TabsTrigger value="waitlist" className="gap-2">
              Waitlist
              {pendingUsers.length > 0 && (
                <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1">
                  {pendingUsers.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="font-serif-body italic text-muted-foreground text-lg">No team members found ✦</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
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
                      </div>
                    );
                  })}
                </div>

                {/* Activity Feed */}
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
                            <span className="text-muted-foreground"> joined the team</span>
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

          <TabsContent value="waitlist">
            {pendingUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="font-serif-body italic text-muted-foreground text-lg">No pending requests ✦</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((user, i) => (
                  <div key={user.id} className="flex items-center gap-4 rounded-xl border border-border bg-[hsl(var(--warm-white))] px-5 py-4 transition-all hover:shadow-sm">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-lg font-serif-display font-bold text-foreground shrink-0", avatarColors[i % avatarColors.length])}>
                      {user.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif-display text-[15px] font-semibold text-foreground">{user.full_name || "Unknown"}</h3>
                      <p className="font-serif-body italic text-[12px] text-muted-foreground">
                        Signed up {format(new Date(user.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-pop-green/15 px-4 py-2 text-[12px] font-semibold text-pop-green transition-colors hover:bg-pop-green/25"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(user.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-4 py-2 text-[12px] font-semibold text-destructive transition-colors hover:bg-destructive/20"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

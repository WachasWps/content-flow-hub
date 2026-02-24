import { useState } from "react";
import { UserPlus, Shield, Pencil, Eye, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const roleConfig: Record<string, { label: string; bg: string }> = {
  admin: { label: "Admin", bg: "bg-primary/15 text-primary" },
  content_strategist: { label: "Strategist", bg: "bg-pop-blue/15 text-pop-blue" },
  editor: { label: "Editor", bg: "bg-pop-blue/15 text-pop-blue" },
  social_media_manager: { label: "SM Manager", bg: "bg-pop-green/15 text-pop-green" },
};

const avatarColors = ["bg-primary/20", "bg-pop-pink/20", "bg-pop-blue/20", "bg-pop-green/20", "bg-pop-purple/20"];

export default function MembersPage() {
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: members = [] } = useQuery({
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
        };
      });
    },
  });

  const filtered = roleFilter === "all" ? members : members.filter((m) => m.roles.includes(roleFilter as any));

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
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all shadow-[0_2px_8px_hsl(18_63%_47%/0.25)] hover:-translate-y-px">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
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
                {members.slice(0, 5).map((member, i) => (
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
      </div>
    </div>
  );
}

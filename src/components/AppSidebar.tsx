import { CalendarDays, FileText, Sparkles, BarChart3, Tag, Users, LogOut, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const workspaceItems = [
  { to: "/", icon: CalendarDays, label: "Calendar", emoji: "📅" },
  { to: "#posts", icon: FileText, label: "Posts", emoji: "📋" },
  { to: "#drafts", icon: Sparkles, label: "Drafts", emoji: "✦" },
];

const insightItems = [
  { to: "#analytics", icon: BarChart3, label: "Analytics", emoji: "📈" },
  { to: "#tags", icon: Tag, label: "Tags", emoji: "🏷" },
];

const teamItems = [
  { to: "#members", icon: Users, label: "Members", emoji: "👤" },
];

const platformFilters = [
  { label: "Instagram", color: "bg-[hsl(var(--pop-pink))]" },
  { label: "Twitter / X", color: "bg-[hsl(var(--pop-blue))]" },
  { label: "YouTube", color: "bg-destructive" },
  { label: "LinkedIn", color: "bg-[hsl(var(--pop-purple))]" },
];

function NavSection({ label, items }: { label: string; items: typeof workspaceItems }) {
  const location = useLocation();

  return (
    <>
      <div className="px-6 mb-2 mt-4 text-[9px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--sand))]/40">
        {label}
      </div>
      {items.map(({ to, label, emoji }) => {
        const isActive = to === "/" ? location.pathname === "/" : false;
        return (
          <NavLink
            key={to}
            to={to}
            className={cn(
              "flex items-center gap-2.5 px-6 py-2.5 text-[13px] transition-all border-l-2",
              isActive
                ? "text-[hsl(var(--parchment,39_66%_90%))] border-l-primary bg-primary/10 font-medium"
                : "text-[hsl(39_66%_90%/0.55)] border-l-transparent hover:text-[hsl(39_66%_90%)] hover:bg-white/[0.04]"
            )}
          >
            <span className="text-[15px] w-[18px] text-center">{emoji}</span>
            {label}
          </NavLink>
        );
      })}
    </>
  );
}

export default function AppSidebar() {
  const { signOut, user } = useAuth();

  return (
    <aside className="flex h-screen w-[220px] flex-col flex-shrink-0 bg-foreground relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-[60px] -right-[60px] w-[180px] h-[180px] bg-primary opacity-[0.12] rounded-full" />
      <div className="absolute bottom-10 -left-10 w-[120px] h-[120px] bg-accent opacity-[0.08] rounded-full" />

      {/* Logo */}
      <div className="px-6 pt-7 pb-7 border-b border-[hsl(var(--sand))]/10 relative z-10">
        <h1 className="font-serif-display text-[30px] font-bold text-primary tracking-[-0.5px] leading-none">
          caly.
        </h1>
        <span className="block mt-0.5 text-[11px] font-sans tracking-[0.15em] text-[hsl(39_66%_90%/0.3)] italic">
          Content Calendar
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 relative z-10 py-2">
        <NavSection label="Workspace" items={workspaceItems} />
        <NavSection label="Insights" items={insightItems} />
        <NavSection label="Team" items={teamItems} />
      </nav>

      {/* Platform filters */}
      <div className="px-6 py-5 border-t border-[hsl(var(--sand))]/10 relative z-10">
        <div className="text-[9px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--sand))]/40 mb-3">
          Platforms
        </div>
        <div className="flex flex-col gap-2">
          {platformFilters.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2 text-[12px] text-[hsl(39_66%_90%/0.6)] cursor-pointer hover:text-[hsl(39_66%_90%)]">
              <div className={cn("w-2 h-2 rounded-full flex-shrink-0", color)} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* User section */}
      <div className="border-t border-[hsl(var(--sand))]/10 p-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20">
            <User className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-[11px] font-medium text-[hsl(39_66%_90%/0.7)]">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[hsl(39_66%_90%/0.3)] hover:text-destructive hover:bg-transparent"
            onClick={signOut}
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

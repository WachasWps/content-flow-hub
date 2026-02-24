import { CalendarDays, LayoutGrid, Settings, LogOut, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", icon: CalendarDays, label: "Calendar" },
  { to: "/board", icon: LayoutGrid, label: "Board" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function AppSidebar() {
  const { signOut, user } = useAuth();
  const location = useLocation();

  return (
    <aside className="flex h-screen w-60 flex-col border-r pop-border border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary pop-shadow">
          <CalendarDays className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-sidebar-foreground tracking-tight">ContentCal</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
              location.pathname === to
                ? "bg-sidebar-accent text-sidebar-accent-foreground pop-shadow"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:translate-x-0.5"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t pop-border border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pop-orange/15 pop-border border-pop-orange/30">
            <User className="h-4 w-4 text-pop-orange" />
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground/50 hover:text-destructive" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

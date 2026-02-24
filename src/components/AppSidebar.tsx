import { CalendarDays, LogOut, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import calyLogo from "@/assets/caly-logo.png";

const navItems = [
  { to: "/", icon: CalendarDays, label: "Calendar" },
];

export default function AppSidebar() {
  const { signOut, user } = useAuth();
  const location = useLocation();

  return (
    <aside className="flex h-screen w-[240px] flex-col border-r bg-sidebar">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <img src={calyLogo} alt="Caly logo" className="h-8 w-auto dark:invert" />
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              location.pathname === to
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground/40 hover:text-destructive" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import calyLogo from "@/assets/caly-logo.png";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const platformConfig: Record<string, { color: string; icon: string }> = {
  instagram: { color: "hsl(342 84% 70%)", icon: "📸" },
  youtube: { color: "hsl(345 78% 59%)", icon: "▶️" },
  linkedin: { color: "hsl(226 64% 65%)", icon: "💼" },
  twitter: { color: "hsl(197 60% 60%)", icon: "🐦" },
};

const statusConfig: Record<string, { bg: string; label: string }> = {
  idea: { bg: "bg-accent/85 text-white", label: "idea" },
  in_editing: { bg: "bg-[hsl(var(--status-editing))]/85 text-white", label: "editing" },
  under_review: { bg: "bg-[hsl(var(--pop-purple))]/85 text-white", label: "review" },
  ready_to_post: { bg: "bg-[hsl(var(--status-ready))]/85 text-white", label: "ready" },
  posted: { bg: "bg-[hsl(var(--pop-green))]/85 text-white", label: "posted" },
};

export default function SharedCalendar() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarStart.getTime(), calendarEnd.getTime()]
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["shared-calendar", token, format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      // Call Supabase edge function directly (hosted on Supabase, not Vercel)
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/public-calendar?token=${token}&month=${format(
          currentDate,
          "yyyy-MM"
        )}`,
        { headers: { "Content-Type": "application/json" } }
      );
      if (!resp.ok) throw new Error("Invalid or expired share link");
      return resp.json();
    },
    enabled: !!token,
  });

  const postsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    (data?.posts || []).forEach((p: any) => {
      if (p.publish_date) {
        const key = p.publish_date.slice(0, 10);
        (map[key] ??= []).push(p);
      }
    });
    return map;
  }, [data?.posts]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">No share token provided.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <img src={calyLogo} alt="Caly" className="mx-auto h-10" />
          <p className="text-destructive font-medium">This share link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-[hsl(var(--warm-white))] px-6 py-4">
        <div className="flex items-center gap-3">
          <img src={calyLogo} alt="Caly" className="h-8" />
          {data?.label && (
            <span className="text-sm text-muted-foreground">· {data.label}</span>
          )}
        </div>
        <span className="text-[11px] font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
          Read-only view
        </span>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 py-5">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-card">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="font-serif-display text-xl font-semibold min-w-[200px] text-center">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-card">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar */}
      <div className="px-6 pb-10 max-w-6xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">Loading calendar…</div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground py-1.5">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const dayPosts = postsByDate[key] || [];
                const inMonth = isSameMonth(day, currentDate);
                const dayIsToday = isToday(day);

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "relative flex min-h-[100px] flex-col rounded-[10px] p-2.5 border-[1.5px] border-transparent",
                      inMonth ? "bg-[hsl(var(--warm-white))]" : "bg-transparent opacity-40",
                      dayIsToday && "bg-primary/5 !border-primary"
                    )}
                  >
                    <span className={cn("font-serif-body text-[13px] mb-1.5", dayIsToday ? "text-primary font-semibold" : "text-muted-foreground")}>
                      {format(day, "d")}
                    </span>
                    {inMonth && dayPosts.map((p: any) => {
                      const plat = platformConfig[p.platform];
                      const stat = statusConfig[p.status];
                      return (
                        <div key={p.id} className="flex items-center gap-1.5 rounded-md bg-card px-1.5 py-1 mb-1">
                          <span className={cn("shrink-0 text-[7px] px-1.5 py-[1px] rounded-full font-semibold uppercase tracking-wide", stat?.bg)}>
                            {stat?.label}
                          </span>
                          <div className="shrink-0 w-[6px] h-[6px] rounded-full" style={{ background: plat?.color }} />
                          <span className="text-[9px] font-medium text-foreground truncate">{p.title}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <footer className="border-t px-6 py-6 text-center text-xs text-muted-foreground">
        Shared via <span className="font-semibold text-primary">Caly</span> · Content Calendar
      </footer>
    </div>
  );
}

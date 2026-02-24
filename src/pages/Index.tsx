import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import NewPostDialog from "@/components/NewPostDialog";
import type { Tables } from "@/integrations/supabase/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const statusStyles: Record<string, string> = {
  idea: "bg-pop-blue/10 text-pop-blue border-pop-blue/20",
  in_editing: "bg-pop-yellow/10 text-pop-yellow border-pop-yellow/20",
  under_review: "bg-pop-purple/10 text-pop-purple border-pop-purple/20",
  ready_to_post: "bg-pop-green/10 text-pop-green border-pop-green/20",
  posted: "bg-muted text-muted-foreground border-muted",
};

const platformIcon: Record<string, string> = {
  instagram: "IG",
  youtube: "YT",
  linkedin: "LI",
  twitter: "TW",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarStart.getTime(), calendarEnd.getTime()]
  );

  const { data: posts = [], refetch } = useQuery({
    queryKey: ["posts", format(monthStart, "yyyy-MM"), format(monthEnd, "yyyy-MM")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .gte("publish_date", format(calendarStart, "yyyy-MM-dd"))
        .lte("publish_date", format(calendarEnd, "yyyy-MM-dd"));
      if (error) throw error;
      return data as Tables<"posts">[];
    },
  });

  const postsByDate = useMemo(() => {
    const map: Record<string, Tables<"posts">[]> = {};
    posts.forEach((p) => {
      if (p.publish_date) {
        const key = p.publish_date.slice(0, 10);
        (map[key] ??= []).push(p);
      }
    });
    return map;
  }, [posts]);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">{format(currentDate, "MMMM yyyy")}</h1>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={goToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <NewPostDialog
          defaultDate={selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined}
          onCreated={() => refetch()}
        />
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="grid h-full grid-cols-7">
          {WEEKDAYS.map((day) => (
            <div key={day} className="border-b border-r px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {day}
            </div>
          ))}

          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayPosts = postsByDate[key] || [];
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "relative flex min-h-[100px] flex-col border-b border-r p-2 text-left transition-colors hover:bg-primary/[0.03]",
                  !isSameMonth(day, currentDate) && "bg-muted/20 text-muted-foreground/40",
                  selectedDate && isSameDay(day, selectedDate) && "bg-primary/[0.04] ring-2 ring-inset ring-primary/20"
                )}
              >
                <span
                  className={cn(
                    "mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                    isToday(day) && "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="space-y-0.5 overflow-hidden">
                  {dayPosts.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className={cn(
                        "flex items-center gap-1 truncate rounded border px-1.5 py-0.5 text-[10px] font-medium",
                        statusStyles[p.status] || "bg-muted text-muted-foreground"
                      )}
                    >
                      <span className="shrink-0 text-[9px] font-bold opacity-70">{platformIcon[p.platform]}</span>
                      <span className="truncate">{p.title}</span>
                    </div>
                  ))}
                  {dayPosts.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{dayPosts.length - 3} more</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

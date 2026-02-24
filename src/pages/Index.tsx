import { useState, useMemo, useCallback } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import NewPostDialog from "@/components/NewPostDialog";
import type { Tables } from "@/integrations/supabase/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const statusColors: Record<string, string> = {
  idea: "bg-pop-blue/15 text-pop-blue",
  in_editing: "bg-pop-yellow/15 text-pop-yellow",
  under_review: "bg-pop-purple/15 text-pop-purple",
  ready_to_post: "bg-pop-green/15 text-pop-green",
  posted: "bg-muted text-muted-foreground",
};

const platformEmoji: Record<string, string> = {
  instagram: "📸",
  youtube: "🎬",
  linkedin: "💼",
  twitter: "🐦",
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
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">{format(currentDate, "MMMM yyyy")}</h1>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 pop-border" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 pop-border" onClick={goToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 pop-border" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <NewPostDialog
          defaultDate={selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined}
          onCreated={() => refetch()}
        />
      </header>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="grid h-full grid-cols-7">
          {/* Weekday headers */}
          {WEEKDAYS.map((day) => (
            <div key={day} className="border-b border-r px-2 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {day}
            </div>
          ))}

          {/* Day cells */}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayPosts = postsByDate[key] || [];
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "relative flex min-h-[100px] flex-col border-b border-r p-2 text-left transition-all hover:bg-accent/20",
                  !isSameMonth(day, currentDate) && "bg-muted/20 text-muted-foreground/40",
                  selectedDate && isSameDay(day, selectedDate) && "bg-primary/5 ring-2 ring-inset ring-primary/30"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                    isToday(day) && "bg-primary text-primary-foreground pop-shadow"
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-0.5 overflow-hidden">
                  {dayPosts.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className={cn(
                        "truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                        statusColors[p.status] || "bg-muted text-muted-foreground"
                      )}
                    >
                      {platformEmoji[p.platform] || ""} {p.title}
                    </div>
                  ))}
                  {dayPosts.length > 3 && (
                    <span className="text-[10px] text-muted-foreground font-medium">+{dayPosts.length - 3} more</span>
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

import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import NewPostDialog from "@/components/NewPostDialog";
import type { Tables } from "@/integrations/supabase/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Soft pastel cell backgrounds matching the reference image
const statusCellStyles: Record<string, { bg: string; dateBg: string; dateText: string }> = {
  idea: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    dateBg: "bg-blue-200 dark:bg-blue-800",
    dateText: "text-blue-900 dark:text-blue-100",
  },
  in_editing: {
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    dateBg: "bg-yellow-200 dark:bg-yellow-800",
    dateText: "text-yellow-900 dark:text-yellow-100",
  },
  under_review: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    dateBg: "bg-purple-200 dark:bg-purple-800",
    dateText: "text-purple-900 dark:text-purple-100",
  },
  ready_to_post: {
    bg: "bg-green-50 dark:bg-green-950/30",
    dateBg: "bg-green-200 dark:bg-green-800",
    dateText: "text-green-900 dark:text-green-100",
  },
  posted: {
    bg: "bg-pink-50 dark:bg-pink-950/30",
    dateBg: "bg-pink-200 dark:bg-pink-800",
    dateText: "text-pink-900 dark:text-pink-100",
  },
};

const platformColors: Record<string, string> = {
  instagram: "bg-pop-pink text-white",
  youtube: "bg-destructive text-white",
  linkedin: "bg-pop-blue text-white",
  twitter: "bg-pop-blue text-white",
};

const platformLabels: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  twitter: "Twitter",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

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

  // Unique platforms used
  const usedPlatforms = useMemo(() => {
    const set = new Set(posts.map((p) => p.platform));
    return Array.from(set);
  }, [posts]);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight">{format(currentDate, "MMMM")}</h1>
          <button
            onClick={goToday}
            className="inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1 text-sm font-semibold shadow-sm transition-colors hover:bg-muted"
          >
            {format(currentDate, "yyyy")}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <div className="ml-2 flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
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
      <div className="flex-1 overflow-auto px-8 pb-6">
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b bg-muted/40">
            {WEEKDAYS.map((day) => (
              <div key={day} className="px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayPosts = postsByDate[key] || [];
              const firstPost = dayPosts[0];
              const cellStyle = firstPost ? statusCellStyles[firstPost.status] : null;
              const inMonth = isSameMonth(day, currentDate);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "relative flex min-h-[110px] flex-col border-b border-r p-3 text-left transition-all",
                    inMonth ? "hover:bg-muted/30" : "text-muted-foreground/30",
                    cellStyle && inMonth ? cellStyle.bg : "",
                    selectedDate && isSameDay(day, selectedDate) && "ring-2 ring-inset ring-primary/30"
                  )}
                >
                  {/* Date number */}
                  <span
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold",
                      isToday(day) && "bg-primary text-primary-foreground shadow-sm",
                      !isToday(day) && cellStyle && inMonth && dayPosts.length > 0 && `${cellStyle.dateBg} ${cellStyle.dateText}`,
                      !isToday(day) && !cellStyle && "text-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {/* Post titles */}
                  {inMonth && dayPosts.length > 0 && (
                    <div className="mt-1.5 space-y-0.5">
                      {dayPosts.slice(0, 2).map((p) => (
                        <p key={p.id} className="truncate text-xs font-semibold text-foreground/80">
                          {p.title}
                        </p>
                      ))}
                      {dayPosts.length > 2 && (
                        <p className="text-[10px] font-medium text-muted-foreground">
                          +{dayPosts.length - 2} more
                        </p>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend - like the reference */}
        {usedPlatforms.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {usedPlatforms.map((p) => (
              <span
                key={p}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  platformColors[p]
                )}
              >
                {platformLabels[p]}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

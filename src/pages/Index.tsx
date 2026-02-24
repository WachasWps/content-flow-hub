import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Share2, MessageCircle, Link as LinkIcon, Check, Copy, Pencil } from "lucide-react";
import html2canvas from "html2canvas";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import NewPostDialog from "@/components/NewPostDialog";
import PostDetailDialog from "@/components/PostDetailDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { Tables } from "@/integrations/supabase/types";
import { useWorkspace } from "@/lib/workspace";

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

const HOURS = ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPost, setSelectedPost] = useState<Tables<"posts"> | null>(null);
  const [view, setView] = useState<"month" | "week">("month");
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const { calendars, activeCalendarId, setActiveCalendarId, reload } = useWorkspace();

  const activeCalendar = useMemo(
    () => calendars.find((c) => c.id === activeCalendarId) ?? null,
    [calendars, activeCalendarId]
  );

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarStart.getTime(), calendarEnd.getTime()]
  );

  // Week view days
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = useMemo(
    () => eachDayOfInterval({ start: weekStart, end: endOfWeek(today, { weekStartsOn: 1 }) }),
    [weekStart.getTime()]
  );

  const { data: posts = [], refetch } = useQuery({
    queryKey: ["posts", activeCalendarId, format(monthStart, "yyyy-MM"), format(monthEnd, "yyyy-MM")],
    queryFn: async () => {
      if (!activeCalendarId) return [] as Tables<"posts">[];
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("calendar_id", activeCalendarId)
        .gte("publish_date", format(calendarStart, "yyyy-MM-dd"))
        .lte("publish_date", format(calendarEnd, "yyyy-MM-dd"));
      if (error) throw error;
      return data as Tables<"posts">[];
    },
    enabled: !!activeCalendarId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
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

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const quotes = ["plan something ✦", "rest ◦", "create freely", "brainstorm ✧", "breathe ◌"];

  const handleCreateShareLink = async () => {
    if (!user || !activeCalendarId) return;
    const { data, error } = await supabase
      .from("shared_calendars")
      .insert({
        created_by: user.id,
        label: format(currentDate, "MMMM yyyy") + " Calendar",
        calendar_id: activeCalendarId,
      })
      .select("token")
      .single();
    if (error) {
      toast({ title: "Failed to create share link", variant: "destructive" });
      return;
    }
    const link = `${window.location.origin}/shared?token=${data.token}`;
    setShareLink(link);
  };

  const handleCopyShareLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setShareCopied(true);
    toast({ title: "Link copied!" });
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleWhatsAppShare = async () => {
    if (!shareLink) {
      await handleCreateShareLink();
    }
    const message = `📅 Content Calendar — ${format(
      currentDate,
      "MMMM yyyy"
    )}\nShared via Caly\n${shareLink || ""}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleRenameCalendar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeCalendarId) return;
    const trimmed = renameValue.trim();
    if (!trimmed) return;

    const { error } = await supabase
      .from("calendars")
      .update({ name: trimmed })
      .eq("id", activeCalendarId);

    if (error) {
      toast({
        title: "Failed to rename calendar",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Calendar renamed" });
    setRenameOpen(false);
    reload();
  };

  const handlePostDrop = async (date: Date, event: React.DragEvent) => {
    event.preventDefault();
    const postId = event.dataTransfer.getData("text/plain");
    if (!postId) return;
    const targetDate = format(date, "yyyy-MM-dd");
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const { error } = await supabase
      .from("posts")
      .update({ publish_date: `${targetDate}T00:00:00` })
      .eq("id", postId);

    if (error) {
      toast({ title: "Failed to move post", description: error.message, variant: "destructive" });
    } else {
      await refetch();
      toast({ title: "Post moved" });
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[hsl(var(--sand))] bg-[hsl(var(--warm-white))] px-4 sm:px-8 py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-[hsl(var(--sand))] bg-transparent text-muted-foreground transition-all hover:border-primary hover:text-primary hover:bg-primary/[0.06]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="font-serif-display text-[18px] sm:text-[22px] font-semibold text-foreground min-w-0 sm:min-w-[210px] text-center">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <button
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-[hsl(var(--sand))] bg-transparent text-muted-foreground transition-all hover:border-primary hover:text-primary hover:bg-primary/[0.06]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto">
          {/* Share popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex h-9 items-center gap-2 rounded-lg border border-[hsl(var(--sand))] px-3 text-[12px] font-medium text-muted-foreground transition-all hover:border-primary hover:text-primary">
                <Share2 className="h-3.5 w-3.5" />
                Share
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3 space-y-3" align="end">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Share Calendar</p>
              
              {!shareLink ? (
                <button
                  onClick={handleCreateShareLink}
                  className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-[13px] font-medium transition-colors hover:bg-card"
                >
                  <LinkIcon className="h-4 w-4 text-primary" />
                  Generate public link
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-lg border bg-card px-2 py-1.5">
                    <input
                      readOnly
                      value={shareLink}
                      className="flex-1 bg-transparent text-[11px] text-foreground outline-none truncate"
                    />
                    <button onClick={handleCopyShareLink} className="shrink-0 p-1 rounded hover:bg-muted">
                      {shareCopied ? <Check className="h-3.5 w-3.5 text-pop-green" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleWhatsAppShare}
                className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-[13px] font-medium transition-colors hover:bg-card"
              >
                <MessageCircle className="h-4 w-4 text-pop-green" />
                Share on WhatsApp
              </button>
            </PopoverContent>
          </Popover>

          {/* Calendar selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground hidden sm:inline">Calendar</span>
            <Select
              value={activeCalendarId ?? undefined}
              onValueChange={(val) => setActiveCalendarId(val)}
            >
              <SelectTrigger className="h-9 w-[160px] text-[12px] bg-card border-[hsl(var(--sand))]">
                <SelectValue placeholder="Select calendar" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {calendars.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover
              open={renameOpen}
              onOpenChange={(open) => {
                setRenameOpen(open);
                if (open && activeCalendar) {
                  setRenameValue(activeCalendar.name);
                }
              }}
            >
              <PopoverTrigger asChild>
                <button
                  disabled={!activeCalendar}
                  className="flex items-center justify-center h-8 w-8 rounded-md border border-[hsl(var(--sand))] text-muted-foreground hover:text-foreground hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Rename calendar"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3 space-y-3" align="start">
                <p className="text-[11px] text-muted-foreground">
                  Give this calendar a clear name so teammates understand what it&apos;s for.
                </p>
                <form onSubmit={handleRenameCalendar} className="space-y-2">
                  <Input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    placeholder="e.g. Brand A – Instagram"
                    className="h-8 text-[12px]"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="text-[11px] px-2 py-1 rounded-md border border-border text-muted-foreground hover:bg-muted"
                      onClick={() => setRenameOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!renameValue.trim()}
                      className="text-[11px] px-3 py-1 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </PopoverContent>
            </Popover>
          </div>

          {/* View toggle */}
          <div className="flex rounded-lg border border-[hsl(var(--sand))] bg-[hsl(var(--card))] p-[3px]">
            <button
              onClick={() => setView("month")}
              className={cn(
                "px-4 py-1.5 rounded-md text-[12px] font-medium transition-all font-sans",
                view === "month"
                  ? "bg-primary text-primary-foreground shadow-[0_2px_8px_hsl(18_63%_47%/0.3)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Month
            </button>
            <button
              onClick={() => setView("week")}
              className={cn(
                "px-4 py-1.5 rounded-md text-[12px] font-medium transition-all font-sans",
                view === "week"
                  ? "bg-primary text-primary-foreground shadow-[0_2px_8px_hsl(18_63%_47%/0.3)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Week
            </button>
          </div>

          <NewPostDialog
            defaultDate={selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined}
            onCreated={() => refetch()}
          />
        </div>
      </div>

      {/* Calendar content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 sm:px-8">
        {view === "month" ? (
          <div id="calendar-grid">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground py-1.5"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((day, i) => {
                const key = format(day, "yyyy-MM-dd");
                const dayPosts = postsByDate[key] || [];
                const inMonth = isSameMonth(day, currentDate);
                const dayIsToday = isToday(day);
                const dayNum = parseInt(format(day, "d"));

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handlePostDrop(day, e)}
                    style={{ animationDelay: `${i * 0.02}s` }}
                    className={cn(
                      "relative flex min-h-[80px] sm:min-h-[120px] flex-col rounded-[10px] p-1.5 sm:p-2.5 text-left transition-all border-[1.5px] border-transparent cursor-pointer animate-in fade-in slide-in-from-bottom-1",
                      inMonth
                        ? "bg-[hsl(var(--warm-white))] hover:border-[hsl(var(--sand))] hover:shadow-[0_4px_16px_hsl(22_31%_13%/0.07)] hover:-translate-y-px"
                        : "bg-transparent opacity-40",
                      dayIsToday && "bg-primary/5 !border-primary",
                      selectedDate && isSameDay(day, selectedDate) && "ring-2 ring-primary/30"
                    )}
                  >
                    {/* Day number */}
                    <span
                      className={cn(
                        "font-serif-body text-[14px] mb-2",
                        dayIsToday ? "text-primary font-semibold" : "text-muted-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </span>

                    {/* Posts */}
                    {inMonth && dayPosts.length > 0 && (
                      <div className="flex-1 space-y-1">
                        {dayPosts.slice(0, 2).map((p) => {
                          const plat = platformConfig[p.platform];
                          const stat = statusConfig[p.status];
                          return (
                            <div
                              key={p.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData("text/plain", p.id);
                                e.dataTransfer.effectAllowed = "move";
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPost(p);
                              }}
                              className="flex items-center gap-1.5 rounded-md bg-card px-1.5 py-1 cursor-pointer transition-all hover:shadow-sm hover:bg-card/80"
                            >
                              {/* Status pill */}
                              <span
                                className={cn(
                                  "shrink-0 text-[7px] px-1.5 py-[1px] rounded-full font-semibold uppercase tracking-wide",
                                  stat?.bg
                                )}
                              >
                                {stat?.label}
                              </span>
                              {/* Platform dot */}
                              <div
                                className="shrink-0 w-[6px] h-[6px] rounded-full"
                                style={{ background: plat?.color }}
                              />
                              {/* Title */}
                              <span className="text-[9px] font-medium text-foreground truncate">
                                {p.title}
                              </span>
                            </div>
                          );
                        })}
                        {dayPosts.length > 2 && (
                          <p className="text-[9px] font-medium text-muted-foreground text-center">
                            +{dayPosts.length - 2} more
                          </p>
                        )}
                      </div>
                    )}

                    {/* Empty day quotes */}
                    {inMonth && dayPosts.length === 0 && dayNum % 3 === 0 && (
                      <div className="font-serif-body italic text-[8px] text-muted-foreground/35 leading-snug p-1 text-center">
                        {quotes[dayNum % quotes.length]}
                      </div>
                    )}

                    {/* Add hint on hover */}
                    <div className="absolute bottom-2 right-2 w-[22px] h-[22px] rounded-full bg-card border-[1.5px] border-dashed border-[hsl(var(--sand))] flex items-center justify-center text-[13px] text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      +
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Week View */
          <div className="rounded-[14px] border-[1.5px] border-[hsl(var(--sand))] overflow-hidden bg-[hsl(var(--warm-white))]">
            <div
              className="grid"
              style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}
            >
              {/* Corner */}
              <div className="bg-card border-b-[1.5px] border-r border-[hsl(var(--sand))] p-3.5" />

              {/* Day headers */}
              {weekDays.map((d, i) => {
                const dayIsToday = isToday(d);
                return (
                  <div
                    key={d.toISOString()}
                    className={cn(
                      "bg-card border-b-[1.5px] border-[hsl(var(--sand))] px-2.5 py-3.5 text-center",
                      i < 6 && "border-r"
                    )}
                  >
                    <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      {WEEKDAYS[i]}
                    </div>
                    <div
                      className={cn(
                        "font-serif-display text-[22px] font-semibold leading-none mt-0.5",
                        dayIsToday ? "text-primary" : "text-foreground"
                      )}
                    >
                      {format(d, "d")}
                    </div>
                  </div>
                );
              })}

              {/* Time slots */}
              {HOURS.map((hr) => (
              <div key={hr} className="contents">
                  <div
                    className="border-b border-r border-[hsl(var(--sand))]/30 bg-card px-2.5 py-2 text-right text-[9px] text-muted-foreground tracking-[0.03em]"
                  >
                    {hr}
                  </div>
                  {weekDays.map((d, di) => {
                    const dayIsToday = isToday(d);
                    const dateKey = format(d, "yyyy-MM-dd");
                    const dayPosts = postsByDate[dateKey] || [];

                    return (
                      <div
                        key={`${hr}-${d.toISOString()}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handlePostDrop(d, e)}
                        className={cn(
                          "border-b border-[hsl(var(--sand))]/30 p-1 min-h-[64px] transition-colors",
                          di < 6 && "border-r",
                          dayIsToday && "bg-primary/[0.03]",
                          "hover:bg-primary/[0.03]"
                        )}
                      >
                        {/* Show posts in first time slot only */}
                        {hr === "9 AM" &&
                          dayPosts.slice(0, 1).map((p) => {
                            const plat = platformConfig[p.platform];
                            return (
                              <div
                                key={p.id}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData("text/plain", p.id);
                                  e.dataTransfer.effectAllowed = "move";
                                }}
                                onClick={() => setSelectedPost(p)}
                                className="rounded-[7px] overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
                              >
                                <div
                                  className="w-full aspect-video flex items-center justify-center bg-card text-lg"
                                >
                                  {plat?.icon || "📄"}
                                </div>
                                <div className="px-1.5 py-1 bg-[hsl(var(--warm-white))]">
                                  <div className="text-[9px] font-semibold text-foreground truncate mb-0.5">
                                    {p.title}
                                  </div>
                                  <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
                                    <div
                                      className="w-[5px] h-[5px] rounded-full"
                                      style={{ background: plat?.color }}
                                    />
                                    {p.platform}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <PostDetailDialog
        post={selectedPost}
        open={!!selectedPost}
        onOpenChange={(open) => {
          if (!open) setSelectedPost(null);
        }}
        onUpdated={() => refetch()}
      />
    </div>
  );
}

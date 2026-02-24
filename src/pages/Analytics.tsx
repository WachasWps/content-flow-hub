import { useMemo } from "react";
import { TrendingUp, TrendingDown, Calendar, Zap, Award, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";
import { format, subDays, startOfWeek, eachDayOfInterval, getDay } from "date-fns";

const platformColors: Record<string, string> = {
  instagram: "bg-platform-instagram",
  youtube: "bg-platform-youtube",
  linkedin: "bg-platform-linkedin",
  twitter: "bg-platform-twitter",
};

const platformLabels: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  twitter: "Twitter",
};

export default function AnalyticsPage() {
  const { data: posts = [] } = useQuery({
    queryKey: ["analytics-posts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Tables<"posts">[];
    },
  });

  const stats = useMemo(() => {
    const total = posts.length;
    const posted = posts.filter((p) => p.status === "posted").length;
    const platforms = posts.reduce<Record<string, number>>((acc, p) => { acc[p.platform] = (acc[p.platform] || 0) + 1; return acc; }, {});
    const bestPlatform = Object.entries(platforms).sort((a, b) => b[1] - a[1])[0];

    // Streak: consecutive days with posts
    const postDates = new Set(posts.filter((p) => p.publish_date).map((p) => p.publish_date!.slice(0, 10)));
    let streak = 0;
    let d = new Date();
    while (postDates.has(format(d, "yyyy-MM-dd"))) { streak++; d = subDays(d, 1); }

    return { total, posted, bestPlatform, streak, platforms };
  }, [posts]);

  // Weekly heatmap (last 12 weeks)
  const heatmapData = useMemo(() => {
    const weeks: { date: Date; count: number }[][] = [];
    const today = new Date();
    const start = subDays(today, 83); // ~12 weeks
    const days = eachDayOfInterval({ start, end: today });
    const postCounts: Record<string, number> = {};
    posts.forEach((p) => { if (p.publish_date) { const k = p.publish_date.slice(0, 10); postCounts[k] = (postCounts[k] || 0) + 1; } });

    let week: { date: Date; count: number }[] = [];
    days.forEach((d) => {
      if (getDay(d) === 1 && week.length > 0) { weeks.push(week); week = []; }
      week.push({ date: d, count: postCounts[format(d, "yyyy-MM-dd")] || 0 });
    });
    if (week.length > 0) weeks.push(week);
    return weeks;
  }, [posts]);

  const statCards = [
    { label: "Total Posts", value: stats.total, icon: Calendar, trend: "+12%", up: true },
    { label: "Published", value: stats.posted, icon: Zap, trend: `${stats.total > 0 ? Math.round((stats.posted / stats.total) * 100) : 0}%`, up: true },
    { label: "Best Platform", value: stats.bestPlatform ? platformLabels[stats.bestPlatform[0]] || stats.bestPlatform[0] : "—", icon: Award, trend: stats.bestPlatform ? `${stats.bestPlatform[1]} posts` : "", up: true },
    { label: "Posting Streak", value: `${stats.streak}d`, icon: Flame, trend: stats.streak > 3 ? "On fire!" : "Keep going", up: stats.streak > 0 },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-border bg-[hsl(var(--warm-white))] px-8 py-4">
        <h1 className="font-serif-display text-[22px] font-semibold text-foreground">📈 Analytics</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-[hsl(var(--warm-white))] p-5 transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{s.label}</span>
                <s.icon className="h-4 w-4 text-muted-foreground/50" />
              </div>
              <div className="font-serif-display text-[28px] font-bold text-foreground leading-none mb-1">{s.value}</div>
              <div className={cn("flex items-center gap-1 text-[12px] font-medium", s.up ? "text-status-ready" : "text-muted-foreground")}>
                {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {s.trend}
              </div>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div className="rounded-xl border border-border bg-[hsl(var(--warm-white))] p-6">
          <h2 className="font-serif-display text-[16px] font-semibold text-foreground mb-4">Posting Consistency</h2>
          <div className="flex gap-1">
            {heatmapData.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day) => (
                  <div
                    key={day.date.toISOString()}
                    title={`${format(day.date, "MMM d")}: ${day.count} posts`}
                    className={cn(
                      "w-4 h-4 rounded-sm transition-colors",
                      day.count === 0 ? "bg-muted" : day.count === 1 ? "bg-primary/30" : day.count === 2 ? "bg-primary/60" : "bg-primary"
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <div className="w-3 h-3 rounded-sm bg-primary/30" />
            <div className="w-3 h-3 rounded-sm bg-primary/60" />
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span>More</span>
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="rounded-xl border border-border bg-[hsl(var(--warm-white))] p-6">
          <h2 className="font-serif-display text-[16px] font-semibold text-foreground mb-4">Platform Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(stats.platforms).sort((a, b) => b[1] - a[1]).map(([platform, count]) => (
              <div key={platform} className="flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full", platformColors[platform])} />
                <span className="text-[13px] font-medium text-foreground w-24">{platformLabels[platform] || platform}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className={cn("h-full rounded-full", platformColors[platform])} style={{ width: `${(count / stats.total) * 100}%` }} />
                </div>
                <span className="text-[13px] font-semibold text-foreground w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Posts */}
        <div className="rounded-xl border border-border bg-[hsl(var(--warm-white))] p-6">
          <h2 className="font-serif-display text-[16px] font-semibold text-foreground mb-4">Recent Posts</h2>
          <div className="grid grid-cols-3 gap-4">
            {posts.slice(0, 3).map((post, i) => (
              <div key={post.id} className="rounded-lg border border-border bg-card/50 overflow-hidden">
                <div className="aspect-video bg-card flex items-center justify-center text-2xl">
                  {post.platform === "instagram" ? "📸" : post.platform === "youtube" ? "▶️" : post.platform === "linkedin" ? "💼" : "🐦"}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[11px] font-semibold text-primary">#{i + 1}</span>
                    <div className={cn("w-2 h-2 rounded-full", platformColors[post.platform])} />
                  </div>
                  <h3 className="text-[13px] font-medium text-foreground truncate">{post.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

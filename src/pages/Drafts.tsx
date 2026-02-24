import { useState, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import PostDetailDialog from "@/components/PostDetailDialog";
import type { Tables } from "@/integrations/supabase/types";

const platformConfig: Record<string, { color: string; icon: string }> = {
  instagram: { color: "bg-platform-instagram", icon: "📸" },
  youtube: { color: "bg-platform-youtube", icon: "▶️" },
  linkedin: { color: "bg-platform-linkedin", icon: "💼" },
  twitter: { color: "bg-platform-twitter", icon: "🐦" },
};

type Column = { key: string; title: string; statuses: string[]; accent: string; emoji: string };

const columns: Column[] = [
  { key: "ideas", title: "Ideas", statuses: ["idea"], accent: "border-t-pop-pink", emoji: "💡" },
  { key: "progress", title: "In Progress", statuses: ["in_editing", "under_review"], accent: "border-t-pop-blue", emoji: "✏️" },
  { key: "ready", title: "Ready to Schedule", statuses: ["ready_to_post"], accent: "border-t-pop-green", emoji: "🚀" },
];

export default function DraftsPage() {
  const [selectedPost, setSelectedPost] = useState<Tables<"posts"> | null>(null);
  const [draggedPost, setDraggedPost] = useState<Tables<"posts"> | null>(null);
  const { toast } = useToast();

  const { data: posts = [], refetch } = useQuery({
    queryKey: ["draft-posts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").in("status", ["idea", "in_editing", "under_review", "ready_to_post"]).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Tables<"posts">[];
    },
  });

  const handleDrop = async (column: Column) => {
    if (!draggedPost) return;
    const newStatus = column.statuses[0];
    if (draggedPost.status === newStatus) return;
    const { error } = await supabase.from("posts").update({ status: newStatus as any }).eq("id", draggedPost.id);
    if (!error) { toast({ title: `Moved to ${column.title}` }); refetch(); }
    setDraggedPost(null);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex items-center justify-between gap-4 border-b border-border bg-[hsl(var(--warm-white))] px-8 py-4">
        <h1 className="font-serif-display text-[22px] font-semibold text-foreground">✦ Drafts</h1>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all shadow-[0_2px_8px_hsl(18_63%_47%/0.25)] hover:-translate-y-px hover:shadow-[0_4px_16px_hsl(18_63%_47%/0.35)]">
          <Sparkles className="h-4 w-4" />
          AI Assist
        </button>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto p-6 px-8">
        <div className="grid grid-cols-3 gap-5 h-full min-h-0">
          {columns.map((col) => {
            const colPosts = posts.filter((p) => col.statuses.includes(p.status));
            return (
              <div
                key={col.key}
                className={cn("flex flex-col rounded-xl border border-border bg-card/50 overflow-hidden border-t-[3px]", col.accent)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(col)}
              >
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{col.emoji}</span>
                    <h2 className="font-serif-display text-[15px] font-semibold text-foreground">{col.title}</h2>
                  </div>
                  <span className="flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                    {colPosts.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2.5">
                  {colPosts.length === 0 && (
                    <p className="font-serif-body italic text-muted-foreground/50 text-sm text-center py-10">No drafts here yet…</p>
                  )}
                  {colPosts.map((post) => {
                    const plat = platformConfig[post.platform];
                    return (
                      <div
                        key={post.id}
                        draggable
                        onDragStart={() => setDraggedPost(post)}
                        onClick={() => setSelectedPost(post)}
                        className="rounded-lg border border-border bg-[hsl(var(--warm-white))] p-3.5 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
                      >
                        <div className="aspect-[16/9] rounded-md bg-card flex items-center justify-center text-2xl mb-3">
                          {plat?.icon || "📄"}
                        </div>
                        <h3 className="font-serif-body italic text-[13px] text-foreground leading-snug mb-2 line-clamp-2">{post.title}</h3>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", plat?.color)} />
                          <span className="text-[11px] text-muted-foreground capitalize">{post.platform}</span>
                        </div>
                        {post.caption && (
                          <p className="text-[11px] text-muted-foreground/70 mt-2 line-clamp-2">{post.caption}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PostDetailDialog post={selectedPost} open={!!selectedPost} onOpenChange={(o) => { if (!o) setSelectedPost(null); }} onUpdated={() => refetch()} />
    </div>
  );
}

import { useState, useMemo } from "react";
import { Search, Filter, LayoutList, LayoutGrid, Pencil, Copy, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import PostDetailDialog from "@/components/PostDetailDialog";
import NewPostDialog from "@/components/NewPostDialog";
import type { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

const platformConfig: Record<string, { color: string; label: string }> = {
  instagram: { color: "bg-platform-instagram", label: "Instagram" },
  youtube: { color: "bg-platform-youtube", label: "YouTube" },
  linkedin: { color: "bg-platform-linkedin", label: "LinkedIn" },
  twitter: { color: "bg-platform-twitter", label: "Twitter" },
};

const statusConfig: Record<string, { bg: string; label: string }> = {
  idea: { bg: "bg-status-idea/15 text-status-idea", label: "Draft" },
  in_editing: { bg: "bg-status-editing/15 text-status-editing", label: "Editing" },
  under_review: { bg: "bg-status-review/15 text-status-review", label: "Review" },
  ready_to_post: { bg: "bg-status-ready/15 text-status-ready", label: "Scheduled" },
  posted: { bg: "bg-primary/15 text-primary", label: "Published" },
};

export default function PostsPage() {
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedPost, setSelectedPost] = useState<Tables<"posts"> | null>(null);
  const { toast } = useToast();

  const { data: posts = [], refetch } = useQuery({
    queryKey: ["all-posts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Tables<"posts">[];
    },
  });

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (platformFilter !== "all" && p.platform !== platformFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    });
  }, [posts, search, platformFilter, statusFilter]);

  const handleDuplicate = async (post: Tables<"posts">, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase.from("posts").insert({
      title: `${post.title} (copy)`,
      caption: post.caption,
      platform: post.platform,
      status: "idea" as any,
      publish_date: post.publish_date,
      notes: post.notes,
      tags: post.tags,
      script: post.script,
      reference_link: post.reference_link,
      created_by: post.created_by,
    });
    if (!error) { toast({ title: "Post duplicated" }); refetch(); }
  };

  const handleDelete = async (post: Tables<"posts">, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (!error) { toast({ title: "Post deleted" }); refetch(); }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border bg-[hsl(var(--warm-white))] px-4 sm:px-8 py-4">
        <h1 className="font-serif-display text-[18px] sm:text-[22px] font-semibold text-foreground">📋 Posts</h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search posts…"
              className="pl-9 w-[220px] h-9 text-[13px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="h-9 w-[130px] text-[13px]"><SelectValue placeholder="Platform" /></SelectTrigger>
            <SelectContent className="z-[100] bg-popover">
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[130px] text-[13px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="z-[100] bg-popover">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="idea">Draft</SelectItem>
              <SelectItem value="in_editing">Editing</SelectItem>
              <SelectItem value="under_review">Review</SelectItem>
              <SelectItem value="ready_to_post">Scheduled</SelectItem>
              <SelectItem value="posted">Published</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex rounded-lg border border-border bg-card p-[3px]">
            <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded-md transition-all", viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
              <LayoutList className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded-md transition-all", viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <NewPostDialog onCreated={() => refetch()} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <p className="font-serif-body italic text-muted-foreground text-lg">No posts yet — start creating something beautiful ✦</p>
          </div>
        ) : viewMode === "list" ? (
          <div className="rounded-xl border border-border bg-[hsl(var(--warm-white))] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card/50">
                  <th className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Platform</th>
                  <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Status</th>
                  <th className="px-4 py-3 w-[100px]"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((post) => {
                  const plat = platformConfig[post.platform];
                  const stat = statusConfig[post.status];
                  return (
                    <tr
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="group border-b border-border/50 cursor-pointer transition-colors hover:bg-primary/[0.03]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center text-lg flex-shrink-0">
                            {post.platform === "instagram" ? "📸" : post.platform === "youtube" ? "▶️" : post.platform === "linkedin" ? "💼" : "🐦"}
                          </div>
                          <span className="font-medium text-foreground truncate max-w-[300px]">{post.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2.5 h-2.5 rounded-full", plat?.color)} />
                          <span className="text-muted-foreground text-[13px]">{plat?.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground text-[13px]">
                        {post.publish_date ? format(new Date(post.publish_date), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn("inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold", stat?.bg)}>{stat?.label}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={(e) => handleDuplicate(post, e)} className="p-1.5 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/5"><Copy className="h-3.5 w-3.5" /></button>
                          <button onClick={(e) => handleDelete(post, e)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((post) => {
              const plat = platformConfig[post.platform];
              const stat = statusConfig[post.status];
              return (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="group rounded-xl border border-border bg-[hsl(var(--warm-white))] overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="aspect-video bg-card flex items-center justify-center text-3xl">
                    {post.platform === "instagram" ? "📸" : post.platform === "youtube" ? "▶️" : post.platform === "linkedin" ? "💼" : "🐦"}
                  </div>
                  <div className="p-3.5">
                    <h3 className="font-medium text-[13px] text-foreground truncate mb-2">{post.title}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-2 h-2 rounded-full", plat?.color)} />
                        <span className="text-[11px] text-muted-foreground">{plat?.label}</span>
                      </div>
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", stat?.bg)}>{stat?.label}</span>
                    </div>
                    {post.publish_date && (
                      <p className="text-[11px] text-muted-foreground mt-1.5">{format(new Date(post.publish_date), "MMM d, yyyy")}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 px-3 pb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={(e) => handleDuplicate(post, e)} className="p-1.5 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/5"><Copy className="h-3.5 w-3.5" /></button>
                    <button onClick={(e) => handleDelete(post, e)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PostDetailDialog post={selectedPost} open={!!selectedPost} onOpenChange={(o) => { if (!o) setSelectedPost(null); }} onUpdated={() => refetch()} />
    </div>
  );
}

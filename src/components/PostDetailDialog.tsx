import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Calendar, Tag, FileText, User, Image as ImageIcon } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  idea: { label: "Idea", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-950/40" },
  in_editing: { label: "In Editing", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300", bg: "bg-yellow-50 dark:bg-yellow-950/40" },
  under_review: { label: "Under Review", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300", bg: "bg-purple-50 dark:bg-purple-950/40" },
  ready_to_post: { label: "Ready to Post", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", bg: "bg-green-50 dark:bg-green-950/40" },
  posted: { label: "Posted", color: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300", bg: "bg-pink-50 dark:bg-pink-950/40" },
};

const platformLabels: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  twitter: "Twitter",
};

interface PostDetailDialogProps {
  post: Tables<"posts"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

export default function PostDetailDialog({ post, open, onOpenChange, onUpdated }: PostDetailDialogProps) {
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  const { data: files = [] } = useQuery({
    queryKey: ["post-files", post?.id],
    queryFn: async () => {
      if (!post) return [];
      const { data } = await supabase
        .from("post_files")
        .select("*")
        .eq("post_id", post.id);
      return data || [];
    },
    enabled: !!post,
  });

  if (!post) return null;

  const status = statusLabels[post.status] || { label: post.status, color: "bg-muted text-muted-foreground", bg: "bg-muted/30" };

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from("posts")
      .update({ status: newStatus as any })
      .eq("id", post.id);
    setUpdating(false);
    if (error) {
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status updated" });
      onUpdated?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <div className={cn("px-6 pt-6 pb-4", status.bg)}>
          <DialogHeader>
            <div className="flex items-start justify-between gap-4 pr-6">
              <DialogTitle className="text-xl leading-snug">{post.title}</DialogTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Select defaultValue={post.status} onValueChange={handleStatusChange} disabled={updating}>
                <SelectTrigger className={cn("h-7 w-auto gap-1.5 rounded-full border-0 px-3 text-xs font-semibold", status.color)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-popover">
                  {Object.entries(statusLabels).map(([key, val]) => (
                    <SelectItem key={key} value={key} className="text-xs font-medium">
                      {val.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline" className="text-xs font-medium border-foreground/20">
                {platformLabels[post.platform] || post.platform}
              </Badge>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 pb-6 pt-4">
          {/* Caption */}
          {post.caption && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Caption</p>
              <p className="text-sm leading-relaxed">{post.caption}</p>
            </div>
          )}

          {/* Script */}
          {post.script && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Script</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.script}</p>
            </div>
          )}

          {/* Image */}
          {files.length > 0 && (
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <ImageIcon className="h-3 w-3" /> Attachments
              </p>
              <div className="flex flex-wrap gap-2">
                {files.map((f) => {
                  const url = supabase.storage.from("post-assets").getPublicUrl(f.file_path).data.publicUrl;
                  return (
                    <img
                      key={f.id}
                      src={url}
                      alt="Attachment"
                      className="h-24 w-auto rounded-lg border object-cover"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-3">
            {post.publish_date && (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">
                  {format(new Date(post.publish_date), "MMM d, yyyy")}
                </span>
              </div>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate text-xs font-medium">{post.tags.join(", ")}</span>
              </div>
            )}
          </div>

          {/* Reference link */}
          {post.reference_link && (
            <a
              href={post.reference_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="truncate">{post.reference_link}</span>
            </a>
          )}

          {/* Notes */}
          {post.notes && (
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <FileText className="h-3 w-3" /> Notes
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">{post.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

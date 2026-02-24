import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Calendar, Tag, FileText, Trash2, Pencil } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    title: "",
    caption: "",
    notes: "",
    reference_link: "",
    publish_date: "",
    tags: "",
  });

  useEffect(() => {
    if (post && open) {
      setForm({
        title: post.title || "",
        caption: post.caption || "",
        notes: post.notes || "",
        reference_link: post.reference_link || "",
        publish_date: post.publish_date ? post.publish_date.slice(0, 10) : "",
        tags: post.tags ? post.tags.join(", ") : "",
      });
      setIsEditing(false);
    }
  }, [post, open]);

  if (!post) return null;

  const status = statusLabels[post.status] || {
    label: post.status,
    color: "bg-muted text-muted-foreground",
    bg: "bg-muted/30",
  };

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

  const handleSaveEdits = async () => {
    if (!post) return;
    setUpdating(true);
    const { error } = await supabase
      .from("posts")
      .update({
        title: form.title || post.title,
        caption: form.caption || null,
        notes: form.notes || null,
        reference_link: form.reference_link || null,
        publish_date: form.publish_date || null,
        tags:
          form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean) || null,
      })
      .eq("id", post.id);
    setUpdating(false);
    if (error) {
      toast({ title: "Failed to update post", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Post updated" });
      setIsEditing(false);
      onUpdated?.();
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Post deleted" });
      onOpenChange(false);
      onUpdated?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-w-[95vw] p-0 overflow-hidden">
        <div className={cn("px-6 pt-6 pb-4 border-b", status.bg)}>
          <DialogHeader>
            <div className="flex items-start justify-between gap-4 pr-8">
              {isEditing ? (
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="text-base font-semibold"
                />
              ) : (
                <DialogTitle className="text-xl leading-snug">{post.title}</DialogTitle>
              )}
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveEdits}
                      disabled={updating}
                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      {updating ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={updating}
                      className="rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/60"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                )}
              </div>
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

        <div className="space-y-4 px-6 pb-6 pt-4 max-h-[70vh] overflow-y-auto">
          {/* Caption */}
          {(post.caption || isEditing) && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Caption</p>
              {isEditing ? (
                <Textarea
                  rows={3}
                  value={form.caption}
                  onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm leading-relaxed">{post.caption}</p>
              )}
            </div>
          )}

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-3">
            {(post.publish_date || isEditing) && (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {isEditing ? (
                  <Input
                    type="date"
                    value={form.publish_date}
                    onChange={(e) => setForm((f) => ({ ...f, publish_date: e.target.value }))}
                    className="h-7 border-0 bg-transparent p-0 text-xs font-medium"
                  />
                ) : (
                  <span className="text-xs font-medium">
                    {post.publish_date ? format(new Date(post.publish_date), "MMM d, yyyy") : ""}
                  </span>
                )}
              </div>
            )}
            {(post.tags && post.tags.length > 0) || isEditing ? (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                {isEditing ? (
                  <Input
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="tag1, tag2"
                    className="h-7 border-0 bg-transparent p-0 text-xs font-medium"
                  />
                ) : (
                  <span className="truncate text-xs font-medium">{post.tags?.join(", ")}</span>
                )}
              </div>
            ) : null}
          </div>

          {/* Reference link */}
          {(post.reference_link || isEditing) && (
            <a
              href={post.reference_link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {isEditing ? (
                <Input
                  value={form.reference_link}
                  onClick={(e) => e.preventDefault()}
                  onChange={(e) => setForm((f) => ({ ...f, reference_link: e.target.value }))}
                  placeholder="https://…"
                  className="border-0 bg-transparent p-0 text-xs font-medium text-primary"
                />
              ) : (
                <span className="truncate">{post.reference_link}</span>
              )}
            </a>
          )}

          {/* Notes */}
          {(post.notes || isEditing) && (
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <FileText className="h-3 w-3" /> Notes
              </p>
              {isEditing ? (
                <Textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm leading-relaxed text-muted-foreground">{post.notes}</p>
              )}
            </div>
          )}
          {/* Delete */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5" />
                Delete Post
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone. The post and its data will be permanently removed.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}

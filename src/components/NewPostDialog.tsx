import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Sparkles } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type PlatformType = Database["public"]["Enums"]["platform_type"];
type PostStatus = Database["public"]["Enums"]["post_status"];

interface NewPostDialogProps {
  defaultDate?: string;
  onCreated?: () => void;
}

export default function NewPostDialog({ defaultDate, onCreated }: NewPostDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const caption = fd.get("caption") as string;
    const platform = fd.get("platform") as PlatformType;
    const status = fd.get("status") as PostStatus;
    const publishDate = fd.get("publish_date") as string;
    const notes = fd.get("notes") as string;
    const tags = (fd.get("tags") as string)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const { error } = await supabase.from("posts").insert({
      title,
      caption: caption || null,
      platform,
      status,
      publish_date: publishDate || null,
      notes: notes || null,
      tags: tags.length > 0 ? tags : null,
      created_by: user.id,
    });

    if (error) {
      toast({ title: "Error creating post", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Post created! 🎉" });
      setOpen(false);
      onCreated?.();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 pop-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg pop-border pop-shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-pop-orange" />
            Create New Post
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" required placeholder="What's the big idea?" className="pop-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Platform *</Label>
              <Select name="platform" defaultValue="instagram">
                <SelectTrigger className="pop-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">📸 Instagram</SelectItem>
                  <SelectItem value="youtube">🎬 YouTube</SelectItem>
                  <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                  <SelectItem value="twitter">🐦 Twitter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select name="status" defaultValue="idea">
                <SelectTrigger className="pop-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">💡 Idea</SelectItem>
                  <SelectItem value="in_editing">✏️ In Editing</SelectItem>
                  <SelectItem value="under_review">👀 Under Review</SelectItem>
                  <SelectItem value="ready_to_post">✅ Ready to Post</SelectItem>
                  <SelectItem value="posted">📤 Posted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea id="caption" name="caption" placeholder="Write something catchy ✨" rows={3} className="pop-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="publish_date">Publish Date</Label>
              <Input id="publish_date" name="publish_date" type="date" defaultValue={defaultDate} className="pop-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" name="tags" placeholder="reel, promo, launch" className="pop-border" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Any extra context for the team…" rows={2} className="pop-border" />
          </div>

          <Button type="submit" className="w-full pop-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all" disabled={loading}>
            {loading ? "Creating…" : "Create Post 🚀"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { Plus, ImagePlus, Link2, X } from "lucide-react";
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

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
    const referenceLink = fd.get("reference_link") as string;
    const tags = (fd.get("tags") as string)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Create post
    const { data: post, error } = await supabase.from("posts").insert({
      title,
      caption: caption || null,
      platform,
      status,
      publish_date: publishDate || null,
      notes: notes || null,
      reference_link: referenceLink || null,
      tags: tags.length > 0 ? tags : null,
      created_by: user.id,
    }).select().single();

    if (error) {
      toast({ title: "Error creating post", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Upload image if present
    if (imageFile && post) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${post.id}/thumbnail.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("post-assets")
        .upload(path, imageFile, { upsert: true });

      if (uploadError) {
        toast({ title: "Post created but image upload failed", description: uploadError.message, variant: "destructive" });
      } else {
        await supabase.from("post_files").insert({
          post_id: post.id,
          file_path: path,
          file_type: imageFile.type,
          uploaded_by: user.id,
        });
      }
    }

    toast({ title: "Post created!" });
    setOpen(false);
    setImageFile(null);
    setImagePreview(null);
    onCreated?.();
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" required placeholder="Post title" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Platform *</Label>
              <Select name="platform" defaultValue="instagram">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select name="status" defaultValue="idea">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">Idea</SelectItem>
                  <SelectItem value="in_editing">In Editing</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="ready_to_post">Ready to Post</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea id="caption" name="caption" placeholder="Write your caption…" rows={3} />
          </div>

          {/* Image upload */}
          <div className="space-y-2">
            <Label>Thumbnail / Image</Label>
            {imagePreview ? (
              <div className="relative w-full">
                <img src={imagePreview} alt="Preview" className="h-32 w-full rounded-lg border object-cover" />
                <Button type="button" variant="destructive" size="icon" className="absolute right-2 top-2 h-7 w-7" onClick={removeImage}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5">
                <ImagePlus className="h-5 w-5" />
                Click to upload image
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="publish_date">Publish Date</Label>
              <Input id="publish_date" name="publish_date" type="date" defaultValue={defaultDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" name="tags" placeholder="reel, promo" />
            </div>
          </div>

          {/* Reference link */}
          <div className="space-y-2">
            <Label htmlFor="reference_link" className="flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5" />
              Reference Link
            </Label>
            <Input id="reference_link" name="reference_link" type="url" placeholder="https://…" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Notes for the team…" rows={2} />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Create Post"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

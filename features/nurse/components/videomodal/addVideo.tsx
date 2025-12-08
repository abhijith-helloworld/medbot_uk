"use client";
import { useState, useRef } from "react";
import { useVideo } from "../../hooks/useVideo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";


export function AddVideoModal() {
  const { createVideo, isCreatingVideo } = useVideo();
  const [open, setOpen] = useState(false);

  const [videoName, setVideoName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!fileInputRef.current?.files?.[0]) return;

  const formData = new FormData();
  formData.append("video_name", videoName);
  formData.append("video_image_file", fileInputRef.current.files[0]); // ✅ updated key
  formData.append("is_active", String(isActive));

  const toastId = toast.loading("Uploading...");

  try {
    await createVideo(formData);
    toast.success("Uploaded successfully!", { id: toastId });

    setOpen(false);
    setVideoName("");
    setIsActive(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  } catch (err) {
    console.error("Failed to create video:", err);
    toast.error("Failed to upload. Try again.", { id: toastId });
  }
};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#9d4ec3] hover:bg-[#8a42b8]">+ Add Video</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Video</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="video_name">Video/Image Name</Label>
    <Input
      id="video_name"
      value={videoName}
      onChange={(e) => setVideoName(e.target.value)}
      required
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="video_image_file">Video or Image File</Label>
    <Input
      id="video_image_file"
      type="file"
      accept="video/*,image/*"
      ref={fileInputRef}
      required
    />
  </div>

  <div className="flex items-center space-x-2">
    <Checkbox
      id="is_active"
      checked={isActive}
      onCheckedChange={(checked) => setIsActive(!!checked)}
    />
    <Label htmlFor="is_active">Active</Label>
  </div>

  <DialogFooter>
    <Button type="submit" disabled={isCreatingVideo}>
      {isCreatingVideo ? "Uploading..." : "Save"}
    </Button>
  </DialogFooter>
</form>

      </DialogContent>
    </Dialog>
  );
}

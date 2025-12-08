"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useRef, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useVideo } from "../hooks/useVideo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video } from "../api/video";
import { AddVideoModal } from "./videomodal/addVideo";
import LazyVideo from "./videomodal/lazyVideo";
import { Loader2 } from "lucide-react";


// Reusable Sortable Item
function SortableVideoCard({ video, onToggle }: { video: Video; onToggle: (pk: number) => void; }) {
  // Pass the handleRef to useSortable
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: video.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const fileUrl = video.video_url || video.video_image_file;
  const isVideo = fileUrl?.endsWith(".mp4") || fileUrl?.endsWith(".webm") || fileUrl?.endsWith(".mov");

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="group hover:shadow-lg transition relative">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="group-hover:text-[#9d4ec3] transition">
              {video.video_name}
            </CardTitle>
            {/* The drag handle */}
            <span {...listeners} {...attributes} className="cursor-grab p-2 rounded-full hover:bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grip-vertical">
                <circle cx="9" cy="20" r="1" />
                <circle cx="9" cy="14" r="1" />
                <circle cx="9" cy="8" r="1" />
                <circle cx="9" cy="2" r="1" />
                <circle cx="15" cy="20" r="1" />
                <circle cx="15" cy="14" r="1" />
                <circle cx="15" cy="8" r="1" />
                <circle cx="15" cy="2" r="1" />
              </svg>
            </span>
          </div>
          <CardDescription>
            Uploaded on {new Date(video.created_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fileUrl ? (
            <LazyVideo fileUrl={fileUrl} isVideo={isVideo} title={video.video_name} />
          ) : (
            <span>No File</span>
          )}
          <Button
            variant={video.is_active ? "destructive" : "default"}
            size="sm"
            className="mt-4"
            onClick={() => onToggle(video.id)}
          >
            {video.is_active ? "Deactivate" : "Activate"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
export function VideoViewer() {
  const { videos, isLoadingVideos, swapVideos, createVideo, deleteVideo } =
    useVideo();
  const [items, setItems] = useState<number[]>(videos?.map((v) => v.id) ?? []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (videos) {
      setItems(videos.map((v) => v.id));
    }
  }, [videos]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      try {
        await swapVideos({ pk1: active.id, pk2: over.id });
      } catch (err) {
        console.error("Swap failed:", err);
      }
    }
  };
  const handleToggle = async (pk: number) => {
    try {
      await deleteVideo(pk); 
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  if (isLoadingVideos) return <div className="flex items-center justify-center h-screen ">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading training sections...
        </div>
      </div>

  function VideoCardSkeleton() {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="bg-gray-200 rounded-lg aspect-video"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 px-4 md:px-6 lg:px-10 py-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Training Videos</h1>
        <AddVideoModal />
      </div>

      {isLoadingVideos && (
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoadingVideos && !videos?.length && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold">No Videos Found</h2>
          <p className="text-gray-500 mt-2">Upload a video to get started.</p>
        </div>
      )}

      {!isLoadingVideos && videos && videos.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <SortableVideoCard
                  key={video.id}
                  video={video}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

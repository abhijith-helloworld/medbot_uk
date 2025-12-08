"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Loader2, Plus, Edit } from "lucide-react";
import { useApparatus } from "../features/nurse/hooks/useApparatus";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Apparatus() {
  const {
    apparatus,
    isLoadingApparatus,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    toggleApparatus,
    editApparatus,
  } = useApparatus();

  const [selected, setSelected] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Intersection Observer refs
  const observerTarget = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer callback
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  // Set up intersection observer
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    // Disconnect existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    });

    observerRef.current.observe(target);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection]);

  if (isLoadingApparatus) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading apparatus...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 px-4 md:px-6 lg:px-10 py-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Apparatus Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Manage and view all medical apparatus. Click on a card to edit details or the image to enlarge.
          </p>
        </div>
      </div>

      <div className="grid w-full gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {apparatus?.map((item: any) => (
          <Card
            key={item.id}
            className="relative overflow-hidden rounded-xl"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold">#{item.id}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`text-xs px-3 py-1 font-semibold ${
                      item.is_active
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                  >
                    {item.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelected({ ...item })}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex gap-4 items-center">
              <div
                className="w-32 h-32 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border border-gray-200 transition-transform hover:scale-105"
                onClick={() => {
                  if (item.image_url) {
                    setSelectedImage(item.image_url);
                  }
                }}
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt="Apparatus"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="bg-gray-100 w-full h-full flex items-center justify-center text-xs text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              <div className="flex-grow space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-sm text-muted-foreground truncate">
                        Patient:{" "}
                        <span className="font-semibold text-gray-800">
                          {item.patient_name}
                        </span>
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.patient_name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-700">Sys:</span>
                    <span className="text-gray-600">{item.sys}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-700">Dia:</span>
                    <span className="text-gray-600">{item.dia ?? "-"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-700">MAP:</span>
                    <span className="text-gray-600">{item.map}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-700">Pulse:</span>
                    <span className="text-gray-600">{item.pulse_rate_note}</span>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-4 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Last updated: {new Date(item.updated_at).toLocaleDateString()}
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Intersection Observer Target & Loading Indicator */}
      {hasNextPage && (
        <div 
          ref={observerTarget}
          className="flex justify-center items-center py-8"
        >
          {isFetchingNextPage ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading more apparatus...
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              Scroll down to load more apparatus
            </div>
          )}
        </div>
      )}
      
      {/* End of list indicator */}
      {!hasNextPage && apparatus.length > 0 && (
        <div className="flex justify-center py-8">
          <div className="text-muted-foreground text-sm">
            You've reached the end of the apparatus list
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-lg p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-semibold">
              Edit Apparatus #{selected?.id}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="grid gap-4">
                {["sys", "dia", "map", "pulse_rate_note"].map((field) => (
                  <div key={field}>
                    <label className="text-sm font-medium capitalize block mb-1">
                      {field.replace("_", " ")}
                    </label>
                    <Input
                      value={selected[field] ?? ""}
                      onChange={(e) =>
                        setSelected({ ...selected, [field]: e.target.value })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!selected) return;
                await editApparatus({
                  id: selected.id,
                  updates: {
                    patient: selected.patient,
                    sys: selected.sys,
                    dia: selected.dia,
                    map: selected.map,
                    pulse_rate_note: selected.pulse_rate_note,
                  },
                });
                setSelected(null);
              }}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Enlargement Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="sm:max-w-3xl p-4">
          <DialogHeader>
            <DialogTitle>Apparatus Image</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Enlarged Apparatus"
                className="w-full h-auto object-contain max-h-[80vh] rounded-md"
              />
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => setSelectedImage(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
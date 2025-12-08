// src/hooks/useVideo.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllVideos, createVideo, swapVideos, softDelete } from "../api/video";

export function useVideo() {
  const queryClient = useQueryClient();

  const videosQuery = useQuery({
    queryKey: ["videos"],
    queryFn: getAllVideos,
    select: (data) => data.data,
  });

  const createMutation = useMutation({
    mutationFn: (payload: FormData) => createVideo(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["videos"] }),
  });

  const swapMutation = useMutation({
    mutationFn: ({ pk1, pk2 }: { pk1: number; pk2: number }) =>
      swapVideos(pk1, pk2),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["videos"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (pk: number) => softDelete(pk),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["videos"] }),
  });

  return {
    videos: videosQuery.data,
    isLoadingVideos: videosQuery.isPending,
    errorVideos: videosQuery.error,
    refetchVideos: videosQuery.refetch,

    createVideo: createMutation.mutateAsync,
    isCreatingVideo: createMutation.isPending,

    swapVideos: swapMutation.mutateAsync,
    isSwapping: swapMutation.isPending,

    deleteVideo: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
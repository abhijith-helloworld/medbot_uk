import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { fetchApparatus, toggleApparatusStatus, editApparatusValues, Apparatus, ApparatusResponse } from "../api/apparatus";
import { toast } from "sonner";

export function useApparatus(pageSize = 8) {
  const queryClient = useQueryClient();

  // Infinite query for paginated apparatus data
  const apparatusQuery = useInfiniteQuery<ApparatusResponse>({
    queryKey: ["apparatus", pageSize],
    queryFn: ({ pageParam = 1 }) => fetchApparatus(pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      try {
        return Number(new URL(lastPage.next).searchParams.get("page"));
      } catch {
        return undefined;
      }
    },
  });

  // Toggle mutation
  const toggleMutation = useMutation({
    mutationFn: toggleApparatusStatus,
    onSuccess: (data) => {
      toast.success(data.message || "Apparatus status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["apparatus"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update apparatus status.");
    },
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Apparatus> }) =>
      editApparatusValues(id, updates),
    onSuccess: (data) => {
      toast.success(data.message || "Apparatus updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["apparatus"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update apparatus.");
    },
  });

  return {
    data: apparatusQuery.data,
    apparatus: apparatusQuery.data?.pages.flatMap((page) => page.results.data).filter(Boolean) ?? [],
    isLoadingApparatus: apparatusQuery.isLoading,
    hasNextPage: apparatusQuery.hasNextPage,
    fetchNextPage: apparatusQuery.fetchNextPage,
    isFetchingNextPage: apparatusQuery.isFetchingNextPage,
    error: apparatusQuery.error,
    toggleApparatus: toggleMutation.mutateAsync,
    editApparatus: editMutation.mutateAsync,
  };
}
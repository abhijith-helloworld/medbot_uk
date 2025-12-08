import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBeds, getAllBeds } from "../api/bed";

export function useBeds() {
  const queryClient = useQueryClient();

  const bedsQuery = useQuery({
    queryKey: ["beds"],
    queryFn: getAllBeds,
    select: (data) => data.data,
    refetchOnWindowFocus: true,   // auto refetch when tab gains focus
    refetchInterval: 10000,       // auto refetch every 10s
    staleTime: 1000,              // cache data as fresh for 5s
  });

  const createMutation = useMutation({
    mutationFn: createBeds,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beds"] }); // trigger refetch
      queryClient.invalidateQueries({ queryKey: ["slots"] }); // optional if slots depend on beds
    },
  });

  return {
    beds: bedsQuery.data,
    isLoadingBeds: bedsQuery.isLoading,
    isError: bedsQuery.isError,
    error: bedsQuery.error,
    createBeds: createMutation.mutateAsync,
    refetch: bedsQuery.refetch,
  };
}

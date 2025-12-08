// src/hooks/useMap.ts

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMaps, deleteMap, activateMap, MapsResponse } from "../api/map";
import { toast } from "sonner";

// The useMaps query hook remains the same
export function useMaps() {
  const query = useQuery<MapsResponse>({
    queryKey: ["maps"],
    queryFn: getMaps,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    maps: query.data?.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// NEW: Mutation hook for activating a map
export function useActivateMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateMap,
    onSuccess: (data) => {
      toast.success(data.message || `Map activated successfully.`);
      // Invalidate the maps query to refetch and show the new active map
      queryClient.invalidateQueries({ queryKey: ["maps"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to activate map.");
    },
  });
}

// NEW: Mutation hook for deleting a map
export function useDeleteMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMap,
    onSuccess: (data) => {
      toast.success(data.message || "Map deleted successfully.");
      // Invalidate the maps query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["maps"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete map.");
    },
  });
}
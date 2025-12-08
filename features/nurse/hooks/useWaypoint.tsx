import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllWaypoints, createWaypointEntry, createWaypointExit, createWaypointDto } from "../api/waypoint";

export function useWaypoints() {
  const queryClient = useQueryClient();

  const waypointsQuery = useQuery({
    queryKey: ["waypoints"],
    queryFn: getAllWaypoints,
    select: (data) => data.data,
  });

  const entryMutation = useMutation({
    mutationFn: (payload: createWaypointDto) => createWaypointEntry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waypoints"] });
    },
  });

  const exitMutation = useMutation({
    mutationFn: (payload: createWaypointDto) => createWaypointExit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waypoints"] });
    },
  });

  return {
    waypoints: waypointsQuery.data,
    isLoadingWaypoints: waypointsQuery.isLoading,
    error: waypointsQuery.error,
    createEntry: entryMutation.mutateAsync,
    createExit: exitMutation.mutateAsync,
    isCreatingEntry: entryMutation.isPending,
    isCreatingExit: exitMutation.isPending,
  };
}

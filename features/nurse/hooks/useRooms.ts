import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createRooms, getAllRooms } from "../api/room";

export function useRooms() {
  const queryClient = useQueryClient();

  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: getAllRooms,
    select: (data) => data.data, 
  });

  const createMutation = useMutation({
    mutationFn: createRooms,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  return {
    rooms: roomsQuery.data,
    isLoadingRooms: roomsQuery.isLoading,
    createRooms: createMutation.mutateAsync,
  };
}
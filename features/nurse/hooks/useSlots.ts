import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createSlot, getAllSlots, toggleSlotStatus, triggerSlotPosition } from "../api/slot";


export function useSlots() {
  const queryClient = useQueryClient();

  const slotsQuery = useQuery({
  queryKey: ["slots"],
  queryFn: getAllSlots,
  select: (data) => data.data, 
});

  const createMutation = useMutation({
    mutationFn: (vars: { room_name_id: number; bed_name_id: number }) => createSlot(vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });

const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => toggleSlotStatus(id),
    onSuccess: () => {
      // Refetch slots data to get the updated active status
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });


const markPositionMutation = useMutation({
  mutationFn: (slotId: number) => triggerSlotPosition(slotId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["slots"] });
  },
});

return {
  slots: slotsQuery.data,
  isLoadingSlots: slotsQuery.isLoading,
  createSlot: createMutation.mutateAsync,
  deleteSlot: toggleStatusMutation.mutateAsync,
  markPosition: markPositionMutation.mutateAsync,
  markingSlotId: markPositionMutation.variables, // which slot is being marked
  isMarking: markPositionMutation.isPending,
}}

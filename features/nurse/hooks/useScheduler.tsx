import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSchedulers,
  addOrUpdateScheduler,
  SchedulerPayload,
  uploadSchedulersExcel,
  downloadSchedulersExcel,
  swapPatientScheduler,
  fetchSchedulersActive,
  swapRoomOrder,
  SwapRoomOrderPayload, // <-- IMPORTED
} from "../api/scheduler";
import { toast } from "sonner";

export function useScheduler() {
  const queryClient = useQueryClient();

  const schedulerQuery = useQuery({
    queryKey: ["schedulers"],
    queryFn: fetchSchedulers,
  });

  // Mutation for creating, updating, or toggling scheduler status
  const mutation = useMutation({
    mutationFn: (payload: SchedulerPayload) => addOrUpdateScheduler(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedulers"] });
    },
  });

  return {
    schedulers: schedulerQuery.data,
    isLoadingSchedulers: schedulerQuery.isLoading,
    error: schedulerQuery.error,
    addOrUpdate: mutation.mutate,
    isMutating: mutation.isPending,
  };
}

export function useActiveSchedulers() {
  return useQuery({
    queryKey: ["schedulers", "active"],
    queryFn: fetchSchedulersActive,
  });
}

// in useScheduler.tsx
export function useUploadSchedulersExcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: Blob) => uploadSchedulersExcel(file),
    onSuccess: (data) => {
      toast.success(data.message || "Scheduler Excel uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["schedulers"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to upload Excel.");
    },
  });
}

export function useDownloadSchedulersExcel() {
  return useMutation({
    mutationFn: () => downloadSchedulersExcel(),
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to download Excel."
      );
    },
    onSuccess: (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "scheduler_data.xlsx";
      link.addEventListener("click", () => {
        toast.success("Download started!");
      });
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
  });
}

export function useSwapRoomOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    // This mutation function now expects the SwapRoomOrderPayload
    mutationFn: (payload: SwapRoomOrderPayload) => swapRoomOrder(payload),
    onSuccess: (data) => {
      toast.success(data?.message || "Rooms swapped successfully");
      // You should invalidate the 'slots' query to refetch the order
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to swap rooms");
    },
  });
}
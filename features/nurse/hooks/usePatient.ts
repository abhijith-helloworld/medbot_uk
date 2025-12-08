//features/nurse/hooks/usePatient.ts
"use client";

import { useQuery, useMutation, useQueryClient,useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchPatients,
  createPatient,
  deletePatient,
  CreatePatientDto,
  PatientsResponse,
  Patient,
  assignSlotToPatient,
  assignPatientToBatch,
  fetchSlots, 
  Slot, 
  SlotGroup,
  checkPatientScheduled,
  CheckBatchResponse,
  uploadPatientsExcel, 
  downloadPatientsExcel,
  fetchActivePatients,
  deleteSlot,
} from "../api/patient";

import {swapPatientScheduler} from "../api/scheduler";

// Interface for the API response on mutations
interface MutationResponse {
  status: "success" | "error";
  message: string;
  data: Patient | null;
}

// 🔹 GET patients
export function usePatients(pageSize = 8) {
  return useInfiniteQuery<PatientsResponse>({
    queryKey: ["patients", pageSize],
    queryFn: ({ pageParam = 1 }) => fetchPatients(pageParam, pageSize),
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
}

export function useActivePatients() {
  return useQuery<PatientsResponse>({
    queryKey: ["active-patients"],
    queryFn: () => fetchActivePatients(),
  });
}

// 🔹 POST patient (create/update)
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation<MutationResponse, Error, CreatePatientDto>({
    mutationFn: (payload: CreatePatientDto) => createPatient(payload),
    onSuccess: (data) => {
      // Show success toast with the message from the API
      toast.success(data.message || "Patient saved successfully!");
      // Invalidate cache so UI refreshes
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: (error) => {
      // Show a generic error toast
      toast.error(error.message || "An unexpected error occurred.");
    },
  });
}

// src/features/patient/hooks/usePatient.ts
export function useAssignSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      slotId,
    }: {
      patientId: number;
      slotId: number;
    }) => assignSlotToPatient(patientId, slotId),
    onSuccess: (data) => {
      toast.success(data.message || "Slot assigned successfully!");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to assign slot.");
    },
  });
}

// 🔹 DELETE patient (toggles active status)
export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation<MutationResponse, Error, number>({
    mutationFn: (id: number) => deletePatient(id),
    onSuccess: (data) => {
      // Show success toast from the API response
      toast.success(data.message || "Patient status updated.");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update patient status.");
    },
  });
}

export function useAssignPatientBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      batchId,
    }: {
      patientId: number;
      batchId: number;
    }) => assignPatientToBatch(patientId, batchId),
    onSuccess: (data) => {
      toast.success(data.message || "Patient assigned to batch successfully!");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["schedulers"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to assign patient to batch."
      );
    },
  });
}

export function useCheckPatientBatch() {
  const queryClient = useQueryClient();
  return useMutation<
    CheckBatchResponse,
    any,
    { patientId: number; batchId: number }
  >({
    mutationFn: ({ patientId, batchId }) =>
      checkPatientScheduled(patientId, batchId),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to check schedule.");
    },
  });
}

export function useSlots() {
  return useQuery<SlotGroup[]>({
    queryKey: ["slots"],
    queryFn: fetchSlots, 
  });
}

// Upload Excel hook
export function useUploadPatientsExcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: Blob) => uploadPatientsExcel(file),
    onSuccess: (data) => {
      toast.success(data.message || "Excel uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to upload Excel.");
    },
  });
}

// Download Excel hook
export function useDownloadPatientsExcel() {
  return useMutation({
    mutationFn: () => downloadPatientsExcel(),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to download Excel.");
    },
    onSuccess: (blob: Blob) => {
      // Create a link and trigger browser download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "patients_data.xlsx";

      // Listen for click event and then show toast
      link.addEventListener("click", () => {
        toast.success("Download started!"); // now toast matches UX
      });

      document.body.appendChild(link);
      link.click(); // open the save dialog
      link.remove();
      URL.revokeObjectURL(url);
    },
  });
}

export function useSwapPatientScheduler() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pk1, pk2 }: { pk1: number; pk2: number }) =>
      swapPatientScheduler({ pk1, pk2 }),
    onSuccess: (data) => {
      toast.success(data.message || "Patients swapped successfully!");
      queryClient.invalidateQueries({ queryKey: ["slots"] }); // refresh slots so UI reflects new order
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to swap patients.");
    },
  });
}

export function useDeleteSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slotId: number) => deleteSlot(slotId),
    onSuccess: (data) => {
      toast.success(data.message || "Patient removed from batch successfully!");
      // Invalidate the slots query to refetch and update the UI
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to remove patient.");
    },
  });
}
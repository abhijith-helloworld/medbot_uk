import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"
import {
  fetchNurses,
  createNurse,
  updateNurse, 
  toggleNurseStatus,
  Nurse,
  CreateNursePayload,
  UpdateNursePayload, 
} from "../api/nurse";

// Define a generic type for your API response to make the code safer and clearer
type ApiResponse<T> = {
  status: "success" | "error";
  message: string;
  data?: T;
  error?: {
    details?: Record<string, string>; 
  };
};


export function useNurses() {
  return useQuery<Nurse[]>({
    queryKey: ["nurses"],
    queryFn: fetchNurses,
  });
}

export function useCreateNurse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNursePayload): Promise<ApiResponse<Nurse>> =>
      createNurse(payload),

    onSuccess: (response) => {
      // This runs only for 2xx responses
      toast.success(response.message || "Nurse created successfully!");
      queryClient.invalidateQueries({ queryKey: ["nurses"] });
    },

    onError: (error: any) => {
      // 🔹 Axios always throws on 400/500, so we need to dig inside
      if (error.response?.data) {
        const errData = error.response.data;

        // case 1: field-level validation errors
        if (errData.error?.details) {
          Object.entries(errData.error.details).forEach(([field, msg]) => {
            toast.error(`${field}: ${msg}`);
          });
        } else {
          // case 2: general backend error
          toast.error(errData.message || "Something went wrong.");
        }
      } else {
        // case 3: no response at all (network/server crash)
        toast.error(error.message || "Network error. Please try again.");
      }
    },
  });
}

// Hook for updating a nurse's details
export function useUpdateNurse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateNursePayload): Promise<ApiResponse<Nurse>> =>
      updateNurse(payload),
    onSuccess: (response) => {
      toast.success(response.message || "User updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["nurses"] });
    },
    onError: (error) => {
      toast.error("Failed to update nurse. Please try again.");
      console.error("Update Error:", error);
    },
  });
}

export function useToggleNurseStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number): Promise<ApiResponse<null>> =>
      toggleNurseStatus(id),

    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["nurses"] });

      // Snapshot current nurses
      const prevNurses = queryClient.getQueryData<Nurse[]>(["nurses"]);

      // Optimistically update
      queryClient.setQueryData<Nurse[]>(["nurses"], (old) =>
        old
          ? old.map((nurse) =>
              nurse.id === id ? { ...nurse, is_active: !nurse.is_active } : nurse
            )
          : []
      );

      return { prevNurses };
    },

    onSuccess: (response) => {
      //  show backend success message
      toast.success(response.message || "Status updated successfully!");
    },

    onError: (error: any, _id, context) => {
      // Rollback if error
      if (context?.prevNurses) {
        queryClient.setQueryData(["nurses"], context.prevNurses);
      }

      // ✅ unwrap backend error if available
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update nurse status. Please try again.");
      }
    },

    onSettled: () => {
      // Always refetch to stay in sync with server
      queryClient.invalidateQueries({ queryKey: ["nurses"] });
    },
  });
}

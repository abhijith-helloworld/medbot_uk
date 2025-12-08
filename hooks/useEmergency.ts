"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toggleEmergencyAPI, fetchEmergencyStatus } from "@/lib/api/emergency";
import { toast } from "@/hooks/use-toast";

const LOCAL_KEY = "robot_emergency";

export function useEmergency() {
  const queryClient = useQueryClient();

  const {
    data: emergencyStatus = false,
    isLoading: isFetching,
  } = useQuery({
    queryKey: ["emergency"],
    queryFn: async () => {
      const res = await fetchEmergencyStatus(); // should return true/false
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(res));
      }
      return res;
    },
    refetchInterval: 5000, // auto-poll every 5s
  });

  const mutation = useMutation({
    mutationFn: async () => toggleEmergencyAPI(emergencyStatus),
    onSuccess: (newState) => {
      // Save new state in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(newState));
      }

      // Update query cache so UI updates instantly
      queryClient.setQueryData(["emergency"], newState);

      toast({ title: `Emergency ${newState ? "activated" : "cleared"}` });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Failed to update emergency",
        description: String(error),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency"] });
    },
  });

  return {
    active: emergencyStatus,
    toggleEmergency: mutation.mutate,
    isLoading: mutation.isPending || isFetching,
  };
}

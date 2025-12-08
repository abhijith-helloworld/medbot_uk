"use client";

import { useState, useMemo, useRef } from "react";
import { useScheduler } from "../hooks/useScheduler";
import { useAssignPatientBatch, useCheckPatientBatch, useActivePatients } from "../hooks/usePatient";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface AssignPatientModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}
export default function AssignPatientModal({ isOpen, onOpenChange }: AssignPatientModalProps) {
  const { data: activePatientsData, isLoading: isPatientsLoading } = useActivePatients();
  const { schedulers } = useScheduler();
  const assignMutation = useAssignPatientBatch();
  const checkMutation = useCheckPatientBatch();

  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [checkWarning, setCheckWarning] = useState<null | { message: string; data?: any }>(null);

  const allActivePatients = useMemo(() => {
    return activePatientsData?.data?.filter(p => p.is_active) || [];
  }, [activePatientsData]);

  const resetAll = () => {
    setSelectedPatient(null);
    setSelectedBatch(null);
    setCheckWarning(null);
  };

  const handleClose = () => {
    resetAll();
    onOpenChange(false);
  };

  const handleAssign = async () => {
    if (!selectedPatient || !selectedBatch) {
      return toast.error("Please select both patient and batch");
    }

    try {
      const checkResp = await checkMutation.mutateAsync({
        patientId: selectedPatient,
        batchId: selectedBatch,
      });

      if (checkResp?.status === "warning") {
        setCheckWarning({ message: checkResp.message, data: checkResp.data });
        return;
      }

      await assignMutation.mutateAsync({
        patientId: selectedPatient,
        batchId: selectedBatch,
      });

      resetAll();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
    }
  };

  const confirmAndAssign = async () => {
    if (!selectedPatient || !selectedBatch) return;

    try {
      await assignMutation.mutateAsync({
        patientId: selectedPatient,
        batchId: selectedBatch,
      });

      resetAll();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to assign patient.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Patient to Batch</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Batch Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Batch</label>
            <Select onValueChange={val => setSelectedBatch(Number(val))} value={selectedBatch?.toString() || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select Batch" />
              </SelectTrigger>
              <SelectContent>
                {schedulers?.filter(b => !b.is_stopped).map(batch => (
                  <SelectItem key={batch.id} value={String(batch.id)}>
                    {batch.batch_name} ({batch.time_slot})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Patient Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Patient</label>
            <Select
              onValueChange={val => setSelectedPatient(Number(val))}
              value={selectedPatient?.toString() || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder={isPatientsLoading ? "Loading patients..." : "Select Patient"} />
              </SelectTrigger>
              <SelectContent>
                {allActivePatients.length > 0 ? (
                  allActivePatients.map(patient => (
                    <SelectItem key={patient.id} value={String(patient.id)}>
                      {patient.name} ({patient.patient_id})
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-sm text-gray-500">No active patients found</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Backend warning */}
          {checkWarning && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm">{checkWarning.message}</p>
              <div className="flex gap-2 justify-end mt-3">
                <Button variant="outline" onClick={() => setCheckWarning(null)} disabled={assignMutation.isLoading || checkMutation.isLoading}>
                  No
                </Button>
                <Button onClick={confirmAndAssign} disabled={assignMutation.isLoading || checkMutation.isLoading}>
                  {assignMutation.isLoading ? "Assigning..." : "Yes, switch"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={assignMutation.isLoading || checkMutation.isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedPatient || !selectedBatch || assignMutation.isLoading || checkMutation.isLoading}
            className="bg-[#9d4ec3] hover:bg-[#8a42b8]"
          >
            {(checkMutation.isLoading || assignMutation.isLoading) && !checkWarning ? "Processing..." : "Assign Patient"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

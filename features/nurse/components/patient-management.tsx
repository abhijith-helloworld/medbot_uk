"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  usePatients,
  useCreatePatient,
  useDeletePatient,
  useAssignSlot,
} from "../hooks/usePatient";
import { Patient } from "../api/patient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Calendar, Power, PowerOff, Bed, Loader2 } from "lucide-react";
import { useSlots } from "../../nurse/hooks/useSlots";
import ExcelDropdownUploader from "../hooks/useExcelDropdownUploader";
import { useUploadPatientsExcel, useDownloadPatientsExcel } from "../hooks/usePatient";

// Helper to format the date
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Helper to generate the next patient ID
const generateNextPatientId = (patients: Patient[] | undefined): string => {
  if (!patients || patients.length === 0) {
    return "PAT-001";
  }
  const maxId = patients.reduce((max, p) => {
    const numericPart = parseInt(p.patient_id.replace(/[^0-9]/g, ""), 10);
    return !isNaN(numericPart) && numericPart > max ? numericPart : max;
  }, 0);

  return `PAT-${String(maxId + 1).padStart(3, "0")}`;
};

const initialFormState = {
  name: "",
  age: "",
  gender: "male",
  patient_id: "",
};

export function PatientManagement() {
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = usePatients();

  // Correctly points to nested data and filters out bad records
  const allPatients = useMemo(
    () =>
      data?.pages
        .flatMap((page) => page.results.data)
        .filter(Boolean) ?? [],
    [data]
  );

  const createOrUpdatePatient = useCreatePatient();
  const togglePatientStatus = useDeletePatient();
  const assignSlot = useAssignSlot();
  const { slots } = useSlots();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [formData, setFormData] = useState(initialFormState);

  // Intersection Observer refs
  const observerTarget = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const isEditMode = editingPatient !== null;

  // Intersection Observer callback
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  // Set up intersection observer
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    // Disconnect existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null, // viewport
      rootMargin: "100px", // trigger 100px before the element is visible
      threshold: 0.1, // trigger when 10% of the element is visible
    });

    observerRef.current.observe(target);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection]);

  useEffect(() => {
    if (isDialogOpen && editingPatient) {
      setFormData({
        name: editingPatient.name,
        age: String(editingPatient.age),
        gender: editingPatient.gender,
        patient_id: editingPatient.patient_id,
      });
    }
  }, [editingPatient, isDialogOpen]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.age) {
      toast.warning("Please fill in all required fields.");
      return;
    }
    const payload = {
      ...formData,
      age: Number(formData.age),
      gender: formData.gender as "male" | "female" | "transgender",
      ...(isEditMode && { id: editingPatient.id }),
    };
    createOrUpdatePatient.mutate(payload, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setEditingPatient(null);
      },
    });
  };

  const handleAddNewClick = () => {
    const nextId = generateNextPatientId(allPatients);
    setEditingPatient(null);
    setFormData({
      ...initialFormState,
      patient_id: nextId,
    });
    setIsDialogOpen(true);
  };

  const handleEditClick = (patient: Patient) => {
    setEditingPatient(patient);
    setIsDialogOpen(true);
  };

  const handleAssignSlotClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setSelectedSlot(null);
    setIsSlotDialogOpen(true);
  };

  const handleAssignSlotConfirm = () => {
    if (!selectedPatient || !selectedSlot) {
      toast.warning("Please select a slot.");
      return;
    }
    assignSlot.mutate(
      { patientId: selectedPatient.id, slotId: selectedSlot },
      {
        onSuccess: () => setIsSlotDialogOpen(false),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading patients...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 px-4 md:px-6 lg:px-10 py-4">
      {/* Header with Add Patient Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
          <p className="text-muted-foreground">
            A centralized view of all patient records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleAddNewClick}
            className="bg-[#9d4ec3] hover:bg-[#8a42b8]"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Patient
          </Button>
          <ExcelDropdownUploader
            uploadHook={useUploadPatientsExcel}
            downloadHook={useDownloadPatientsExcel}
            buttonLabel="Manage Excel"
          />
        </div>
      </div>

      {/* Add/Edit Patient Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Patient" : "Add New Patient"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the patient's details below."
                : "Fill in the details below to add a new patient record."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient_id" className="text-right">
                Patient ID
              </Label>
              <Input
                id="patient_id"
                value={formData.patient_id}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Enter patient name"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age" className="text-right">
                Age *
              </Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={handleFormChange}
                placeholder="Enter age"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">
                Gender
              </Label>
              <Select
                value={formData.gender}
                onValueChange={handleGenderChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="transgender">Transgender</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSubmit}
              className="bg-[#9d4ec3] hover:bg-[#8a42b8]"
              disabled={createOrUpdatePatient.isPending}
            >
              {createOrUpdatePatient.isPending
                ? isEditMode
                  ? "Saving..."
                  : "Adding..."
                : isEditMode
                ? "Save Changes"
                : "Add Patient"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Slot Dialog */}
      <Dialog open={isSlotDialogOpen} onOpenChange={setIsSlotDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Slot</DialogTitle>
            <DialogDescription>
              Assign a bed/room slot to patient{" "}
              <span className="font-semibold">{selectedPatient?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <Select onValueChange={(value) => setSelectedSlot(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a slot" />
            </SelectTrigger>
            <SelectContent>
              {slots
                ?.filter((slot) => slot.is_active)
                ?.map((slot) => (
                  <SelectItem key={slot.id} value={String(slot.id)}>
                    {slot.room_name?.room_name ?? "N/A"} -{" "}
                    {slot.bed_name.bed_name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              onClick={handleAssignSlotConfirm}
              disabled={assignSlot.isPending}
            >
              {assignSlot.isPending ? "Assigning..." : "Assign Slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Patient List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {allPatients.map((patient) => (
          <Card key={patient.id} className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{patient?.name ?? "Unnamed Patient"}</CardTitle>
                  <CardDescription>{patient.age} years old</CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={
                    patient.is_active
                      ? "bg-green-100 text-green-800 border-green-300"
                      : "bg-gray-100 text-gray-800 border-gray-300"
                  }
                >
                  {patient.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="pt-2 text-xs text-muted-foreground">
                Patient ID: {patient.patient_id}
              </p>
              {patient.slot_assigned ? (
                <p className="pt-2 text-xs text-muted-foreground">
                  Bed: {patient.slot_assigned.bed_name}, Room:{" "}
                  {patient.slot_assigned.room_name}
                </p>
              ) : (
                <p className="pt-2 text-red-600 italic text-muted-foreground">
                  No slot assigned
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Admitted: {formatDate(patient.created_at)}</span>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t">
              <div className="flex w-full gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEditClick(patient)}
                >
                  <Edit className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAssignSlotClick(patient)}
                >
                  <Bed className="w-3 h-3 mr-1" /> Assign Slot
                </Button>
                <Button
                  variant={patient.is_active ? "destructive" : "default"}
                  size="sm"
                  className="flex-1"
                  disabled={
                    togglePatientStatus.isPending &&
                    togglePatientStatus.variables === patient.id
                  }
                  onClick={() => togglePatientStatus.mutate(patient.id)}
                >
                  {patient.is_active ? (
                    <PowerOff className="w-3 h-3 mr-1" />
                  ) : (
                    <Power className="w-3 h-3 mr-1" />
                  )}
                  {togglePatientStatus.isPending &&
                  togglePatientStatus.variables === patient.id
                    ? "Updating..."
                    : patient.is_active
                    ? "Deactivate"
                    : "Activate"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Intersection Observer Target & Loading Indicator */}
      {hasNextPage && (
        <div 
          ref={observerTarget}
          className="flex justify-center items-center py-8"
        >
          {isFetchingNextPage ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading more patients...
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              Scroll down to load more patients
            </div>
          )}
        </div>
      )}
      
      {/* End of list indicator */}
      {!hasNextPage && allPatients.length > 0 && (
        <div className="flex justify-center py-8">
          <div className="text-muted-foreground text-sm">
            You've reached the end of the patient list
          </div>
        </div>
      )}
    </div>
  );
}
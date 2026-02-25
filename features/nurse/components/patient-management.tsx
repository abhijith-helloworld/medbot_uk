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
import {
    Plus,
    Edit,
    Calendar,
    Power,
    PowerOff,
    Bed,
    Loader2,
} from "lucide-react";
import { useSlots } from "../../nurse/hooks/useSlots";
import ExcelDropdownUploader from "../hooks/useExcelDropdownUploader";
import {
    useUploadPatientsExcel,
    useDownloadPatientsExcel,
} from "../hooks/usePatient";

// Helper to format the date
const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const initialFormState = {
    name: "",
    age: "",
    gender: "male",
    patient_id: "",
};

export function PatientManagement() {
    // NEW: Add state for active filter
    const [activeFilter, setActiveFilter] = useState<"active" | "inactive">(
        "active",
    );

    const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
        usePatients();

    // Correctly points to nested data and filters out bad records
    const allPatients = useMemo(
        () =>
            data?.pages.flatMap((page) => page.results.data).filter(Boolean) ??
            [],
        [data],
    );

    // NEW: Filter patients based on activeFilter
    const filteredPatients = useMemo(() => {
        if (activeFilter === "all") return allPatients;
        if (activeFilter === "active")
            return allPatients.filter((p) => p.is_active === true);
        if (activeFilter === "inactive")
            return allPatients.filter((p) => p.is_active === false);
        return allPatients;
    }, [allPatients, activeFilter]);

    const createOrUpdatePatient = useCreatePatient();
    const togglePatientStatus = useDeletePatient();
    const assignSlot = useAssignSlot();
    const { slots } = useSlots();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
        null,
    );
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
        [hasNextPage, isFetchingNextPage, fetchNextPage],
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

        // Format Patient ID as PAT-XXX
        if (id === "patient_id") {
            // Remove any existing prefix and non-numeric characters
            const numericOnly = value.replace(/[^0-9]/g, "");

            // Format with PAT- prefix if there are numbers
            const formattedValue = numericOnly ? `PAT-${numericOnly}` : "";

            setFormData((prev) => ({ ...prev, [id]: formattedValue }));
        } else {
            setFormData((prev) => ({ ...prev, [id]: value }));
        }
    };

    const handleGenderChange = (value: string) => {
        setFormData((prev) => ({ ...prev, gender: value }));
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.age || !formData.patient_id) {
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
        setEditingPatient(null);
        setFormData(initialFormState);
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
            },
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
        <div className="w-full mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 md:py-6">
            {/* Header with Add Patient Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                {/* LEFT SIDE */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                        Patient Management
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                        A centralized view of all patient records.
                    </p>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:shrink-0">
                    <Button
                        onClick={handleAddNewClick}
                        className="bg-[#9d4ec3] hover:bg-[#8a42b8] text-sm sm:text-base whitespace-nowrap"
                        size="sm"
                    >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Add Patient
                    </Button>

                    <ExcelDropdownUploader
                        uploadHook={useUploadPatientsExcel}
                        downloadHook={useDownloadPatientsExcel}
                        buttonLabel="Manage Excel"
                    />
                </div>
            </div>

            {/* NEW: Filter Tabs */}
            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    data-active={activeFilter === "active"}
                    onClick={() => setActiveFilter("active")}
                    className="
            font-medium transition-all
            data-[active=true]:bg-purple-600
            data-[active=true]:text-white
            data-[active=true]:hover:bg-purple-700
            bg-purple-100 text-purple-700 hover:bg-purple-200
        "
                >
                    <Power className="w-4 h-4 mr-1" />
                    Active
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    data-active={activeFilter === "inactive"}
                    onClick={() => setActiveFilter("inactive")}
                    className="
            font-medium transition-all
            data-[active=true]:bg-red-600
            data-[active=true]:text-white
            data-[active=true]:hover:bg-red-700
            bg-red-100 text-red-700 hover:bg-red-200
        "
                >
                    <PowerOff className="w-4 h-4 mr-1" />
                    Inactive
                </Button>
            </div>

            {/* Add/Edit Patient Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-[425px] mx-auto">
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
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                            <Label
                                htmlFor="patient_id"
                                className="sm:text-right text-sm sm:text-base"
                            >
                                Patient ID *
                            </Label>
                            <Input
                                id="patient_id"
                                value={formData.patient_id}
                                onChange={handleFormChange}
                                placeholder="Enter numbers (e.g., 001)"
                                className="sm:col-span-3 text-sm sm:text-base"
                                disabled={isEditMode}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                            <Label
                                htmlFor="name"
                                className="sm:text-right text-sm sm:text-base"
                            >
                                Name *
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                placeholder="Enter patient name"
                                className="sm:col-span-3 text-sm sm:text-base"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                            <Label
                                htmlFor="age"
                                className="sm:text-right text-sm sm:text-base"
                            >
                                Age *
                            </Label>
                            <Input
                                id="age"
                                type="number"
                                value={formData.age}
                                onChange={handleFormChange}
                                placeholder="Enter age"
                                className="sm:col-span-3 text-sm sm:text-base"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                            <Label
                                htmlFor="gender"
                                className="sm:text-right text-sm sm:text-base"
                            >
                                Gender
                            </Label>
                            <Select
                                value={formData.gender}
                                onValueChange={handleGenderChange}
                            >
                                <SelectTrigger className="sm:col-span-3 text-sm sm:text-base">
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        value="male"
                                        className="text-sm sm:text-base"
                                    >
                                        Male
                                    </SelectItem>
                                    <SelectItem
                                        value="female"
                                        className="text-sm sm:text-base"
                                    >
                                        Female
                                    </SelectItem>
                                    <SelectItem
                                        value="transgender"
                                        className="text-sm sm:text-base"
                                    >
                                        Transgender
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4">
                        <Button
                            onClick={handleSubmit}
                            className="bg-[#9d4ec3] hover:bg-[#8a42b8] w-full sm:w-auto text-sm sm:text-base"
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
                <DialogContent className="max-w-[95vw] sm:max-w-[425px] mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl">
                            Assign Slot
                        </DialogTitle>
                        <DialogDescription className="text-sm sm:text-base">
                            Assign a bed/room slot to patient{" "}
                            <span className="font-semibold">
                                {selectedPatient?.name}
                            </span>
                            .
                        </DialogDescription>
                    </DialogHeader>
                    <Select
                        onValueChange={(value) =>
                            setSelectedSlot(Number(value))
                        }
                    >
                        <SelectTrigger className="text-sm sm:text-base">
                            <SelectValue placeholder="Select a slot" />
                        </SelectTrigger>
                        <SelectContent>
                            {slots
                                ?.filter((slot) => slot.is_active)
                                ?.map((slot) => (
                                    <SelectItem
                                        key={slot.id}
                                        value={String(slot.id)}
                                        className="text-sm sm:text-base"
                                    >
                                        {slot.room_name?.room_name ?? "N/A"} -{" "}
                                        {slot.bed_name.bed_name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4">
                        <Button
                            onClick={handleAssignSlotConfirm}
                            disabled={assignSlot.isPending}
                            className="w-full sm:w-auto text-sm sm:text-base"
                        >
                            {assignSlot.isPending
                                ? "Assigning..."
                                : "Assign Slot"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Patient List - NOW USES filteredPatients */}
            <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {filteredPatients.map((patient) => (
                    <Card
                        key={patient.id}
                        className="flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
                    >
                        <CardHeader className="p-4 sm:p-5 md:p-6">
                            <div className="flex items-start justify-between gap-2 sm:gap-3">
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-base sm:text-lg lg:text-xl truncate">
                                        {patient?.name ?? "Unnamed Patient"}
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        {patient.age} years old
                                    </CardDescription>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={`flex-shrink-0 text-xs px-2 py-1 ${
                                        patient.is_active
                                            ? "bg-green-100 text-green-800 border-green-300"
                                            : "bg-gray-100 text-gray-800 border-gray-300"
                                    }`}
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
                                <p className="pt-2 text-xs text-red-600 italic">
                                    No slot assigned
                                </p>
                            )}
                        </CardHeader>
                        <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0 md:p-6 md:pt-0">
                            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                                <span className="truncate">
                                    Admitted: {formatDate(patient.created_at)}
                                </span>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-3 sm:pt-4 border-t p-4 sm:p-5 md:p-6">
                            <div className="flex w-full gap-2 flex-wrap">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 min-w-[70px] xs:min-w-[80px] text-xs"
                                    onClick={() => handleEditClick(patient)}
                                >
                                    <Edit className="w-3 h-3 mr-1" /> Edit
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="flex-1 min-w-[80px] xs:min-w-[90px] text-xs"
                                    onClick={() =>
                                        handleAssignSlotClick(patient)
                                    }
                                >
                                    <Bed className="w-3 h-3 mr-1" /> Assign
                                </Button>
                                <Button
                                    variant={
                                        patient.is_active
                                            ? "destructive"
                                            : "default"
                                    }
                                    size="sm"
                                    className="flex-1 min-w-[90px] xs:min-w-[100px] text-xs"
                                    disabled={
                                        togglePatientStatus.isPending &&
                                        togglePatientStatus.variables ===
                                            patient.id
                                    }
                                    onClick={() =>
                                        togglePatientStatus.mutate(patient.id)
                                    }
                                >
                                    {patient.is_active ? (
                                        <PowerOff className="w-3 h-3 mr-1" />
                                    ) : (
                                        <Power className="w-3 h-3 mr-1" />
                                    )}
                                    {togglePatientStatus.isPending &&
                                    togglePatientStatus.variables === patient.id
                                        ? "..."
                                        : patient.is_active
                                          ? "Deactivate"
                                          : "Activate"}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Empty state when filter returns no results */}
            {filteredPatients.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground text-lg">
                        No{" "}
                        {activeFilter === "active"
                            ? "active"
                            : activeFilter === "inactive"
                              ? "inactive"
                              : ""}{" "}
                        patients found
                    </p>
                </div>
            )}

            {/* Intersection Observer Target & Loading Indicator */}
            {hasNextPage && (
                <div
                    ref={observerTarget}
                    className="flex justify-center items-center py-6 sm:py-8 md:py-10"
                >
                    {isFetchingNextPage ? (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm sm:text-base">
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                            Loading more patients...
                        </div>
                    ) : (
                        <div className="text-muted-foreground text-xs sm:text-sm">
                            Scroll down to load more patients
                        </div>
                    )}
                </div>
            )}

            {/* End of list indicator */}
            {!hasNextPage && allPatients.length > 0 && (
                <div className="flex justify-center py-6 sm:py-8 md:py-10">
                    <div className="text-muted-foreground text-xs sm:text-sm md:text-base">
                        You've reached the end of the patient list
                    </div>
                </div>
            )}
        </div>
    );
}

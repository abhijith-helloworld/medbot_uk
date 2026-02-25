"use client";

import type React from "react";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    UserCircle as UserNurse,
    Plus,
    Edit,
    Mail,
    Phone,
    Calendar,
    UserX,
    UserCheck,
    Loader2,
    Power,
    PowerOff,
} from "lucide-react";
import {
    useNurses,
    useCreateNurse,
    useUpdateNurse,
    useToggleNurseStatus,
} from "../hooks/useNurses";
import type { Nurse } from "../api/nurse";

const initialNurseState = {
    username: "",
    password: "",
    name: "",
    email: "",
    role: "nurse" as "nurse" | "admin",
    gender: "female" as "male" | "female",
};

function NurseCardSkeleton() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div>
                            <Skeleton className="h-5 w-32 mb-1" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <Skeleton className="h-5 w-12" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="pl-1 space-y-2 border-l-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4 ml-2" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4 ml-2" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4 ml-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                </div>
            </CardContent>
        </Card>
    );
}

export function NurseManagement() {
    const { data: nurses, isLoading } = useNurses();
    const { mutate: createNurse, isPending: isCreating } = useCreateNurse();
    const { mutate: updateNurse, isPending: isUpdating } = useUpdateNurse();
    const { mutate: toggleNurseStatus } = useToggleNurseStatus();

    // State for the form, dialog, and edit mode
    const [formState, setFormState] = useState(initialNurseState);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingNurseId, setEditingNurseId] = useState<number | null>(null);
    const [togglingNurseId, setTogglingNurseId] = useState<number | null>(null);

    // NEW: Add filter state
    const [nurseFilter, setNurseFilter] = useState<"active" | "inactive">(
        "active",
    );

    // NEW: Filter nurses based on is_active status
    const filteredNurses = useMemo(() => {
        if (!nurses) return [];
        if (nurseFilter === "all") return nurses;
        if (nurseFilter === "active")
            return nurses.filter((nurse) => nurse.is_active === true);
        if (nurseFilter === "inactive")
            return nurses.filter((nurse) => nurse.is_active === false);
        return nurses;
    }, [nurses, nurseFilter]);

    // NEW: Count active and inactive nurses
    const activeNursesCount = useMemo(
        () => nurses?.filter((n) => n.is_active).length || 0,
        [nurses],
    );
    const inactiveNursesCount = useMemo(
        () => nurses?.filter((n) => !n.is_active).length || 0,
        [nurses],
    );

    // Open the modal in "Edit" mode
    const handleOpenEditModal = (nurse: Nurse) => {
        setIsEditMode(true);
        setEditingNurseId(nurse.id);
        setFormState({
            username: nurse.username,
            name: nurse.name,
            email: nurse.email,
            role: nurse.role,
            gender: nurse.gender,
            password: "", // Clear password field for security
        });
        setIsModalOpen(true);
    };

    // Open the modal in "Add" mode
    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setFormState(initialNurseState);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.username || !formState.email || !formState.name) {
            toast.warning("Please fill in all required fields.");
            return;
        }

        if (isEditMode && editingNurseId) {
            // Logic for updating an existing nurse
            const payload = {
                id: editingNurseId,
                username: formState.username,
                name: formState.name,
                email: formState.email,
                role: formState.role,
                gender: formState.gender,
                // Only include the password in the payload if it has been entered
                ...(formState.password && { password: formState.password }),
            };
            updateNurse(payload, {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            // Logic for creating a new nurse
            if (!formState.password) {
                toast.warning("Password is required for new users.");
                return;
            }
            createNurse(formState, {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const handleToggleStatus = (nurseId: number) => {
        setTogglingNurseId(nurseId);
        toggleNurseStatus(nurseId, {
            onSuccess: () => setTogglingNurseId(null),
            onError: () => setTogglingNurseId(null),
        });
    };

    // Reset form state when the dialog is closed
    useEffect(() => {
        if (!isModalOpen) {
            setIsEditMode(false);
            setEditingNurseId(null);
            setFormState(initialNurseState);
        }
    }, [isModalOpen]);

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                {/* Header skeleton */}
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>

                {/* Skeleton nurse cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <NurseCardSkeleton key={index} />
                    ))}
                </div>
            </div>
        );
    }

    const isSubmitting = isCreating || isUpdating;

    return (
        <div className="space-y-6 p-6">
            {/* Header + Add Nurse Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Nurse Management
                    </h1>
                    <p className="text-muted-foreground">
                        Manage nurse accounts and assignments
                    </p>
                </div>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={handleOpenAddModal}
                            className="bg-[#9d4ec3] hover:bg-[#8a42b8]"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Nurse
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px]">
                        <DialogHeader>
                            <DialogTitle>
                                {isEditMode ? "Edit Nurse" : "Add New Nurse"}
                            </DialogTitle>
                            <DialogDescription>
                                {isEditMode
                                    ? "Update the details for this nurse."
                                    : "Fill in the details below to create a new nurse account."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleFormSubmit}>
                            <div className="grid gap-4 py-4">
                                {/* Form Fields */}
                                <div className="grid items-center grid-cols-4 gap-4">
                                    <Label
                                        htmlFor="name"
                                        className="text-right"
                                    >
                                        Full Name *
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formState.name}
                                        onChange={(e) =>
                                            setFormState({
                                                ...formState,
                                                name: e.target.value,
                                            })
                                        }
                                        className="col-span-3"
                                        placeholder="e.g. Florence Nightingale"
                                        required
                                    />
                                </div>
                                <div className="grid items-center grid-cols-4 gap-4">
                                    <Label
                                        htmlFor="email"
                                        className="text-right"
                                    >
                                        Email *
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formState.email}
                                        onChange={(e) =>
                                            setFormState({
                                                ...formState,
                                                email: e.target.value,
                                            })
                                        }
                                        className="col-span-3"
                                        placeholder="nurse@example.com"
                                        required
                                    />
                                </div>
                                <div className="grid items-center grid-cols-4 gap-4">
                                    <Label
                                        htmlFor="username"
                                        className="text-right"
                                    >
                                        Username *
                                    </Label>
                                    <Input
                                        id="username"
                                        value={formState.username}
                                        onChange={(e) =>
                                            setFormState({
                                                ...formState,
                                                username: e.target.value,
                                            })
                                        }
                                        className="col-span-3"
                                        placeholder="Enter username"
                                        required
                                    />
                                </div>
                                <div className="grid items-center grid-cols-4 gap-4">
                                    <Label
                                        htmlFor="password"
                                        className="text-right"
                                    >
                                        Password {isEditMode ? "" : "*"}
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formState.password}
                                        onChange={(e) =>
                                            setFormState({
                                                ...formState,
                                                password: e.target.value,
                                            })
                                        }
                                        className="col-span-3"
                                        placeholder={
                                            isEditMode
                                                ? "Leave blank to keep unchanged"
                                                : "Enter secure password"
                                        }
                                        required={!isEditMode}
                                    />
                                </div>
                                <div className="grid items-center grid-cols-4 gap-4">
                                    <Label
                                        htmlFor="role"
                                        className="text-right"
                                    >
                                        Role
                                    </Label>
                                    <Select
                                        value={formState.role}
                                        onValueChange={(
                                            value: "nurse" | "admin",
                                        ) =>
                                            setFormState({
                                                ...formState,
                                                role: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="nurse">
                                                Nurse
                                            </SelectItem>
                                            <SelectItem value="admin">
                                                Admin
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid items-center grid-cols-4 gap-4">
                                    <Label
                                        htmlFor="gender"
                                        className="text-right"
                                    >
                                        Gender
                                    </Label>
                                    <Select
                                        value={formState.gender}
                                        onValueChange={(
                                            value: "male" | "female",
                                        ) =>
                                            setFormState({
                                                ...formState,
                                                gender: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="female">
                                                Female
                                            </SelectItem>
                                            <SelectItem value="male">
                                                Male
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    )}
                                    {isSubmitting
                                        ? isEditMode
                                            ? "Saving..."
                                            : "Adding..."
                                        : isEditMode
                                          ? "Save Changes"
                                          : "Add Nurse"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* NEW: Filter Tabs */}
            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNurseFilter("active")}
                    data-active={nurseFilter === "active"}
                    className="
      rounded-md font-medium transition-all
      bg-purple-100 text-purple-700 hover:bg-purple-200
      data-[active=true]:bg-purple-600
      data-[active=true]:text-white
      data-[active=true]:hover:bg-purple-700
    "
                >
                    <Power className="w-4 h-4 mr-1" />
                    Active
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNurseFilter("inactive")}
                    data-active={nurseFilter === "inactive"}
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

            {/* Nurse Cards - NOW USES filteredNurses */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredNurses?.map((nurse) => (
                    <Card
                        key={nurse.id}
                        className={`${!nurse.is_active ? "opacity-60 border-dashed" : ""}`}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-muted">
                                        <UserNurse className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            {nurse.name}
                                        </CardTitle>
                                        <CardDescription>
                                            ID:{nurse.id}
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge
                                        variant={
                                            nurse.role === "admin"
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {nurse.role}
                                    </Badge>
                                    <Badge
                                        variant={
                                            nurse.is_active
                                                ? "default"
                                                : "destructive"
                                        }
                                        className={
                                            nurse.is_active
                                                ? "bg-green-600"
                                                : ""
                                        }
                                    >
                                        {nurse.is_active
                                            ? "Active"
                                            : "Inactive"}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="pl-1 space-y-2 border-l-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 ml-2 text-muted-foreground" />
                                    <span className="truncate">
                                        {nurse.email}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 ml-2 text-muted-foreground" />
                                    <span>{nurse.phone ?? "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 ml-2 text-muted-foreground" />
                                    <span>
                                        Joined:{" "}
                                        {new Date(
                                            nurse.created_at,
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 bg-transparent"
                                    onClick={() => handleOpenEditModal(nurse)}
                                >
                                    <Edit className="w-3 h-3 mr-1.5" /> Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant={
                                        nurse.is_active
                                            ? "destructive"
                                            : "default"
                                    }
                                    className="flex-1"
                                    onClick={() => handleToggleStatus(nurse.id)}
                                    disabled={togglingNurseId === nurse.id}
                                >
                                    {togglingNurseId === nurse.id ? (
                                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                    ) : nurse.is_active ? (
                                        <UserX className="w-3 h-3 mr-1.5" />
                                    ) : (
                                        <UserCheck className="w-3 h-3 mr-1.5" />
                                    )}
                                    {nurse.is_active
                                        ? "Deactivate"
                                        : "Activate"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* NEW: Empty state for filtered results */}
            {filteredNurses?.length === 0 && nurses && nurses.length > 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground text-lg">
                        No{" "}
                        {nurseFilter === "active"
                            ? "active"
                            : nurseFilter === "inactive"
                              ? "inactive"
                              : ""}{" "}
                        nurses found
                    </p>
                </div>
            )}

            {/* Empty State - Original (when no nurses at all) */}
            {nurses?.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <UserNurse className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                        No nurses found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        Get started by adding your first nurse account.
                    </p>
                    <Button
                        onClick={handleOpenAddModal}
                        className="bg-[#9d4ec3] hover:bg-[#8a42b8]"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Nurse
                    </Button>
                </div>
            )}
        </div>
    );
}

// src/features/nurse/components/InfrastructureManagement.tsx
"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Hooks
import { useRooms } from "@/features/nurse/hooks/useRooms";
import { useBeds } from "@/features/nurse/hooks/useBeds";
import { useSlots } from "@/features/nurse/hooks/useSlots";

// shadcn/ui Components & Icons
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Icons
import {
    BedDouble,
    CalendarDays,
    DoorOpen,
    PlusCircle,
    UserCircle,
    Grid2x2,
    Power,
    PowerOff,
    MapPin,
    Activity,
    Info,
} from "lucide-react";
import { toast } from "sonner";

// --- Type Definitions ---
interface Room {
    id: number;
    room_name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by: number;
    updated_by: number | null;
}

interface Bed {
    id: number;
    bed_name: string;
    is_active: boolean;
    is_booked: boolean;
    created_at: string;
    updated_at: string;
    created_by: number;
    updated_by: number | null;
}

interface Slot {
    id: number;
    is_active: boolean | string | number;
    room_name: Room | null;
    bed_name: Bed;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
    x?: number;
    y?: number;
    yaw?: number;
}

// --- Zod Validation Schema ---
const slotFormSchema = z.object({
    roomId: z.string().min(1, "Please select a room."),
    bedId: z.string().min(1, "Please select a bed."),
});

// --- Helper: normalize is_active robustly ---
const normalizeIsActive = (
    val: boolean | string | number | undefined | null,
) => {
    if (val === true) return true;
    if (val === false) return false;
    if (val === 1 || val === "1") return true;
    if (val === 0 || val === "0") return false;
    if (typeof val === "string") {
        const s = val.trim().toLowerCase();
        if (s === "true") return true;
        if (s === "false") return false;
    }
    return false;
};

// --- The Component ---
export function InfrastructureManagement() {
    // Data Fetching Hooks
    const { rooms, createRooms, isLoadingRooms } = useRooms();
    const { beds, createBeds, isLoadingBeds } = useBeds();
    const {
        slots = [],
        createSlot,
        deleteSlot,
        isLoadingSlots,
        markPosition,
        isMarking,
        markingSlotId,
    } = useSlots();

    // Component State
    const [roomCount, setRoomCount] = useState(1);
    const [bedCount, setBedCount] = useState(1);
    const [isAddRoomOpen, setAddRoomOpen] = useState(false);
    const [isAddBedOpen, setAddBedOpen] = useState(false);
    const [isAssignSlotOpen, setAssignSlotOpen] = useState(false);
    const [togglingSlotId, setTogglingSlotId] = useState<number | null>(null);
    const [viewingSlot, setViewingSlot] = useState<Slot | null>(null);

    // NEW: Add filter state for slots
    const [slotFilter, setSlotFilter] = useState<"active" | "inactive">(
        "active",
    );

    const form = useForm<z.infer<typeof slotFormSchema>>({
        resolver: zodResolver(slotFormSchema),
        defaultValues: { roomId: "", bedId: "" },
    });

    // Derived State for Slots
    const assignedSlots = useMemo(
        () => (slots?.filter((slot) => !!slot.room_name) as Slot[]) || [],
        [slots],
    );

    const unassignedSlots = useMemo(
        () => (slots?.filter((slot) => !slot.room_name) as Slot[]) || [],
        [slots],
    );

    const activeSlots = useMemo(
        () =>
            assignedSlots?.filter((slot) =>
                normalizeIsActive(slot.is_active),
            ) || [],
        [assignedSlots],
    );

    const inactiveSlots = useMemo(
        () =>
            assignedSlots?.filter(
                (slot) => !normalizeIsActive(slot.is_active),
            ) || [],
        [assignedSlots],
    );

    // NEW: Filtered slots based on toggle
    const filteredSlots = useMemo(() => {
        if (slotFilter === "all") return assignedSlots;
        if (slotFilter === "active") return activeSlots;
        if (slotFilter === "inactive") return inactiveSlots;
        return assignedSlots;
    }, [assignedSlots, activeSlots, inactiveSlots, slotFilter]);

    // Handler Functions
    const handleCreateRooms = async () => {
        try {
            await createRooms(roomCount);
            toast.success(`${roomCount} room(s) created successfully!`);
            setRoomCount(1);
            setAddRoomOpen(false);
        } catch (error) {
            toast.error("Failed to create rooms.");
        }
    };

    const handleCreateBeds = async () => {
        try {
            await createBeds(bedCount);
            toast.success(`${bedCount} bed(s) created successfully!`);
            setBedCount(1);
            setAddBedOpen(false);
        } catch (error) {
            toast.error("Failed to create beds.");
        }
    };

    const onSlotSubmit = async (values: z.infer<typeof slotFormSchema>) => {
        try {
            await createSlot({
                room_name_id: Number(values.roomId),
                bed_name_id: Number(values.bedId),
            });
            toast.success("Slot assigned successfully!");
            form.reset();
            setAssignSlotOpen(false);
        } catch (error) {
            toast.error("Failed to assign slot. It may already be assigned.");
        }
    };

    const handleToggleSlotStatus = async (
        slotId: number,
        currentStatus: boolean,
    ) => {
        setTogglingSlotId(slotId);
        try {
            await deleteSlot(slotId);
            const action = currentStatus ? "deactivated" : "activated";
            toast.success(`Slot ${action} successfully!`);
        } catch (error) {
            console.error("Toggle slot error:", error);
            toast.error("Failed to toggle slot status.");
        } finally {
            setTogglingSlotId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const extractCreatorName = (createdBy: string | null) => {
        if (!createdBy) {
            return "N/A";
        }
        return createdBy.split(" - ")[0];
    };

    const handleMarkPosition = async (slotId: number) => {
        try {
            await markPosition(slotId);
            toast.success("Slot position marked successfully!");
        } catch {
            toast.error("Failed to mark position");
        }
    };

    return (
        <div className="mx-auto space-y-6 px-4 md:px-6 lg:px-10 py-4">
            <div className="">
                {/* Header and Stats Cards */}
                <div className="mb-8 pb-2">
                    <h1 className="text-3xl font-semibold text-foreground">
                        Infrastructure Management
                    </h1>
                    <p className="text-muted-foreground">
                        Manage rooms, beds, and slot assignments efficiently
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                    {/* Total Rooms Card */}
                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Rooms
                            </CardTitle>
                            <div className="p-2 bg-accent rounded-md">
                                <DoorOpen className="h-4 w-4 text-accent-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="text-2xl font-semibold text-foreground mb-4">
                                {isLoadingRooms ? "..." : rooms?.length || 0}
                            </div>
                            <Dialog
                                open={isAddRoomOpen}
                                onOpenChange={setAddRoomOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Rooms
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Create New Rooms
                                        </DialogTitle>
                                        <DialogDescription>
                                            Enter the number of rooms you want
                                            to create.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex gap-3 py-4">
                                        <Input
                                            type="number"
                                            min={1}
                                            max={50}
                                            value={roomCount}
                                            onChange={(e) =>
                                                setRoomCount(
                                                    Number(e.target.value),
                                                )
                                            }
                                            placeholder="Number of rooms"
                                        />
                                        <Button
                                            onClick={handleCreateRooms}
                                            disabled={roomCount < 1}
                                        >
                                            Create
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>

                    {/* Total Beds Card */}
                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Beds
                            </CardTitle>
                            <div className="p-2 bg-accent rounded-md">
                                <BedDouble className="h-4 w-4 text-accent-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="text-2xl font-semibold text-foreground mb-4">
                                {isLoadingBeds ? "..." : beds?.length || 0}
                            </div>
                            <Dialog
                                open={isAddBedOpen}
                                onOpenChange={setAddBedOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Beds
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Create New Beds
                                        </DialogTitle>
                                        <DialogDescription>
                                            Enter the number of beds you want to
                                            create.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex gap-3 py-4">
                                        <Input
                                            type="number"
                                            min={1}
                                            max={50}
                                            value={bedCount}
                                            onChange={(e) =>
                                                setBedCount(
                                                    Number(e.target.value),
                                                )
                                            }
                                            placeholder="Number of beds"
                                        />
                                        <Button
                                            onClick={handleCreateBeds}
                                            disabled={bedCount < 1}
                                        >
                                            Create
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>

                    {/* Active Slots Card */}
                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Active Slots
                            </CardTitle>
                            <div className="p-2 bg-accent rounded-md">
                                <Activity className="h-4 w-4 text-accent-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="text-2xl font-semibold text-foreground">
                                {isLoadingSlots
                                    ? "..."
                                    : activeSlots?.length || 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Currently active
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Slots Card */}
                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Slots
                            </CardTitle>
                            <div className="p-2 bg-accent rounded-md">
                                <Grid2x2 className="h-4 w-4 text-accent-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="text-2xl font-semibold text-foreground">
                                {isLoadingSlots ? "..." : slots?.length || 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Currently total slots
                            </p>
                        </CardContent>
                    </Card>

                    {/* Inactive Slots Card */}
                    <Card className="bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-900">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
                                Inactive Slots
                            </CardTitle>
                            <div className="p-2 bg-red-100 rounded-md dark:bg-red-900/40">
                                <Grid2x2 className="h-4 w-4 text-red-700 dark:text-red-300" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="text-2xl font-semibold text-red-700 dark:text-red-300">
                                {inactiveSlots?.length || "..."}
                            </div>
                            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                                Inactive
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Bed Assignments Section */}
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl text-foreground">
                                Bed Assignments
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Manage room and bed slot assignments
                            </CardDescription>
                        </div>
                        <Dialog
                            open={isAssignSlotOpen}
                            onOpenChange={setAssignSlotOpen}
                        >
                            <DialogTrigger asChild>
                                <Button className="bg-[#9d4ec3] hover:bg-[#8a42b8]">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create slot
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>
                                        Assign a Bed to a Room
                                    </DialogTitle>
                                    <DialogDescription>
                                        Create a new slot by assigning a bed to
                                        a room.
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(
                                            onSlotSubmit,
                                        )}
                                        className="space-y-4 pt-4"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="roomId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Room</FormLabel>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a room" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {rooms?.map(
                                                                (room) => (
                                                                    <SelectItem
                                                                        key={
                                                                            room.id
                                                                        }
                                                                        value={String(
                                                                            room.id,
                                                                        )}
                                                                    >
                                                                        {
                                                                            room.room_name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="bedId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Bed</FormLabel>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a bed" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {beds?.map(
                                                                (bed) => (
                                                                    <SelectItem
                                                                        key={
                                                                            bed.id
                                                                        }
                                                                        value={String(
                                                                            bed.id,
                                                                        )}
                                                                        disabled={
                                                                            bed.is_booked
                                                                        }
                                                                        className={
                                                                            bed.is_booked
                                                                                ? "text-red-500"
                                                                                : ""
                                                                        }
                                                                    >
                                                                        {
                                                                            bed.bed_name
                                                                        }{" "}
                                                                        {bed.is_booked
                                                                            ? "(Booked)"
                                                                            : ""}
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="submit"
                                            className="w-full"
                                        >
                                            Create Assignment
                                        </Button>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>

                {/* NEW: Filter Tabs */}
                <div className="flex gap-2 px-5 mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSlotFilter("active")}
                        data-active={slotFilter === "active"}
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
                        onClick={() => setSlotFilter("inactive")}
                        data-active={slotFilter === "inactive"}
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

                <CardContent>
                    {isLoadingSlots ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-muted-foreground">
                                Loading slots...
                            </div>
                        </div>
                    ) : assignedSlots.length === 0 ? (
                        <div className="text-center py-12">
                            <Grid2x2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                No slots assigned
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Start by assigning beds to rooms.
                            </p>
                            <Dialog
                                open={isAssignSlotOpen}
                                onOpenChange={setAssignSlotOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Assign First Bed
                                    </Button>
                                </DialogTrigger>
                            </Dialog>
                        </div>
                    ) : filteredSlots.length === 0 ? (
                        /* NEW: Empty state for filtered results */
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-muted-foreground text-lg">
                                No{" "}
                                {slotFilter === "active"
                                    ? "active"
                                    : slotFilter === "inactive"
                                      ? "inactive"
                                      : ""}{" "}
                                slots found
                            </p>
                        </div>
                    ) : (
                        /* NOW USES filteredSlots instead of assignedSlots */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredSlots.map((slot) => {
                                const isActive = normalizeIsActive(
                                    slot.is_active,
                                );

                                return (
                                    <Card
                                        key={slot.id}
                                        className={`relative border-border flex flex-col ${isActive ? "bg-card" : "bg-muted/30"}`}
                                    >
                                        <div className="absolute top-4 right-4 z-10">
                                            <Badge
                                                variant={
                                                    isActive
                                                        ? "default"
                                                        : "secondary"
                                                }
                                                className="text-xs"
                                            >
                                                {isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </Badge>
                                        </div>

                                        <CardContent className="p-6 flex-grow flex flex-col">
                                            <div className="flex-grow space-y-4">
                                                <div className="pr-20">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <h3 className="font-medium text-foreground capitalize">
                                                            {
                                                                slot.room_name
                                                                    ?.room_name
                                                            }
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <BedDouble className="h-4 w-4 text-muted-foreground" />
                                                        <p className="text-foreground font-medium capitalize">
                                                            {
                                                                slot.bed_name
                                                                    .bed_name
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarDays className="h-3 w-3" />
                                                        <span>
                                                            Created:{" "}
                                                            {formatDate(
                                                                slot.created_at,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-start gap-2 pt-1">
                                                        <UserCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                        <div className="flex flex-col">
                                                            {slot.x !==
                                                                undefined &&
                                                            slot.y !==
                                                                undefined ? (
                                                                <>
                                                                    <span>
                                                                        Position:
                                                                    </span>
                                                                    <span className="pl-2 font-mono text-xs">
                                                                        x:{" "}
                                                                        {Number(
                                                                            slot.x,
                                                                        ).toFixed(
                                                                            4,
                                                                        )}
                                                                    </span>
                                                                    <span className="pl-2 font-mono text-xs">
                                                                        y:{" "}
                                                                        {Number(
                                                                            slot.y,
                                                                        ).toFixed(
                                                                            4,
                                                                        )}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span>
                                                                    Position:
                                                                    Not set
                                                                </span>
                                                            )}

                                                            {slot.yaw !==
                                                            undefined ? (
                                                                <span className="mt-1">
                                                                    Angle:{" "}
                                                                    {Number(
                                                                        slot.yaw,
                                                                    ).toFixed(
                                                                        4,
                                                                    )}
                                                                </span>
                                                            ) : (
                                                                <span className="mt-1">
                                                                    Angle: Not
                                                                    set
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-border">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Button
                                                        variant={
                                                            isActive
                                                                ? "destructive"
                                                                : "default"
                                                        }
                                                        size="sm"
                                                        className="h-9 text-sm min-w-0"
                                                        disabled={
                                                            togglingSlotId ===
                                                            slot.id
                                                        }
                                                        onClick={() =>
                                                            handleToggleSlotStatus(
                                                                slot.id,
                                                                isActive,
                                                            )
                                                        }
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            {isActive ? (
                                                                <>
                                                                    <PowerOff className="h-3.5 w-3.5" />
                                                                    <span>
                                                                        Deactivate
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Power className="h-3.5 w-3.5" />
                                                                    <span>
                                                                        Activate
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-9 text-sm min-w-0"
                                                        onClick={() =>
                                                            setViewingSlot(slot)
                                                        }
                                                    >
                                                        <div className="flex items-center justify-center gap-1.5 w-full">
                                                            <Info className="h-3.5 w-3.5 flex-shrink-0" />
                                                            <span className="truncate">
                                                                View Details
                                                            </span>
                                                        </div>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </CardContent>

                {/* View Slot Details Dialog */}
                <Dialog
                    open={!!viewingSlot}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) setViewingSlot(null);
                    }}
                >
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>
                                Slot Details:{" "}
                                {viewingSlot?.room_name?.room_name} /{" "}
                                {viewingSlot?.bed_name.bed_name}
                            </DialogTitle>
                            <DialogDescription>
                                Detailed information for the selected slot.
                            </DialogDescription>
                        </DialogHeader>

                        {viewingSlot && (
                            <div className="py-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                        Status
                                    </span>
                                    <Badge
                                        variant={
                                            normalizeIsActive(
                                                viewingSlot.is_active,
                                            )
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {normalizeIsActive(
                                            viewingSlot.is_active,
                                        )
                                            ? "Active"
                                            : "Inactive"}
                                    </Badge>
                                </div>
                                <Separator />
                                <h4 className="font-semibold text-foreground">
                                    Position Data (Full Precision)
                                </h4>
                                <div className="space-y-2 text-sm font-mono bg-muted p-3 rounded-md">
                                    <p>
                                        X-coordinate:{" "}
                                        <span className="font-semibold">
                                            {viewingSlot.x ?? "N/A"}
                                        </span>
                                    </p>
                                    <p>
                                        Y-coordinate:{" "}
                                        <span className="font-semibold">
                                            {viewingSlot.y ?? "N/A"}
                                        </span>
                                    </p>
                                    <p>
                                        Angle (Yaw):{" "}
                                        <span className="font-semibold">
                                            {viewingSlot.yaw ?? "N/A"}
                                        </span>
                                    </p>
                                </div>
                                <Separator />
                                <h4 className="font-semibold text-foreground">
                                    Metadata
                                </h4>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p>
                                        Slot ID:{" "}
                                        <span className="font-medium text-foreground">
                                            {viewingSlot.id}
                                        </span>
                                    </p>
                                    <p>
                                        Created On:{" "}
                                        <span className="font-medium text-foreground">
                                            {formatDate(viewingSlot.created_at)}
                                        </span>
                                    </p>
                                    <p>
                                        Last Updated:{" "}
                                        <span className="font-medium text-foreground">
                                            {formatDate(viewingSlot.updated_at)}
                                        </span>
                                    </p>
                                    <p>
                                        Created By:{" "}
                                        <span className="font-medium text-foreground">
                                            {extractCreatorName(
                                                viewingSlot.created_by,
                                            )}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

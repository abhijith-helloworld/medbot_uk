"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useSlots,
  useSwapPatientScheduler,
  useDeleteSlot,
} from "../hooks/usePatient";
import { useSwapRoomOrder } from "../hooks/useScheduler";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DropAnimation,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect, useMemo } from "react";
import { GripVertical, X, Loader2 } from "lucide-react";
import type { Slot } from "../api/patient";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { toast } from "sonner";

type Room = {
  room: number;
  schedule_order: number;
  slots: Slot[];
};

function PatientItem({
  slot,
  index,
  isOverlay = false,
  onDelete,
  isDeleting,
}: {
  slot: Slot;
  index: number;
  isOverlay?: boolean;
  onDelete?: (slotId: number) => void;
  isDeleting?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between w-full text-left p-3 rounded-lg shadow-sm border 
        ${
          isOverlay
            ? "ring-2 ring-blue-500 shadow-lg bg-white border-blue-500"
            : "cursor-grab bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700"
        }`}
    >
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 w-6 text-center">
          {index + 1}.
        </span>
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-100">
            {slot.patient.name} ({slot.patient.patient_id})
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{slot.bed_name}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(slot.id)}
            disabled={isDeleting}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1.5 rounded-md text-slate-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Remove patient"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          </button>
        )}
        <GripVertical className="h-5 w-5 text-slate-400 dark:text-slate-500" />
      </div>
    </div>
  );
}

function SortablePatientItem({
  slot,
  index,
  onDelete,
  isDeleting,
}: {
  slot: Slot;
  index: number;
  onDelete: (slotId: number) => void;
  isDeleting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: `slot-${slot.id}`,
      data: { type: "patient", slot },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <PatientItem slot={slot} index={index} onDelete={onDelete} isDeleting={isDeleting} />
    </li>
  );
}

function SortableRoom({ room, children }: { room: Room; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `room-${room.room}`,
    data: { type: "room", schedule_order: room.schedule_order },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
    >
      <div
        {...attributes}
        {...listeners}
        className="pb-2 border-b border-slate-200 dark:border-slate-700 cursor-grab flex items-center gap-2 touch-none"
      >
        <GripVertical className="h-5 w-5 text-slate-400 dark:text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Room {room.room}</h3>
      </div>
      {children}
    </div>
  );
}

export function AssignedPatientsModal({
  isOpen,
  onOpenChange,
  batchId,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: number | null;
}) {
  const queryClient = useQueryClient();
  const { data: slotGroups, isLoading } = useSlots();
  const swapPatients = useSwapPatientScheduler();
  const deleteSlot = useDeleteSlot();
  const swapRoomOrder = useSwapRoomOrder();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<number | null>(null);

  const groupedRooms = useMemo((): Room[] => {
    if (!slotGroups || !batchId) return [];
    return slotGroups
      .map((group) => {
        const filteredSlots = group.slots.filter((slot) => slot.batch.id === batchId);
        if (!filteredSlots.length) return null;
        return {
          room: group.row_number,
          schedule_order: Math.min(...filteredSlots.map((s) => s.schedule_order)),
          slots: filteredSlots.sort((a, b) => a.schedule_order - b.schedule_order),
        };
      })
      .filter((g): g is Room => g !== null)
      .sort((a, b) => a.schedule_order - b.schedule_order);
  }, [slotGroups, batchId]);

  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [roomOrder, setRoomOrder] = useState<Room[]>([]);

  useEffect(() => setRoomOrder(groupedRooms), [groupedRooms]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const activeSlot = useMemo(() => {
    if (typeof activeId !== "string" || !activeId.startsWith("slot-")) return undefined;
    const numericId = parseInt(activeId.replace("slot-", ""), 10);
    return roomOrder.flatMap((r) => r.slots).find((slot) => slot.id === numericId);
  }, [activeId, roomOrder]);

  const promptDeleteSlot = (slotId: number) => {
    setSlotToDelete(slotId);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!slotToDelete) return;
    deleteSlot.mutate(slotToDelete, {
      onSuccess: () => {
        setIsConfirmOpen(false);
        setSlotToDelete(null);
      },
      onError: () => {
        setIsConfirmOpen(false);
        setSlotToDelete(null);
      },
    });
  };

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;
    const previousOrder = roomOrder;

    // Room swap
    if (activeType === "room" && overType === "room") {
      const oldIndex = roomOrder.findIndex((r) => `room-${r.room}` === active.id);
      const newIndex = roomOrder.findIndex((r) => `room-${r.room}` === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(roomOrder, oldIndex, newIndex);
        setRoomOrder(newOrder); // instant UI update

        if (batchId) {
          swapRoomOrder.mutate(
            {
              room_pos_a: roomOrder[oldIndex].schedule_order,
              room_pos_b: roomOrder[newIndex].schedule_order,
              batch_id: batchId,
            },
            {
              onError: () => {
                setRoomOrder(previousOrder);
                toast.error("Room reorder failed");
              },
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["slots"] });
                toast.success("Rooms reordered successfully");
              },
            }
          );
        }
      }
    }

    // Patient swap
    if (activeType === "patient" && overType === "patient") {
      const activeSlotId = parseInt(String(active.id).replace("slot-", ""));
      const overSlotId = parseInt(String(over.id).replace("slot-", ""));
      setRoomOrder((prev) =>
        prev.map((room) => {
          const oldIndex = room.slots.findIndex((s) => s.id === activeSlotId);
          const newIndex = room.slots.findIndex((s) => s.id === overSlotId);
          if (oldIndex !== -1 && newIndex !== -1) {
            const newSlots = arrayMove(room.slots, oldIndex, newIndex);

            swapPatients.mutate(
              { pk1: activeSlotId, pk2: overSlotId },
              {
                onError: () => {
                  setRoomOrder(previousOrder);
                  toast.error("Patient reorder failed");
                },
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["slots"] });
                  toast.success("Patients reordered successfully");
                },
              }
            );

            return { ...room, slots: newSlots };
          }
          return room;
        })
      );
    }

    setActiveId(null);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  const dropAnimation: DropAnimation = {
    duration: 200,
    easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }),
  };

  if (!isOpen || batchId === null) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          className="mx-4"
          style={{ height: "85vh", maxHeight: "85vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
              <DialogHeader>
                <DialogTitle>Arrange Patient Rounds</DialogTitle>
                <DialogDescription>
                  Drag a room header to reorder rooms. Drag a patient to reorder within a room.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="flex-1 overflow-y-auto relative bg-slate-50 dark:bg-slate-950" style={{ minHeight: 0, overflowX: "hidden" }}>
              {isLoading ? (
                <div className="flex items-center justify-center h-full">Loading...</div>
              ) : roomOrder.length === 0 ? (
                <div className="flex items-center justify-center h-full">No patients assigned to this batch.</div>
              ) : (
                <div className="p-4 space-y-4">
                  <SortableContext items={roomOrder.map((r) => `room-${r.room}`)} strategy={verticalListSortingStrategy}>
                    {roomOrder.map((room) => (
                      <SortableRoom key={room.room} room={room}>
                        <SortableContext items={room.slots.map((slot) => `slot-${slot.id}`)} strategy={verticalListSortingStrategy}>
                          <ul className="space-y-2">
                            {room.slots.map((slot, index) => (
                              <SortablePatientItem
                                key={slot.id}
                                slot={slot}
                                index={index}
                                onDelete={promptDeleteSlot}
                                isDeleting={deleteSlot.isPending && slotToDelete === slot.id}
                              />
                            ))}
                          </ul>
                        </SortableContext>
                      </SortableRoom>
                    ))}
                  </SortableContext>
                </div>
              )}
            </div>
            <DragOverlay dropAnimation={dropAnimation}>{activeSlot && <PatientItem slot={activeSlot} index={0} isOverlay />}</DragOverlay>
          </DndContext>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={handleConfirmDelete}
        isConfirming={deleteSlot.isPending}
        title="Are you sure?"
        description="This will permanently remove the patient from this batch. This action cannot be undone."
      />
    </>
  );
}

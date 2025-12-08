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
import { toast } from "sonner"; // <-- IMPORT TOAST

// Define a type for our internal representation of a room
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
  const commonClasses =
    "flex items-center justify-between w-full text-left p-3 rounded-lg shadow-sm border";
  const overlayClasses = isOverlay
    ? "ring-2 ring-blue-500 bg-white shadow-lg"
    : "bg-slate-50 hover:bg-slate-100";
  const cursorClass = isOverlay ? "" : "cursor-grab";

  return (
    <div className={`${commonClasses} ${overlayClasses} ${cursorClass}`}>
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold text-slate-500 w-6 text-center">
          {index + 1}.
        </span>
        <div>
          <p className="font-medium text-slate-800">
            {slot.patient.name} ({slot.patient.patient_id})
          </p>
          <p className="text-xs text-slate-500">
            {slot.bed_name}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(slot.id)}
            disabled={isDeleting}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1.5 rounded-md text-slate-400 hover:bg-red-100 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Remove patient"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        )}
        <GripVertical className="h-5 w-5 text-slate-400" />
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
      data: {
        type: "patient",
        slot,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <PatientItem
        slot={slot}
        index={index}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />
    </li>
  );
}

// A component to make the entire room sortable
function SortableRoom({ room, children }: { room: Room; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `room-${room.room}`,
    data: {
      type: "room",
      // Pass the schedule_order in the data payload, this is crucial
      schedule_order: room.schedule_order,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-3 bg-white p-4 rounded-lg border shadow-sm">
      <div {...attributes} {...listeners} className="pb-2 border-b border-slate-200 cursor-grab flex items-center gap-2 touch-none">
        <GripVertical className="h-5 w-5 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-600">
          Room {room.room}
        </h3>
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
  const { data: slotGroups, isLoading } = useSlots();
  const { mutate: swapPatients } = useSwapPatientScheduler();
  const { mutate: deleteSlot, isPending: isDeletingSlot } = useDeleteSlot();
  const { mutate: swapRoomOrder } = useSwapRoomOrder();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<number | null>(null);

  // Memoized function to structure room data, now includes schedule_order and sorts by it.
  const groupedRooms = useMemo((): Room[] => {
    if (!slotGroups || !batchId) return [];
    const rooms = slotGroups
      .map((group) => {
        const filteredSlots = group.slots.filter((slot) => slot.batch.id === batchId);
        if (filteredSlots.length === 0) {
          return null;
        }
        return {
          room: group.row_number,
          // Extract schedule_order from the first slot, assuming it's consistent for the group
          schedule_order: filteredSlots[0].schedule_order,
          slots: filteredSlots,
        };
      })
      .filter((group): group is Room => group !== null);

    // Sort the rooms by their schedule_order initially
    return rooms.sort((a, b) => a.schedule_order - b.schedule_order);
  }, [slotGroups, batchId]);

  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [roomOrder, setRoomOrder] = useState<Room[]>([]);

  useEffect(() => {
    setRoomOrder(groupedRooms);
  }, [groupedRooms]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const activeSlot = useMemo(() => {
    if (typeof activeId !== 'string' || !activeId.startsWith('slot-')) return undefined;
    const numericId = parseInt(activeId.replace('slot-', ''), 10);
    return roomOrder
      .flatMap((r) => r.slots)
      .find((slot) => slot.id === numericId);
  }, [activeId, roomOrder]);


  const promptDeleteSlot = (slotId: number) => {
    setSlotToDelete(slotId);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!slotToDelete) return;

    deleteSlot(slotToDelete, {
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
    const { active } = event;
    setActiveId(active.id);
  }

  // Drag end logic now handles both room and patient swaps
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // --- Room Swapping Logic ---
    if (activeType === 'room' && overType === 'room') {
      const activeScheduleOrder = active.data.current?.schedule_order;
      const overScheduleOrder = over.data.current?.schedule_order;

      // Ensure we have the necessary data
      if (activeScheduleOrder === undefined || overScheduleOrder === undefined) {
        return;
      }

      setRoomOrder((prev) => {
        const oldIndex = prev.findIndex((r) => `room-${r.room}` === active.id);
        const newIndex = prev.findIndex((r) => `room-${r.room}` === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(prev, oldIndex, newIndex);

          // [CORRECTED] Call the API mutation with room positions AND batch_id
          if (batchId) {
            swapRoomOrder({
              room_pos_a: activeScheduleOrder,
              room_pos_b: overScheduleOrder,
              batch_id: batchId, // <-- Pass the batch_id here
            });
          } else {
            console.error("Cannot swap rooms, batchId is missing.");
            toast.error("An error occurred: Batch ID is missing.");
          }

          return newOrder;
        }
        return prev;
      });
    }

    // --- Patient Swapping Logic (within the same room) ---
    if (activeType === 'patient' && overType === 'patient') {
      const activeSlotId = parseInt(String(active.id).replace('slot-', ''));
      const overSlotId = parseInt(String(over.id).replace('slot-', ''));

      setRoomOrder((prev) =>
        prev.map((room) => {
          const oldIndex = room.slots.findIndex((s) => s.id === activeSlotId);
          const newIndex = room.slots.findIndex((s) => s.id === overSlotId);

          // Check if both patients are in the same room
          if (oldIndex !== -1 && newIndex !== -1) {
            const newSlots = arrayMove(room.slots, oldIndex, newIndex);
            swapPatients({ pk1: activeSlotId, pk2: overSlotId });
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
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.4",
        },
      },
    }),
  };

  if (!isOpen || batchId === null) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          className="mx-4"
          style={{
            height: '85vh',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
          }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="p-6 pb-4 border-b border-slate-200 flex-shrink-0">
              <DialogHeader>
                <DialogTitle>Arrange Patient Rounds</DialogTitle>
                <DialogDescription>
                  Drag a room header to reorder rooms. Drag a patient to reorder within a room.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div
              className="flex-1 overflow-y-auto relative bg-slate-50"
              style={{
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden'
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-full ">
                  Loading...
                </div>
              ) : roomOrder.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  No patients assigned to this batch.
                </div>
              ) : (
                <div className="p-4">
                  {/* Outer SortableContext for Rooms */}
                  <div className="space-y-4">
                    <SortableContext
                      items={roomOrder.map((r) => `room-${r.room}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {roomOrder.map((room) => (
                        <SortableRoom key={room.room} room={room}>
                          {/* Inner SortableContext for Patients */}
                          <SortableContext
                            items={room.slots.map((slot) => `slot-${slot.id}`)}
                            strategy={verticalListSortingStrategy}
                          >
                            <ul className="space-y-2">
                              {room.slots.map((slot, index) => (
                                <SortablePatientItem
                                  key={slot.id}
                                  slot={slot}
                                  index={index}
                                  onDelete={promptDeleteSlot}
                                  isDeleting={isDeletingSlot && slotToDelete === slot.id}
                                />
                              ))}
                            </ul>
                          </SortableContext>
                        </SortableRoom>
                      ))}
                    </SortableContext>
                  </div>
                </div>
              )}
            </div>
            <DragOverlay dropAnimation={dropAnimation}>
              {/* Only show overlay for patients, not for rooms */}
              {activeSlot ? (
                <PatientItem
                  slot={activeSlot}
                  index={0} // Index doesn't matter for the overlay
                  isOverlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={handleConfirmDelete}
        isConfirming={isDeletingSlot}
        title="Are you sure?"
        description="This will permanently remove the patient from this batch. This action cannot be undone."
      />
    </>
  );
}
// features/nurse/components/Scheduler.tsx
"use client";

import { useState } from "react";
import {
  Loader2,
  PlusCircle,
  Edit,
  Power,
  PowerOff,
  UserPlus,
  Eye,
} from "lucide-react";
import {
  useScheduler,
  useUploadSchedulersExcel,
  useDownloadSchedulersExcel,
} from "../hooks/useScheduler";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SchedulerDialog } from "../components/scheduler/SchedulerDialog";
import { Scheduler as SchedulerType, SchedulerPayload } from "../api/scheduler";
import AssignPatientToBatch from "./AssignPatientToBatch";
import { AssignedPatientsModal } from "./AssignedPatientsModal";
import ExcelDropdownUploader from "../hooks/useExcelDropdownUploader";

export default function Scheduler() {
  const { schedulers, isLoadingSchedulers, error, addOrUpdate, isMutating } =
    useScheduler();

 

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedScheduler, setSelectedScheduler] =
    useState<SchedulerType | null>(null);

  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [isPatientsModalOpen, setIsPatientsModalOpen] = useState(false);

  const handleOpenDialog = (scheduler?: SchedulerType) => {
    setSelectedScheduler(scheduler || null);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (scheduler: SchedulerType) => {
    addOrUpdate({
      pk: scheduler.id,
      is_stopped: !scheduler.is_stopped,
    });
  };

  const handleFormSubmit = (data: SchedulerPayload) => {
    addOrUpdate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
      },
    });
  };

  const handleViewPatients = (batchId: number) => {
    setSelectedBatchId(batchId);
    setIsPatientsModalOpen(true);
  };

  if (isLoadingSchedulers) {
    return (
      <div className="flex items-center justify-center h-screen ">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading schedules...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen ">
        <div className="flex items-center gap-2 text-muted-foreground">
          Failed to load schedulers: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full mx-auto space-y-6 px-4 md:px-6 lg:px-10 py-4">
      <div className="h-full p-2 md:p-2 flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center  ">
          <h1 className="text-3xl font-bold ">Batch Schedulers</h1>

          <div className="flex gap-3 items-center">
            <Button
              onClick={() => setIsAssignModalOpen(true)}
              variant="outline"
              className="border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Assign Patient
            </Button>

            <Button
              onClick={() => handleOpenDialog()}
              className="bg-[#9d4ec3] hover:bg-[#8a42b8]"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Schedule
            </Button>

            <ExcelDropdownUploader
              uploadHook={useUploadSchedulersExcel}
              downloadHook={useDownloadSchedulersExcel}
              buttonLabel="Manage Excel"
            />
          </div>
        </div>

        {/* Scheduler Cards */}
        {!schedulers || schedulers.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No schedules available.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {schedulers.map((scheduler) => (
              <Card
                key={scheduler.id}
                className="hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <CardHeader className="bg-purple-50 p-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-semibold text-purple-800">
                      {scheduler.batch_name}
                    </CardTitle>
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-full ${
                        scheduler.is_stopped
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {scheduler.is_stopped ? "Stopped" : "Active"}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-4  space-y-3 flex-grow">
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <p className="">
                      <strong className="font-medium ">
                        Time Slot:
                      </strong>{" "}
                      {scheduler.time_slot}
                    </p>
                    <p>
                      <strong className="font-medium">
                        Trigger Time:
                      </strong>{" "}
                      {scheduler.trigger_time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap ">
                    <strong className="text-sm font-medium ">
                      Days:
                    </strong>
                    {[
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                      "saturday",
                      "sunday",
                    ]
                      .filter((day) => scheduler[day as keyof typeof scheduler])
                      .map((day) => (
                        <span
                          key={day}
                          className="px-2 py-1 bg-gray-100 dark:bg-black rounded-lg text-xs font-semibold "
                        >
                          {day.slice(0, 3).toUpperCase()}
                        </span>
                      ))}
                  </div>
                  <p className="text-sm flex items-center gap-1">
                    <strong className="font-medium ">
                      Notified:
                    </strong>
                    <span
                      className={
                        scheduler.is_notified
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {scheduler.is_notified ? "Yes" : "No"}
                    </span>
                  </p>
                  <p className="text-xs  pt-2 border-t mt-4">
                    Created At:{" "}
                    {new Date(scheduler.created_at).toLocaleString()}
                  </p>
                  <p className="text-xs  pt-2 border-t mt-4">
                    Completed at:{" "}
                    {scheduler.completed_time
                      ? new Date(scheduler.completed_time).toLocaleString(
                          "en-IN",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }
                        )
                      : "Not completed yet"}
                  </p>
                </CardContent>

                <CardFooter className="p-4 bg-gray-50 border-t flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-purple-600 hover:text-purple-800 transition-colors"
                    onClick={() => handleViewPatients(scheduler.id)}
                  >
                    <Eye className="h-4 w-4" /> View Patients
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenDialog(scheduler)}
                      aria-label="Edit Schedule"
                      className="text-gray-600 hover:bg-gray-200"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleToggleStatus(scheduler)}
                      disabled={isMutating}
                      aria-label={
                        scheduler.is_stopped
                          ? "Activate Schedule"
                          : "Deactivate Schedule"
                      }
                      className={`
                        ${
                          scheduler.is_stopped
                            ? "text-green-600 hover:text-green-700"
                            : "text-red-600 hover:bg-red-50 hover:text-red-700"
                        }
                      `}
                    >
                      {scheduler.is_stopped ? (
                        <Power className="h-4 w-4" />
                      ) : (
                        <PowerOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        {/* Modals and Dialogs */}
        <AssignedPatientsModal
          isOpen={isPatientsModalOpen}
          onOpenChange={setIsPatientsModalOpen}
          batchId={selectedBatchId}
        />
        <SchedulerDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          scheduler={selectedScheduler}
          onSubmit={handleFormSubmit}
          isMutating={isMutating}
        />
        <AssignPatientToBatch
          isOpen={isAssignModalOpen}
          onOpenChange={setIsAssignModalOpen}
        />
      </div>
    </div>
  );
}

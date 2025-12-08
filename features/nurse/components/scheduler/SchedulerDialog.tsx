"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Clock, Calendar, Tag } from "lucide-react";
import { Scheduler, SchedulerPayload } from "../../api/scheduler";

interface SchedulerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  scheduler?: Scheduler | null;
  onSubmit: (data: SchedulerPayload) => void;
  isMutating: boolean;
}

const weekDays = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
];

const timeSlotOptions = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "night", label: "Night" },
];

export function SchedulerDialog({
  isOpen,
  onOpenChange,
  scheduler,
  onSubmit,
  isMutating,
}: SchedulerDialogProps) {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<SchedulerPayload>();
  const isEditMode = !!scheduler;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && scheduler) {
        reset({
          batch_name: scheduler.batch_name,
          time_slot: scheduler.time_slot,
          trigger_time: scheduler.trigger_time.slice(0, 5),
          ...weekDays.reduce((acc, day) => ({ 
            ...acc, 
            [day.key]: scheduler[day.key as keyof Scheduler] 
          }), {}),
        });
      } else {
        reset({
          batch_name: "",
          time_slot: "morning",
          trigger_time: "",
          ...weekDays.reduce((acc, day) => ({ ...acc, [day.key]: false }), {}),
        });
      }
    }
  }, [isOpen, isEditMode, scheduler, reset]);

  const handleFormSubmit = (data: SchedulerPayload) => {
    const payload = { ...data };
    if (isEditMode && scheduler) {
      payload.pk = scheduler.id;
    }
    onSubmit(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5 text-primary" />
            {isEditMode ? "Edit Scheduler" : "Create New Scheduler"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEditMode 
              ? "Update the details for this schedule." 
              : "Configure your batch schedule settings below."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
          {/* Batch Name Section */}
          <div className="space-y-2">
            <Label htmlFor="batch_name" className="flex items-center gap-2 text-sm font-medium">
              <Tag className="h-4 w-4" />
              Batch Name
            </Label>
            <Input 
              id="batch_name" 
              placeholder="Enter batch name..."
              {...register("batch_name", { 
                required: "Batch name is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" }
              })} 
              className={errors.batch_name ? "border-red-500" : ""}
            />
            {errors.batch_name && (
              <p className="text-xs text-red-600">{errors.batch_name.message}</p>
            )}
          </div>

          {/* Time Configuration Section */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Configuration
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time_slot" className="text-sm">Time Slot</Label>
                <Controller
                  name="time_slot"
                  control={control}
                  rules={{ required: "Time slot is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={errors.time_slot ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlotOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.time_slot && (
                  <p className="text-xs text-red-600">{errors.time_slot.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="trigger_time" className="text-sm">Trigger Time</Label>
                <Input 
                  id="trigger_time" 
                  type="time" 
                  {...register("trigger_time", { required: "Trigger time is required" })} 
                  className={errors.trigger_time ? "border-red-500" : ""}
                />
                {errors.trigger_time && (
                  <p className="text-xs text-red-600">{errors.trigger_time.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Days Selection Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Schedule Days</Label>
            <div className="p-4 border rounded-lg bg-card">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {weekDays.map((day) => (
                  <div key={day.key} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <Controller
                      name={day.key as keyof SchedulerPayload}
                      control={control}
                      render={({ field }) => (
                        <Checkbox 
                          id={day.key} 
                          checked={!!field.value} 
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      )}
                    />
                    <label 
                      htmlFor={day.key} 
                      className="text-sm font-medium cursor-pointer select-none flex-1"
                    >
                      <span className="hidden sm:inline">{day.label}</span>
                      <span className="sm:hidden">{day.short}</span>
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Select the days when this schedule should be active
              </p>
            </div>
          </div>

          <DialogFooter className="pt-6 gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isMutating} className="min-w-[140px]">
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Save Changes" : "Create Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
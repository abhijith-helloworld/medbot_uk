import { useState } from "react";
import { useWaypoints } from "../hooks/useWaypoint";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Loader2 } from "lucide-react";

export default function WaypointManagement() {
    const {
        waypoints,
        isLoadingWaypoints,
        error,
        createEntry,
        createExit,
        isCreatingEntry,
        isCreatingExit,
    } = useWaypoints();
    const [loadingEntryId, setLoadingEntryId] = useState<number | null>(null);
    const [loadingExitId, setLoadingExitId] = useState<number | null>(null);

    if (isLoadingWaypoints) {
        return (
            <div className="flex items-center justify-center h-screen ">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading waypoints...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-destructive">
                            <span className="text-sm">
                                Error loading waypoints:{" "}
                                {(error as Error).message}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleCreateEntry = async (id: number) => {
        setLoadingEntryId(id); // show loading for THIS card only
        await createEntry({ room_pos_id: id });
        setLoadingEntryId(null); // reset after done
    };

    const handleCreateExit = async (id: number) => {
        setLoadingExitId(id);
        await createExit({ room_pos_id: id });
        setLoadingExitId(null);
    };

    return (
        <div className="mx-auto space-y-6 px-4 md:px-6 lg:px-10 py-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Waypoints</h2>
                <p className="text-sm text-muted-foreground">
                    Waypoints guide the robot through exact positions to
                    complete its path.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {waypoints?.map((room) => (
                    <Card key={room.id} className="relative  ">
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4 z-10">
                            <Badge
                                variant={
                                    room.is_active ? "default" : "secondary"
                                }
                            >
                                {room.is_active ? "Active" : "Inactive"}
                            </Badge>
                        </div>

                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg pr-16">
                                {room.room_name}
                            </CardTitle>
                            <CardDescription>
                                Created{" "}
                                {new Date(room.created_at).toLocaleDateString()}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Entry Point */}
                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                <MapPin className="h-4 w-4 mt-0.5 text-green-600" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-green-700">
                                        Entry Point
                                    </p>
                                    <div className="text-xs text-muted-foreground space-y-0.5">
                                        <div>X: {room?.entry_point.x ?? 0}</div>
                                        <div>Y: {room?.entry_point.y ?? 0}</div>
                                        <div>
                                            Yaw: {room?.entry_point.yaw ?? 0}°
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Exit Point */}
                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                <Navigation className="h-4 w-4 mt-0.5 text-orange-600" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-orange-700">
                                        Exit Point
                                    </p>
                                    <div className="text-xs text-muted-foreground space-y-0.5">
                                        <div>X: {room?.exit_point.x ?? 0}</div>
                                        <div>Y: {room?.exit_point.y ?? 0}</div>
                                        <div>
                                            Yaw: {room?.exit_point.yaw ?? 0}°
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

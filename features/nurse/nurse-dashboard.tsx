"use client";

import { useState } from "react";
import { NurseSidebar } from "@/components/nurse-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NurseOverview } from "@/components/Overview";
import { PatientManagement } from "@/features/nurse/components/patient-management";
import { RobotStatus } from "../admin/components/robot-status";
import { InfrastructureManagement } from "./components/InfrastructureManagement";
import WaypointManagement from "./components/waypointManagement";
import Scheduler from "./components/Scheduler";
import { VideoViewer } from "@/features/nurse/components/video-viewer";
import { MapManagement } from "@/components/map-management";
import Apparatus from "../../components/Apparatus";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

export function NurseDashboard({ user, onLogout }: any) {
    const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [activeView, setActiveView] = useState("overview");

    const renderContent = () => {
        switch (activeView) {
            case "overview":
                return <NurseOverview title="Nurse Overview" />;
            case "patients":
                return <PatientManagement />;
            case "robots":
                return <RobotStatus />;
            case "management":
                return <InfrastructureManagement />;
            case "waypoints":
                return <WaypointManagement />;
            case "videos":
                return <VideoViewer />;
            case "apparatus":
                return <Apparatus />;
            case "scheduler":
                return <Scheduler />;
            case "map":
                return <MapManagement />;
            default:
                return <NurseOverview title="" />;
        }
    };

    return (
        <>
            <NurseSidebar
                user={user}
                onLogout={() => setShowSignOutConfirm(true)}
                activeView={activeView}
                setActiveView={setActiveView}
            />

            <ConfirmationDialog
                isOpen={showSignOutConfirm}
                onOpenChange={setShowSignOutConfirm}
                title="Sign out"
                description="Are you sure you want to sign out?"
                isConfirming={isSigningOut}
                onConfirm={() => {
                    setIsSigningOut(true);
                    onLogout();
                }}
            />
            <SidebarInset className="flex flex-col h-screen overflow-hidden">
                <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b px-4 shadow-sm">
                    <SidebarTrigger className="-ml-1" />
                    <span className="text-lg text-muted-foreground">
                        Nurse Dashboard
                    </span>
                </header>
                <div className={`flex-1 overflow-y-auto ${activeView === 'robots' ? '' : ''}`}>
                    {renderContent()}
                </div>
            </SidebarInset>
        </>
    );
}

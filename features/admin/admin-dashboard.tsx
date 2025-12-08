"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { RobotStatus } from "@/features/admin/components/robot-status";
import { PatientManagement } from "@/features/nurse/components/patient-management";
import { NurseManagement } from "@/features/admin/components/nurse-management";
import { MapManagement, VideoManagement } from "@/components/map-management";
import { AdminOverview } from "@/features/admin/components/admin-overview";
import { InfrastructureManagement } from "../nurse/components/InfrastructureManagement";
import { AlertCenter } from "@/components/alerts/components/alert-center";
import { useAlert } from "@/components/alertContex/AlertContext";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { NurseOverview } from "@/components/Overview";

interface AdminDashboardProps {
    user: { role: string; name: string; email: string };
    onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
    const [activeView, setActiveView] = useState<string>(() => {
        try {
            const hash =
                typeof window !== "undefined" ? window.location.hash : "";
            if (hash.startsWith("#view="))
                return decodeURIComponent(hash.replace("#view=", ""));
            return localStorage.getItem("adminActiveView") || "overview";
        } catch (e) {
            return "overview";
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("adminActiveView", activeView);
            if (typeof window !== "undefined") {
                window.location.hash = `view=${encodeURIComponent(activeView)}`;
            }
        } catch (e) {}
    }, [activeView]);
    const { alertMessage, clearAlert } = useAlert();
    const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    const renderContent = () => {
        switch (activeView) {
            case "overview":
                return <NurseOverview title="Admin Overview" />;
            case "robots":
                return <RobotStatus />;
            case "patients":
                return <PatientManagement />;
            case "nurses":
                return <NurseManagement />;
            case "management":
                return <InfrastructureManagement />;
            case "map":
                return <MapManagement />;
            // case "alerts":
            //   return <AlertCenter />;
            default:
                return <NurseOverview title="Admin Overview" />;
        }
    };

    return (
        <>
            {/* {alertMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-xl shadow-lg animate-bounce z-50">
           {alertMessage}
          <button
            className="ml-2 text-white"
            onClick={() => setAlertMessage(null)}
          >
            ✖
          </button>
        </div>
      )} */}

            <AdminSidebar
                user={user}
                onLogout={() => {
                    setShowSignOutConfirm(true);
                }}
                activeView={activeView}
                setActiveView={setActiveView}
            />

            <ConfirmationDialog
                isOpen={showSignOutConfirm}
                onOpenChange={(open) => {
                    setShowSignOutConfirm(open);
                }}
                title="Sign out"
                description="Are you sure you want to sign out? You will be returned to the login screen."
                isConfirming={isSigningOut}
                onConfirm={() => {
                    setIsSigningOut(true);
                    try {
                        localStorage.removeItem("adminActiveView");
                    } catch (e) {}
                    onLogout();
                }}
            />
            <SidebarInset className="flex flex-col h-screen overflow-hidden">
                <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-white px-4 shadow-sm">
                    <SidebarTrigger />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                        <span className="text-lg text-muted-foreground">
                            Admin Dashboard
                        </span>
                    </div>
                </header>

                <div className={`flex-1 overflow-y-auto ${activeView === 'robots' ? '' : ''}`}>
                    {renderContent()}
                </div>
            </SidebarInset>
        </>
    );
}

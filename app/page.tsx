"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AdminDashboard } from "@/features/admin/admin-dashboard";
import { NurseDashboard } from "@/features/nurse/nurse-dashboard";
import { DashboardLoader } from "../components/dasboardloading";

export default function Home() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  // Redirect if no user AFTER loading
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, router, loading]);

  // Let Next.js show app/loading.tsx (user loading)
  if (loading) return null;

  if (!user) return null;

  // Dashboard data loading state (you can improve later)
  if (!user.role) {
    return <DashboardLoader />;
  }

  return user.role === "admin" ? (
    <AdminDashboard user={user} onLogout={logout} />
  ) : (
    <NurseDashboard user={user} onLogout={logout} />
  );
}

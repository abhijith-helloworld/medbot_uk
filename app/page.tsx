"use client";
import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AdminDashboard } from "@/features/admin/admin-dashboard";
import { NurseDashboard } from "@/features/nurse/nurse-dashboard";

export default function Home() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, router, loading]);

  if (!user) {
    return (
      <div className="flex w-full items-center justify-center h-screen">
        <div className="flex flex-row gap-2">
          <div className="w-4 h-4 rounded-full bg-pink-400 animate-bounce"></div>
          <div
            className="w-4 h-4 rounded-full bg-pink-400 animate-bounce"
            style={{ animationDelay: "-0.3s" }}
          ></div>
          <div
            className="w-4 h-4 rounded-full bg-pink-400 animate-bounce"
            style={{ animationDelay: "-0.5s" }}
          ></div>
        </div>
      </div>
    );
  }

  return user.role === "admin" ? (
    <AdminDashboard user={user} onLogout={logout} />
  ) : (
    <NurseDashboard user={user} onLogout={logout} />
  );
}
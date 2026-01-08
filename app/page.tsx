"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
// import Script from "next/script";
import { useAuth } from "@/contexts/AuthContext";
import { AdminDashboard } from "@/features/admin/admin-dashboard";
import { NurseDashboard } from "@/features/nurse/nurse-dashboard";

export default function Home() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  // Redirect if no user AFTER loading
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, router, loading]);

  // Let Next.js show app/loading.tsx
  if (loading) return null;
  if (!user) return null;


  return (
    <>
      {/* DASHBOARD */}
      {user.role === "admin" ? (
        <AdminDashboard user={user} onLogout={logout} />
      ) : (
        <NurseDashboard user={user} onLogout={logout} />
      )}

      {/* NOUPE CHATBOT */}
      {/* <Script
        src="https://www.noupe.com/embed/019aecf5299c73689b7d59cc3e9b4469ad6b.js"
        strategy="afterInteractive"
      /> */}
    </>
  );
}

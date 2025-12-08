// src/app/login/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Import from next/navigation
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/"); 
    }
  }, [user, router]);

  if (user) {
    return null; 
  }

  return <LoginForm />;
}
// src/contexts/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react"; // <-- Import useEffect
import type { LoginResponse } from "@/lib/api/auth";

type AuthContextType = {
  user: LoginResponse["data"] | null;
  setUser: (user: LoginResponse["data"] | null) => void;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Add this useEffect to load user from localStorage on initial render
  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth) as LoginResponse["data"];
        setUser(parsedAuth);
      } catch (error) {
        console.error("Failed to parse auth data from localStorage", error);
        localStorage.removeItem("auth");
      }
    }
    setLoading(false);
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

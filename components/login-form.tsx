// src/components/auth/LoginForm.tsx
"use client";
import type React from "react";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { loginUser } from "@/lib/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import {
  User, // <-- Import generic User icon
  Activity,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { toast } = useToast();

  // --- State updated for username ---
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both username and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // --- API call now uses formData.username directly ---
      const response = await loginUser({
        username: formData.username,
        password: formData.password,
      });

      // Update global state and persist in localStorage
      setUser(response.data);
      localStorage.setItem("auth", JSON.stringify(response.data));

      toast({
        title: `Welcome, ${response.data.name}!`,
        description: "You have been logged in successfully.",
      });

      router.push("/");

    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Login Failed",
        description: "Invalid credentials or server error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      {/* Left Side (Image) - No changes */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-white dark:bg-black" />
        <Image
          src="/images/login-bg-pink.png"
          alt="MedBot Illustration"
          fill
          style={{ objectFit: "cover" }}
          className="p-4 rounded-3xl"
        />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Activity className="mr-2 h-6 w-6" />
          MedBot Healthcare
        </div>
      </div>

      {/* Right Side (Form) */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto grid w-full max-w-[400px] gap-6">
          <div className="grid gap-2 text-center">
            {/* --- Text is now static --- */}
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          {/* --- The <Tabs> component for role selection has been removed --- */}

          <form onSubmit={handleSubmit} className="grid gap-4">
            {/* --- Email input is now Username input --- */}
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="your_username"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  className="pl-10"
                />
              </div>
            </div>

            {/* --- Password input remains the same --- */}
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#e30075] to-[#fe5ea6] text-white hover:opacity-90"
            >
              {isLoading ? "Signing In..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
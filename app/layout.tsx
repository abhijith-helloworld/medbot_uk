import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ToasterProvider } from "./toaster-provider";
import { AlertProvider } from "@/components/alertContex/AlertContext";
import EmergencyButton from "@/components/emergency-button";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MedBot Dashboard",
  description: "Medical Robot Management Dashboard",
  generator: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AlertProvider>
          <Providers>
            {children}
            <EmergencyButton />
          </Providers>
        </AlertProvider>
        <ToasterProvider />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope, DM_Sans, Fraunces, Caveat } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import QueryProvider from "./QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Falcore Proposal System",
  description: "Create and manage client proposals",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create supabase server client
  const supabase = await createClient();

  // Get session from supabase for initial hydration
  // Note: This is only used for client-side hydration, NOT for authentication decisions
  // The AuthProvider will securely verify the user with getUser() before trusting it
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} ${dmSans.variable} ${fraunces.variable} ${caveat.variable} dark antialiased`}
      >
        <QueryProvider>
          <AuthProvider initialSession={session}>{children}</AuthProvider>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}

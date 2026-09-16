import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import { Geist, Geist_Mono, Manrope, DM_Sans, Fraunces, Caveat, Oxanium } from "next/font/google";
import "./globals.css";
import { AuthProvider, type InitialAuth } from "@/components/auth/AuthProvider";
import { resolveAuthContext } from "@/lib/auth/core";
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

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

async function loadInitialAuth(): Promise<InitialAuth | null> {
  const ctx = await resolveAuthContext();
  if (ctx.kind === "anonymous") return null;
  return { user: ctx.user, role: ctx.kind === "authenticated" ? ctx.role : ctx.kind === "deactivated" ? "deactivated" : null };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialAuth = await loadInitialAuth();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} ${dmSans.variable} ${fraunces.variable} ${caveat.variable} ${oxanium.variable} dark antialiased`}
      >
        <QueryProvider>
          <AuthProvider initialAuth={initialAuth}>{children}</AuthProvider>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}

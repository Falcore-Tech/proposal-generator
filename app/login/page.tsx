// app/login/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { resolveAuthContext } from "@/lib/auth/core";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Admin Login - Falcore",
  description: "Login to access the Falcore admin tools",
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const ctx = await resolveAuthContext();
  if (ctx.kind === "deactivated") redirect("/access-revoked");
  if (ctx.kind === "unprovisioned") redirect("/unauthorized");
  if (ctx.kind === "authenticated") {
    const params = await searchParams;
    redirect(params.redirectTo || "/proposals");
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Logo
            size={48}
            className="justify-center mb-6"
            imageClassName="h-12 w-auto"
          />
          <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-zinc-400">
            Sign in to access the proposal generator and admin tools
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}

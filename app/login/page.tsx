// app/login/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { createClient } from "@/utils/supabase/server";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Admin Login - Falcore",
  description: "Login to access the Falcore admin tools",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If already authenticated, determine where to redirect based on role
  if (session) {
    const params = await searchParams;
    
    // Get user profile to determine role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    // Determine redirect destination based on role
    let redirectTo = params.redirectTo;
    
    if (!redirectTo) {
      // Default redirect for all authenticated users
      redirectTo = "/proposal-generator";
    }
    
    redirect(redirectTo);
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Image
            src="/logo-transparent.webp"
            alt="Falcore Logo"
            className="h-12 mx-auto mb-6"
            width={150}
            height={48}
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

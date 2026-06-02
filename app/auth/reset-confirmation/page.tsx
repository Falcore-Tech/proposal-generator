"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function ResetConfirmationPage() {
  const router = useRouter();

  // Automatically redirect to login page after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Logo
            size={48}
            className="justify-center mb-6"
            imageClassName="h-12 w-auto"
          />
          <h1 className="text-3xl font-bold text-white mb-2">
            Password Reset Successful
          </h1>
          <p className="text-zinc-400">
            Your password has been updated successfully.
          </p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6 shadow-lg text-center">
          <div className="mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-green-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-white mb-2">
              Your password has been successfully reset.
            </p>
            <p className="text-zinc-400">
              You can now log in with your new password.
            </p>
          </div>

          <p className="text-sm text-zinc-500 mb-6">
            You will be redirected to the login page in 5 seconds...
          </p>

          <Link
            href="/login"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

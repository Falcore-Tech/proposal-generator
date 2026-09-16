"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectUrl = (formData.get("redirectedFrom") as string) || "/proposals";

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { error } = await auth.signIn.email({ email, password });
  if (error) {
    return { error: error.message ?? "Sign in failed" };
  }

  redirect(redirectUrl);
}

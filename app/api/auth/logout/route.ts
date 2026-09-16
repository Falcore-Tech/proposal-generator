import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export async function POST() {
  await auth.signOut();
  redirect("/login");
}

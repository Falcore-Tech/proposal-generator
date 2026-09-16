import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/page";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getAuthUser();
  redirect(user ? "/proposals" : "/login");
}

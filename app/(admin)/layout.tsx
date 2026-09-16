import Navbar from "@/components/admin/Navbar";
import { requireAuthenticatedUser } from "@/lib/auth/page";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuthenticatedUser();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar user={{ id: user.id, email: user.email, name: null }} userRole={user.role} />
      <main className="pt-16">{children}</main>
    </div>
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const payload = verifyToken(token);

  if (!payload) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}

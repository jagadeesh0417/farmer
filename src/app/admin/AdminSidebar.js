"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiGrid, FiPackage, FiShoppingBag, FiLogOut, FiStar } from "react-icons/fi";

const links = [
  { href: "/admin", label: "Dashboard", icon: FiGrid },
  { href: "/admin/products", label: "Products", icon: FiPackage },
  { href: "/admin/orders", label: "Orders", icon: FiShoppingBag },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2 text-xl font-bold">
          <FiStar className="text-primary" /> ARHUU
        </Link>
        <p className="text-xs text-text-muted mt-1">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${isActive ? "bg-primary/10 text-primary" : "text-text-muted hover:text-foreground hover:bg-surface-light"}`}>
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-text-muted hover:text-red-400 hover:bg-surface-light w-full transition-colors">
          <FiLogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}

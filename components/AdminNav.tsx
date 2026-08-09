"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LogoMark from "./LogoMark";

const links = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/startups", label: "Startups", icon: "🚀" },
  { href: "/admin/news", label: "News", icon: "📰" },
  { href: "/admin/blogs", label: "Blogs", icon: "✍️" },
  { href: "/admin/carousel", label: "Carousel", icon: "🎠" },
  { href: "/admin/government", label: "Government", icon: "🏛️" },
];

interface AdminNavProps {
  user: string;
}

export default function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md">
      <div className="container-x flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2">
            <LogoMark />
            <span className="font-bold">Admin Panel</span>
          </Link>
          <span className="hidden rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300 sm:inline">
            {user}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            View site
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      <nav className="container-x flex gap-1 overflow-x-auto pb-2">
        {links.map((l) => {
          const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

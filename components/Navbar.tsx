"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoMark from "./LogoMark";

const links = [
  { href: "/", label: "Home" },
  { href: "/government", label: "Government" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/news", label: "News" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled ? "bg-white/95 shadow-md backdrop-blur" : "bg-white/80 backdrop-blur"
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <LogoMark />
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Region 8 <span className="text-brand-600">Startups</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      <div
        className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 ease-in-out md:hidden ${
          open ? "max-h-96 opacity-100" : "max-h-0 border-t-0 opacity-0"
        }`}
      >
        <div className="px-4 py-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

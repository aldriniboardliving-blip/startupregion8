import Link from "next/link";
import LogoMark from "./LogoMark";
import { PROVINCES } from "@/lib/utils";
import pkg from "../package.json";

export default function Footer() {
  return (
    <footer className="mt-20 bg-slate-900 text-slate-300">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <LogoMark />
            <span className="text-lg font-bold text-white">Region 8 Startups</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            Your gateway to the startup ecosystem of Eastern Visayas. Explore innovative
            companies, government programs, news, and stories from across the region.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            Explore
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/government" className="hover:text-white">Government Programs</Link></li>
            <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            <li><Link href="/news" className="hover:text-white">News</Link></li>
            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            Provinces
          </h4>
          <ul className="space-y-2 text-sm">
            {PROVINCES.map((p) => (
              <li key={p.slug}>
                <Link href={`/?province=${p.slug}`} className="hover:text-white">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-5">
        <p className="container-x text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Region 8 Startups. All rights reserved.
          <span className="ml-2">v{pkg.version}</span>
        </p>
      </div>
    </footer>
  );
}

"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AssistantChat from "./AssistantChat";
import PageTracker from "./PageTracker";

const HIDDEN_PREFIXES = ["/admin", "/sys-portal-x9"];

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <>
      {!hidden && <PageTracker />}
      {!hidden && <Navbar />}
      <main>{children}</main>
      {!hidden && <Footer />}
      {!hidden && <AssistantChat />}
    </>
  );
}
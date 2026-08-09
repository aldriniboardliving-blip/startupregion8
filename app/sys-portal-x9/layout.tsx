import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Portal",
  robots: { index: false, follow: false },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-slate-950">{children}</div>;
}
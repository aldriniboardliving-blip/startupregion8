import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminNav user={session.user} />
      <div className="container-x py-8">
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}

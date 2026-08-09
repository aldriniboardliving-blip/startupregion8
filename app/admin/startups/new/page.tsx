import type { Metadata } from "next";
import StartupForm from "@/components/admin/StartupForm";

export const metadata: Metadata = { title: "Add Startup" };

export default function NewStartupPage() {
  return <StartupForm />;
}

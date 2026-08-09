import type { Metadata } from "next";
import GovernmentForm from "@/components/admin/GovernmentForm";

export const metadata: Metadata = { title: "Add Government Page" };

export default function NewGovernmentPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <GovernmentForm />
    </div>
  );
}

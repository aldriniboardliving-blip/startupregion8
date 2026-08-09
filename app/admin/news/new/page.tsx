import type { Metadata } from "next";
import NewsForm from "@/components/admin/NewsForm";

export const metadata: Metadata = { title: "Add News" };

export default function NewNewsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <NewsForm />
    </div>
  );
}

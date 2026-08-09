"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GovernmentForm from "@/components/admin/GovernmentForm";
import type { ContentItem } from "@/lib/types";

export default function EditGovernmentPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/government")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load");
        return (await res.json()) as ContentItem[];
      })
      .then((items) => {
        const found = items.find((i) => i._id === params.id);
        if (!found) throw new Error("Not found");
        setItem(found);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="card h-48 animate-pulse bg-slate-100" />;
  if (error) return <p className="rounded-xl bg-red-50 p-6 text-sm text-red-600">{error}</p>;

  return <GovernmentForm initial={item ?? undefined} />;
}

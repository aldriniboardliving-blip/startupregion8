"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import StartupForm from "@/components/admin/StartupForm";
import type { Startup } from "@/lib/types";

export default function EditStartupPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<Startup | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(`/api/startups/${params.id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load");
        return (await res.json()) as Startup;
      })
      .then(setItem)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="card h-48 animate-pulse bg-slate-100" />;
  if (error) return <p className="rounded-xl bg-red-50 p-6 text-sm text-red-600">{error}</p>;

  return <StartupForm initial={item ?? undefined} />;
}

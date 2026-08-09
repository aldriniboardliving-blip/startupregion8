"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageInput from "@/components/admin/ImageInput";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { ContentItem } from "@/lib/types";

interface GovernmentFormProps {
  initial?: ContentItem;
}

interface GovernmentFormState {
  title: string;
  image: string;
  content: string;
}

export default function GovernmentForm({ initial }: GovernmentFormProps) {
  const router = useRouter();
  const isEdit = !!initial;
  const [form, setForm] = useState<GovernmentFormState>({
    title: initial?.title || "",
    image: initial?.image || "",
    content: initial?.content || "",
  });
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  function set<K extends keyof GovernmentFormState>(key: K, value: GovernmentFormState[K]): void {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/government", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: initial?._id, ...form }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed");
      router.push("/admin/government");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">
        {isEdit ? "Edit Government Page" : "Add Government Page"}
      </h1>
      <div className="card space-y-5 p-6">
        <div>
          <label className="label">Title *</label>
          <input
            className="input"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. DTI Startup Programs"
            required
          />
        </div>
        <ImageInput value={form.image} onChange={(v) => set("image", v)} />
        <RichTextEditor
          label="Page Content"
          value={form.content}
          onChange={(v) => set("content", v)}
          rows={16}
        />
      </div>
      {error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Page"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}

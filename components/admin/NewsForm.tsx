"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageInput from "@/components/admin/ImageInput";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { ContentItem } from "@/lib/types";

interface NewsFormProps {
  initial?: ContentItem;
}

interface NewsFormState {
  title: string;
  category: string;
  excerpt: string;
  image: string;
  content: string;
  published: boolean;
}

export default function NewsForm({ initial }: NewsFormProps) {
  const router = useRouter();
  const isEdit = !!initial;
  const [form, setForm] = useState<NewsFormState>({
    title: initial?.title || "",
    category: initial?.category || "",
    excerpt: initial?.excerpt || "",
    image: initial?.image || "",
    content: initial?.content || "",
    published: initial ? !!initial.published : true,
  });
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  function set<K extends keyof NewsFormState>(key: K, value: NewsFormState[K]): void {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/news", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: initial?._id, ...form }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed");
      router.push("/admin/news");
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
        {isEdit ? "Edit News" : "Add News"}
      </h1>
      <div className="card space-y-5 p-6">
        <div>
          <label className="label">Title *</label>
          <input
            className="input"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Category</label>
            <input
              className="input"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="e.g. Funding, Events, Community"
            />
          </div>
          <div>
            <label className="label">Published</label>
            <label className="flex cursor-pointer items-center gap-2 pt-2">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => set("published", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-slate-600">Visible on the website</span>
            </label>
          </div>
        </div>
        <div>
          <label className="label">Excerpt</label>
          <textarea
            className="input"
            rows={3}
            value={form.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            placeholder="Short summary shown on cards"
          />
        </div>
        <ImageInput value={form.image} onChange={(v) => set("image", v)} />
        <RichTextEditor value={form.content} onChange={(v) => set("content", v)} />
      </div>
      {error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create News"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}

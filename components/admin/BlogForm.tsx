"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageInput from "@/components/admin/ImageInput";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { ContentItem } from "@/lib/types";

interface BlogFormProps {
  initial?: ContentItem;
}

interface BlogFormState {
  title: string;
  author: string;
  excerpt: string;
  image: string;
  content: string;
  featured: boolean;
  published: boolean;
}

export default function BlogForm({ initial }: BlogFormProps) {
  const router = useRouter();
  const isEdit = !!initial;
  const [form, setForm] = useState<BlogFormState>({
    title: initial?.title || "",
    author: initial?.author || "",
    excerpt: initial?.excerpt || "",
    image: initial?.image || "",
    content: initial?.content || "",
    featured: initial ? !!initial.featured : false,
    published: initial ? !!initial.published : true,
  });
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  function set<K extends keyof BlogFormState>(key: K, value: BlogFormState[K]): void {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/blogs", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: initial?._id, ...form }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed");
      router.push("/admin/blogs");
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
        {isEdit ? "Edit Blog" : "Add Blog"}
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
            <label className="label">Author</label>
            <input
              className="input"
              value={form.author}
              onChange={(e) => set("author", e.target.value)}
            />
          </div>
          <div className="flex items-end gap-5 pb-1">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-slate-600">Featured</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => set("published", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-slate-600">Published</span>
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
          />
        </div>
        <ImageInput value={form.image} onChange={(v) => set("image", v)} />
        <RichTextEditor value={form.content} onChange={(v) => set("content", v)} />
      </div>
      {error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Blog"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}

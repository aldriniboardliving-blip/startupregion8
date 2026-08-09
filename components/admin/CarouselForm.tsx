"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageInput from "@/components/admin/ImageInput";
import LinkPicker from "@/components/admin/LinkPicker";
import type { ContentItem } from "@/lib/types";

const BADGE_OPTIONS = ["Current Event", "Upcoming", "Training", "Funding Opportunity", "News", "Announcement"];

interface CarouselFormProps {
  initial?: ContentItem;
}

interface CarouselFormState {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  sortOrder: number | string;
  active: boolean;
}

export default function CarouselForm({ initial }: CarouselFormProps) {
  const router = useRouter();
  const isEdit = !!initial;
  const [form, setForm] = useState<CarouselFormState>({
    title: initial?.title || "",
    subtitle: initial?.subtitle || "",
    image: initial?.image || "",
    link: initial?.link || "",
    sortOrder: initial?.sortOrder || 0,
    active: initial ? !!initial.active : true,
  });
  const initialSubtitle = initial?.subtitle || "";
  const [badgeMode, setBadgeMode] = useState<"preset" | "custom">(
    initialSubtitle && !BADGE_OPTIONS.includes(initialSubtitle) ? "custom" : "preset"
  );
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  function set<K extends keyof CarouselFormState>(key: K, value: CarouselFormState[K]): void {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/carousel", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: initial?._id, ...form }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed");
      router.push("/admin/carousel");
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
        {isEdit ? "Edit Carousel Item" : "Add Carousel Item"}
      </h1>
      <div className="card space-y-5 p-6">
        <div>
          <label className="label">Event Title *</label>
          <input
            className="input"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Eastern Visayas Startup Summit 2026"
            required
          />
        </div>
        <div>
          <label className="label">Subtitle / Badge</label>
          <div className="space-y-2">
            <select
              className="input"
              value={badgeMode === "preset" ? form.subtitle : "custom"}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "custom") {
                  setBadgeMode("custom");
                } else {
                  setBadgeMode("preset");
                  set("subtitle", v);
                }
              }}
            >
              <option value="">No badge</option>
              {BADGE_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
              <option value="custom">Custom…</option>
            </select>
            {badgeMode === "custom" && (
              <input
                className="input"
                value={form.subtitle}
                onChange={(e) => set("subtitle", e.target.value)}
                placeholder="Type a custom badge"
              />
            )}
            {badgeMode === "preset" && !form.subtitle && (
              <p className="text-xs text-slate-400">No badge will be shown on the slide.</p>
            )}
          </div>
        </div>
        <div>
          <label className="label">Link to</label>
          <p className="mb-1.5 text-xs text-slate-400">
            Pick an existing page/article, or choose a custom URL. Controls the
            "Learn more" button on the slide.
          </p>
          <LinkPicker value={form.link} onChange={(v) => set("link", v)} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Sort Order</label>
            <input
              type="number"
              className="input"
              value={form.sortOrder}
              onChange={(e) => set("sortOrder", e.target.value)}
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set("active", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-slate-600">Active (shown on homepage)</span>
            </label>
          </div>
        </div>
        <ImageInput value={form.image} onChange={(v) => set("image", v)} />
      </div>
      {error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Item"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}

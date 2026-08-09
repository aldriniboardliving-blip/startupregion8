"use client";

import { useRef, useState } from "react";

interface ImageInputProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function ImageInput({
  label = "Image",
  value,
  onChange,
  required = false,
}: ImageInputProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function handleFile(file: File | undefined): Promise<void> {
    if (!file) return;
    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-start gap-4">
        <div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-slate-400">No image</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            className="input text-sm"
            placeholder="Paste image URL (e.g. res.cloudinary.com/... or /uploads/...)"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={required}
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn-secondary px-4 py-2 text-xs"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload image"}
            </button>
            {value && (
              <button
                type="button"
                className="text-xs font-medium text-red-600 hover:text-red-700"
                onClick={() => onChange("")}
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}

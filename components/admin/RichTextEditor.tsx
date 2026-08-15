"use client";

import { useRef, useState } from "react";
import { normalizeContentHtml } from "@/lib/content";

interface Tool {
  label: string;
  html: (s: string) => string;
  className: string;
}

const tools: Tool[] = [
  { label: "B", html: (s) => `<b>${s}</b>`, className: "font-bold" },
  { label: "I", html: (s) => `<i>${s}</i>`, className: "italic" },
  { label: "U", html: (s) => `<u>${s}</u>`, className: "underline" },
  { label: "H2", html: (s) => `\n\n<h2>${s}</h2>\n\n`, className: "font-bold" },
  { label: "H3", html: (s) => `\n\n<h3>${s}</h3>\n\n`, className: "font-bold" },
  { label: "¶", html: (s) => `\n\n<p>${s}</p>\n\n`, className: "" },
  { label: "• List", html: () => `\n<ul>\n  <li>Item</li>\n</ul>\n`, className: "" },
  { label: "1. List", html: () => `\n<ol>\n  <li>Item</li>\n</ol>\n`, className: "" },
  { label: "“”", html: () => `\n\n<blockquote>Quote</blockquote>\n\n`, className: "" },
  { label: "Link", html: () => `\n<a href="https://example.com">Link text</a>\n`, className: "" },
];

interface RichTextEditorProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  rows?: number;
  hint?: string;
}

export default function RichTextEditor({
  label = "Content",
  value,
  onChange,
  rows = 14,
  hint = "Supports basic HTML: <b>, <i>, <h2>, <h3>, <p>, <ul>, <ol>, <a>, <blockquote>",
}: RichTextEditorProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  function apply(htmlFn: (s: string) => string): void {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value?.slice(start, end) || "text";
    const insert = htmlFn(selected);
    const next = (value || "").slice(0, start) + insert + (value || "").slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + insert.length;
    });
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="label mb-0">{label}</label>
        <div className="flex rounded-lg bg-slate-100 p-0.5">
          {(["edit", "preview"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition ${
                mode === m
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {mode === "preview" ? (
        <div className="max-h-96 min-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-5">
          {value?.trim() ? (
            <div
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: normalizeContentHtml(value) }}
            />
          ) : (
            <p className="text-sm text-slate-400">Nothing to preview yet.</p>
          )}
        </div>
      ) : (
        <>
          <div className="mb-2 flex flex-wrap gap-1">
            {tools.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => apply(t.html)}
                className={`rounded border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 transition hover:border-brand-500 hover:text-brand-600 ${t.className}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <textarea
            ref={ref}
            className="input font-mono text-xs leading-relaxed"
            rows={rows}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </>
      )}
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

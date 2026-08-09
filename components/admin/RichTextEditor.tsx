"use client";

import { useRef } from "react";

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
      <label className="label">{label}</label>
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
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

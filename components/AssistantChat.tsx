"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AssistantReply } from "@/lib/assistant";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  items?: AssistantReply["items"];
  href?: string;
  suggestions?: AssistantReply["suggestions"];
}

const OPENERS = [
  "How many startups are there?",
  "Which startup has the most funding?",
  "Is there new funding?",
  "Startups in Leyte",
  "Who are the featured startups?",
];

function renderText(text: string): React.ReactNode {
  return text.split("\n").map((line, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {line}
    </span>
  ));
}

export default function AssistantChat() {
  const [open, setOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  function addMessage(m: ChatMessage): void {
    setMessages((prev) => [...prev, m]);
  }

  async function send(text: string): Promise<void> {
    const message = text.trim();
    if (!message || loading) return;
    setError("");
    addMessage({ role: "user", text: message });
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = (await res.json()) as Partial<AssistantReply> & { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to get an answer");
      addMessage({ role: "assistant", text: data.text || "", items: data.items, href: data.href, suggestions: data.suggestions });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    void send(input);
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition-transform hover:scale-105"
        aria-label="Open AI assistant"
      >
        {open ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[32rem] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 bg-brand-600 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Region 8 Assistant</p>
                <p className="text-xs text-white/70">Answers from this site’s live data</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white"
              aria-label="Close assistant"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
            {messages.length === 0 && (
              <div className="space-y-2">
                <div className="rounded-2xl rounded-tl-sm bg-white p-3 text-sm text-slate-700 shadow-sm">
                  Hi! Ask me about the startups, funding, news, or programs in Eastern Visayas.
                </div>
                <div className="pt-1">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Try asking</p>
                  <div className="flex flex-wrap gap-1.5">
                    {OPENERS.map((s) => (
                      <button
                        key={s}
                        onClick={() => void send(s)}
                        className="rounded-full border border-brand-200 bg-white px-3 py-1 text-xs text-brand-700 transition-colors hover:bg-brand-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                    m.role === "user"
                      ? "rounded-tr-sm bg-brand-600 text-white"
                      : "rounded-tl-sm bg-white text-slate-700"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="space-y-2">
                      <div className="whitespace-pre-line">{renderText(m.text)}</div>
                      {m.href && (
                        <Link
                          href={m.href}
                          className="inline-block rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700"
                        >
                          View startup →
                        </Link>
                      )}
                      {m.items && m.items.length > 0 && (
                        <ul className="space-y-1.5">
                          {m.items.map((it, idx) => (
                            <li key={idx} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                              {it.href ? (
                                <Link href={it.href} className="font-medium text-brand-700 hover:underline">
                                  {it.label}
                                </Link>
                              ) : (
                                <p className="font-medium text-slate-800">{it.label}</p>
                              )}
                              {(it.sub || it.value) && (
                                <p className="mt-0.5 text-xs text-slate-500">{it.sub || it.value}</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                      {m.suggestions && m.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {m.suggestions.map((s) => (
                            <button
                              key={s}
                              onClick={() => void send(s)}
                              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-700"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    renderText(m.text)
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {error && <p className="text-center text-xs text-red-600">{error}</p>}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-100 bg-white p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about startups, funding, news…"
              className="input flex-1"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary shrink-0 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

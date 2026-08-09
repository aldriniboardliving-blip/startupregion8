"use client";

import { useState } from "react";

interface EmptyStateNotifyProps {
  label: string;
}

export default function EmptyStateNotify({ label }: EmptyStateNotifyProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState("error");
      return;
    }
    setState("loading");
    window.setTimeout(() => {
      setState("success");
    }, 900);
  }

  return (
    <div className="mt-8 w-full max-w-sm">
      {state === "success" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          <p className="font-semibold">You're on the list!</p>
          <p className="mt-1 text-emerald-600">
            We'll notify you as soon as {label} content goes live.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Get notified when this section is updated
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setState("idle");
              }}
              placeholder="you@email.com"
              className="input"
              aria-label="Email address"
            />
            <button
              type="submit"
              disabled={state === "loading"}
              className="btn-primary shrink-0"
            >
              {state === "loading" ? "Subscribing…" : "Notify me"}
            </button>
          </div>
          {state === "error" && (
            <p className="mt-2 text-left text-xs text-red-600">
              Please enter a valid email address.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
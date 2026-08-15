"use client";

import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/Skeleton";

export interface LinkOption {
  group: string;
  label: string;
  value: string;
}

const CUSTOM = "__custom__";
const GROUP_ORDER = ["Site", "News articles", "Blog posts", "Government programs", "Startups"];

interface LinkPickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function LinkPicker({
  value,
  onChange,
  placeholder = "Select a destination…",
}: LinkPickerProps) {
  const [options, setOptions] = useState<LinkOption[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [selection, setSelection] = useState<string>("");

  const current = value || "";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/link-options");
        const data = (await res.json().catch(() => ({ items: [] }))) as {
          items?: LinkOption[];
        };
        if (!cancelled) {
          setOptions(data.items || []);
          setLoaded(true);
        }
      } catch {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (options.some((o) => o.value === current)) setSelection(current);
    else if (current) setSelection(CUSTOM);
    else setSelection("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, current]);

  const grouped = useMemo(() => {
    const map: Record<string, LinkOption[]> = {};
    for (const o of options) {
      (map[o.group] = map[o.group] || []).push(o);
    }
    return GROUP_ORDER.filter((g) => map[g] && map[g].length > 0).map((g) => ({
      group: g,
      items: map[g],
    }));
  }, [options]);

  const showCustom = selection === CUSTOM;

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>): void {
    const v = e.target.value;
    setSelection(v);
    if (v === CUSTOM) {
      return;
    }
    onChange(v);
  }

  return (
    <div className="space-y-2">
      {!loaded ? (
        <Skeleton className="h-11 w-full rounded-lg" />
      ) : (
        <>
          <select className="input" value={selection} onChange={handleSelect}>
            <option value="">— No link —</option>
            {grouped.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value={CUSTOM}>Custom URL / direct link…</option>
          </select>
          {showCustom && (
            <input
              className="input"
              value={current}
              onChange={(e) => onChange(e.target.value)}
              placeholder="e.g. https://example.com or /news/my-post"
              autoComplete="off"
            />
          )}
        </>
      )}
    </div>
  );
}
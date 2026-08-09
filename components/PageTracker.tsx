"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const TRACK_URL = "/api/track";

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("sr8_visitor_id");
  if (!id) {
    id =
      (crypto.randomUUID && crypto.randomUUID()) ||
      `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("sr8_visitor_id", id);
  }
  return id;
}

function sendVisit(path: string, durationMs: number): void {
  if (!path || durationMs < 500) return;
  const payload = JSON.stringify({
    visitorId: getVisitorId(),
    path,
    durationMs,
  });
  const blob = new Blob([payload], { type: "application/json" });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(TRACK_URL, blob);
  } else {
    fetch(TRACK_URL, {
      method: "POST",
      body: blob,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  }
}

export default function PageTracker() {
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const startRef = useRef(Date.now());

  // On route change, record time spent on the previous page.
  useEffect(() => {
    const prevPath = pathRef.current;
    const prevStart = startRef.current;
    if (prevPath !== pathname) {
      sendVisit(prevPath, Date.now() - prevStart);
      pathRef.current = pathname;
      startRef.current = Date.now();
    }
  }, [pathname]);

  // On leave/hide, record time on the current page.
  useEffect(() => {
    const flush = () => {
      sendVisit(pathRef.current, Date.now() - startRef.current);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

interface AdminRow {
  _id: string;
  title?: string;
  companyName?: string;
  [key: string]: any;
}

interface AdminTableProps {
  apiUrl: string;
  createUrl: string;
  createLabel?: string;
  columns: { key: string; header: string }[];
  renderRow: (row: AdminRow) => ReactNode[];
  emptyText?: string;
}

export default function AdminTable({
  apiUrl,
  createUrl,
  createLabel = "Add New",
  columns,
  renderRow,
  emptyText = "No items yet.",
}: AdminTableProps) {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  async function load(): Promise<void> {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Failed to load");
      const data = (await res.json()) as AdminRow[];
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  async function handleDelete(row: AdminRow): Promise<void> {
    const label = row.title || row.companyName || "this item";
    if (!confirm(`Are you sure you want to delete "${label}"?`)) {
      return;
    }
    setDeleting(row._id);
    try {
      const res = await fetch(`${apiUrl}?id=${row._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setRows((r) => r.filter((x) => x._id !== row._id));
      setPage(1);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{columns[0]?.header || "Items"}</h1>
          <p className="mt-1 text-sm text-slate-500">{rows.length} record(s)</p>
        </div>
        <Link href={createUrl} className="btn-primary">
          + {createLabel}
        </Link>
      </div>

      {loading ? (
        <div className="card h-48 animate-pulse bg-slate-100" />
      ) : error ? (
        <p className="rounded-xl bg-red-50 p-6 text-sm text-red-600">{error}</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl bg-slate-100 p-8 text-center text-sm text-slate-500">
          {emptyText}
        </p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                {columns.map((c) => (
                  <th key={c.key} className="px-5 py-3 font-semibold">
                    {c.header}
                  </th>
                ))}
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageRows.map((row) => (
                <tr key={row._id} className="hover:bg-slate-50">
                  {renderRow(row).map((cell, i) => (
                    <td key={i} className="px-5 py-4 text-slate-700">
                      {cell}
                    </td>
                  ))}
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`${createUrl.replace(/\/new$/, "")}/${row._id}/edit`}
                        className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(row)}
                        disabled={deleting === row._id}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        {deleting === row._id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > pageSize && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Showing {Math.min(pageSize, rows.length)} of {rows.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

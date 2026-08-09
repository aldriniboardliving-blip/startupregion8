"use client";

import AdminTable from "@/components/admin/AdminTable";
import ImageWithFallback from "@/components/ImageWithFallback";
import { formatDate } from "@/lib/utils";

export default function AdminNewsPage() {
  return (
    <AdminTable
      apiUrl="/api/news"
      createUrl="/admin/news/new"
      createLabel="Add News"
      columns={[
        { key: "image", header: "" },
        { key: "title", header: "Title" },
        { key: "category", header: "Category" },
        { key: "published", header: "Status" },
        { key: "createdAt", header: "Created" },
      ]}
      renderRow={(row) => [
        <ImageWithFallback
          key="img"
          src={row.image}
          fallback="/images/card-placeholder.svg"
          alt={row.title}
          className="h-10 w-16 rounded-lg object-cover"
        />,
        <span key="t" className="font-medium text-slate-900">{row.title}</span>,
        <span key="c">{row.category || "—"}</span>,
        <span
          key="s"
          className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
            row.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
          }`}
        >
          {row.published ? "Published" : "Draft"}
        </span>,
        <span key="d" className="text-slate-400">{formatDate(row.createdAt)}</span>,
      ]}
      emptyText="No news yet. Create your first news article."
    />
  );
}

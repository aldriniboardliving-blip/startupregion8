"use client";

import AdminTable from "@/components/admin/AdminTable";
import ImageWithFallback from "@/components/ImageWithFallback";
import { formatDate } from "@/lib/utils";

export default function AdminBlogsPage() {
  return (
    <AdminTable
      apiUrl="/api/blogs"
      createUrl="/admin/blogs/new"
      createLabel="Add Blog"
      columns={[
        { key: "image", header: "" },
        { key: "title", header: "Title" },
        { key: "author", header: "Author" },
        { key: "flags", header: "Flags" },
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
        <span key="a">{row.author || "—"}</span>,
        <span key="f" className="flex gap-1">
          {row.featured && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              Featured
            </span>
          )}
          {row.published ? (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              Live
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
              Draft
            </span>
          )}
        </span>,
        <span key="d" className="text-slate-400">{formatDate(row.createdAt)}</span>,
      ]}
      emptyText="No blog posts yet. Write your first post."
    />
  );
}

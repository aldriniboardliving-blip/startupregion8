"use client";

import AdminTable from "@/components/admin/AdminTable";
import ImageWithFallback from "@/components/ImageWithFallback";
import { formatDate } from "@/lib/utils";

export default function AdminCarouselPage() {
  return (
    <AdminTable
      apiUrl="/api/carousel"
      createUrl="/admin/carousel/new"
      createLabel="Add Item"
      columns={[
        { key: "image", header: "" },
        { key: "title", header: "Title" },
        { key: "subtitle", header: "Badge" },
        { key: "active", header: "Status" },
        { key: "createdAt", header: "Created" },
      ]}
      renderRow={(row) => [
        <ImageWithFallback
          key="img"
          src={row.image}
          fallback="/images/hero-placeholder.svg"
          alt={row.title}
          className="h-10 w-16 rounded-lg object-cover"
        />,
        <span key="t" className="font-medium text-slate-900">{row.title}</span>,
        <span key="s">{row.subtitle || "—"}</span>,
        <span
          key="a"
          className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
            row.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
          }`}
        >
          {row.active ? "Active" : "Hidden"}
        </span>,
        <span key="d" className="text-slate-400">{formatDate(row.createdAt)}</span>,
      ]}
      emptyText="No carousel items yet. Add a current event to display on the homepage."
    />
  );
}

"use client";

import AdminTable from "@/components/admin/AdminTable";
import ImageWithFallback from "@/components/ImageWithFallback";
import { formatDate } from "@/lib/utils";

export default function AdminGovernmentPage() {
  return (
    <AdminTable
      apiUrl="/api/government"
      createUrl="/admin/government/new"
      createLabel="Add Page"
      columns={[
        { key: "image", header: "" },
        { key: "title", header: "Title" },
        { key: "slug", header: "Slug" },
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
        <span key="s" className="text-slate-500">/{row.slug}</span>,
        <span key="d" className="text-slate-400">{formatDate(row.createdAt)}</span>,
      ]}
      emptyText="No government pages yet. Add a program or initiative."
    />
  );
}

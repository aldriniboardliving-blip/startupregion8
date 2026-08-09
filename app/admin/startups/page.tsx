"use client";

import AdminTable from "@/components/admin/AdminTable";
import ImageWithFallback from "@/components/ImageWithFallback";
import { formatDate } from "@/lib/utils";

export default function AdminStartupsPage() {
  return (
    <AdminTable
      apiUrl="/api/startups"
      createUrl="/admin/startups/new"
      createLabel="Add Startup"
      columns={[
        { key: "logo", header: "" },
        { key: "companyName", header: "Company" },
        { key: "province", header: "Province" },
        { key: "employeeRange", header: "Size" },
        { key: "featured", header: "Status" },
        { key: "createdAt", header: "Added" },
      ]}
      renderRow={(row) => [
        <ImageWithFallback
          key="img"
          src={row.logo}
          fallback="/images/startup-placeholder.svg"
          alt={row.companyName}
          className="h-10 w-10 rounded-lg object-cover"
        />,
        <div key="c">
          <p className="font-medium text-slate-900">{row.companyName}</p>
          {row.productName && <p className="text-xs text-slate-400">{row.productName}</p>}
        </div>,
        <span key="p">{row.province || "—"}</span>,
        <span key="e">{row.employeeRange || "—"}</span>,
        <span key="f" className="flex flex-wrap gap-1">
          {row.featured && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              Featured
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              row.status === "active"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {row.status}
          </span>
        </span>,
        <span key="d" className="text-slate-400">{formatDate(row.createdAt)}</span>,
      ]}
      emptyText="No startups yet. Add your first startup."
    />
  );
}

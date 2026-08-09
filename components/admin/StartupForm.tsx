"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageInput from "@/components/admin/ImageInput";
import LocationPicker from "@/components/LocationPicker";
import { normalizeProvince, PROVINCES } from "@/lib/utils";
import type { Startup, Founder, FundingInput } from "@/lib/types";

const EMPLOYEE_RANGES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

interface StartupFormProps {
  initial?: Startup;
}

interface StartupFormState {
  companyName: string;
  productName: string;
  dateFounded: string;
  address: string;
  lat: number | string;
  lng: number | string;
  website: string;
  employeeRange: string;
  description: string;
  province: string;
  logo: string;
  featured: boolean;
  status: "active" | "inactive";
}

interface FundingDraft {
  name: string;
  from: string;
  amount: string;
  link: string;
  dateAwarded: string;
}

export default function StartupForm({ initial }: StartupFormProps) {
  const router = useRouter();
  const isEdit = !!initial;
  const [form, setForm] = useState<StartupFormState>({
    companyName: initial?.companyName || "",
    productName: initial?.productName || "",
    dateFounded: initial?.dateFounded || "",
    address: initial?.address || "",
    lat: initial?.lat || "",
    lng: initial?.lng || "",
    website: initial?.website || "",
    employeeRange: initial?.employeeRange || "",
    description: initial?.description || "",
    province: initial?.province || "",
    logo: initial?.logo || "",
    featured: initial ? !!initial.featured : false,
    status: initial?.status || "active",
  });
  const [founders, setFounders] = useState<Founder[]>(
    initial?.founders?.length
      ? initial.founders.map((f) => ({ name: f.name, position: f.position }))
      : [{ name: "", position: "" }]
  );
  const [fundings, setFundings] = useState<FundingDraft[]>(
    initial?.fundings?.length
      ? initial.fundings.map((f) => ({
          name: f.name,
          from: f.from,
          amount: f.amount ? String(f.amount) : "",
          link: f.link,
          dateAwarded: f.dateAwarded || "",
        }))
      : []
  );
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  function set<K extends keyof StartupFormState>(key: K, value: StartupFormState[K]): void {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateFounder(i: number, key: keyof Founder, value: string): void {
    setFounders((arr) => arr.map((f, idx) => (idx === i ? { ...f, [key]: value } : f)));
  }

  function addFounder(): void {
    setFounders((arr) => [...arr, { name: "", position: "" }]);
  }

  function removeFounder(i: number): void {
    setFounders((arr) => arr.filter((_, idx) => idx !== i));
  }

  function updateFunding(i: number, key: keyof FundingDraft, value: string): void {
    setFundings((arr) => arr.map((f, idx) => (idx === i ? { ...f, [key]: value } : f)));
  }

  function addFunding(): void {
    setFundings((arr) => [...arr, { name: "", from: "", amount: "", link: "", dateAwarded: "" }]);
  }

  function removeFunding(i: number): void {
    setFundings((arr) => arr.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const fundingPayload: FundingInput[] = fundings
        .filter((f) => f.name.trim())
        .map((f) => ({
          name: f.name.trim(),
          from: f.from.trim(),
          amount: Number(f.amount) || 0,
          link: f.link.trim(),
          dateAwarded: f.dateAwarded || null,
        }));
      const url = isEdit ? `/api/startups/${initial?._id}` : "/api/startups";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, founders, fundings: fundingPayload }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed");
      router.push("/admin/startups");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">
        {isEdit ? `Edit ${initial?.companyName}` : "Add Startup"}
      </h1>

      <div className="card space-y-5 p-6">
        <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Company Name *</label>
            <input
              className="input"
              value={form.companyName}
              onChange={(e) => set("companyName", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Product Name</label>
            <input
              className="input"
              value={form.productName}
              onChange={(e) => set("productName", e.target.value)}
              placeholder="Main product or service"
            />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="label">Date Founded</label>
            <input
              type="date"
              className="input"
              value={form.dateFounded}
              onChange={(e) => set("dateFounded", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Website</label>
            <input
              className="input"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="label">Employee Range</label>
            <select
              className="input"
              value={form.employeeRange}
              onChange={(e) => set("employeeRange", e.target.value)}
            >
              <option value="">Select range</option>
              {EMPLOYEE_RANGES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input"
            rows={5}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Tell us about the startup, its product, and its mission..."
          />
        </div>
        <ImageInput label="Logo / Cover Image" value={form.logo} onChange={(v) => set("logo", v)} />
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-600">Feature on homepage</span>
          </label>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => set("status", e.target.value as "active" | "inactive")}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card space-y-5 p-6">
        <h2 className="text-lg font-bold text-slate-900">Location</h2>
        <LocationPicker
          value={{
            address: form.address,
            lat: form.lat ? Number(form.lat) : undefined,
            lng: form.lng ? Number(form.lng) : undefined,
          }}
          onChange={(loc) => {
            set("address", loc.address);
            set("lat", loc.lat);
            set("lng", loc.lng);
            const prov = normalizeProvince(loc.address);
            if (prov) set("province", prov);
          }}
        />
        <div>
          <label className="label">Province</label>
          <select
            className="input"
            value={form.province}
            onChange={(e) => set("province", e.target.value)}
            required
          >
            <option value="">Select province</option>
            {form.province && !PROVINCES.some((p) => p.name === form.province) && (
              <option value={form.province}>{form.province}</option>
            )}
            {PROVINCES.map((p) => (
              <option key={p.slug} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Founders{" "}
            <span className="text-sm font-normal text-slate-400">
              (name & position — add as many as needed)
            </span>
          </h2>
          <button type="button" className="btn-secondary px-4 py-2 text-xs" onClick={addFounder}>
            + Add Founder
          </button>
        </div>
        {founders.map((f, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center"
          >
            <div className="flex-1">
              <label className="label">Founder Name</label>
              <input
                className="input"
                value={f.name}
                onChange={(e) => updateFounder(i, "name", e.target.value)}
                placeholder="e.g. Maria Santos"
              />
            </div>
            <div className="flex-1">
              <label className="label">Position</label>
              <input
                className="input"
                value={f.position}
                onChange={(e) => updateFounder(i, "position", e.target.value)}
                placeholder="e.g. CEO, Co-founder, CTO"
              />
            </div>
            <button
              type="button"
              onClick={() => removeFounder(i)}
              className="btn-danger mt-1 px-3 py-2 text-xs sm:mt-5"
              disabled={founders.length === 1}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="card space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Fundings &amp; Awards{" "}
            <span className="text-sm font-normal text-slate-400">
              (grants, awards, investments received — add as many as needed)
            </span>
          </h2>
          <button type="button" className="btn-secondary px-4 py-2 text-xs" onClick={addFunding}>
            + Add Funding
          </button>
        </div>
        {fundings.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            No fundings recorded yet.
          </p>
        ) : (
          fundings.map((f, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl bg-slate-50 p-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Award / Funding Name *</label>
                  <input
                    className="input"
                    value={f.name}
                    onChange={(e) => updateFunding(i, "name", e.target.value)}
                    placeholder="e.g. DTI Innovation Grant, Startup Summit 2026 Winner"
                  />
                </div>
                <div>
                  <label className="label">From</label>
                  <input
                    className="input"
                    value={f.from}
                    onChange={(e) => updateFunding(i, "from", e.target.value)}
                    placeholder="e.g. DTI Region 8, DOST, private investor"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="label">Amount (₱)</label>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={f.amount}
                    onChange={(e) => updateFunding(i, "amount", e.target.value)}
                    placeholder="e.g. 500000"
                  />
                </div>
                <div>
                  <label className="label">Date Awarded</label>
                  <input
                    type="date"
                    className="input"
                    value={f.dateAwarded}
                    onChange={(e) => updateFunding(i, "dateAwarded", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="label">Link</label>
                  <input
                    className="input"
                    value={f.link}
                    onChange={(e) => updateFunding(i, "link", e.target.value)}
                    placeholder="https://... (post / full details)"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeFunding(i)}
                  className="btn-danger px-3 py-2 text-xs"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Startup"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}

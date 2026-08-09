import { NextResponse } from "next/server";
import { getDb, collections } from "@/lib/mongodb";
import { isAuthed } from "@/lib/auth";
import { toId, modifyResult } from "@/lib/crud";
import { toPublicItem } from "@/lib/utils";
import type { ContentDoc } from "@/lib/types";

interface CarouselBody {
  _id?: string;
  id?: string;
  title?: string;
  subtitle?: string;
  image?: string;
  link?: string;
  active?: boolean;
  sortOrder?: number | string;
}

export async function GET(): Promise<NextResponse> {
  const db = await getDb();
  const items = (await db
    .collection(collections.carousel)
    .find({ active: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .toArray()) as ContentDoc[];
  return NextResponse.json(items.map((i) => toPublicItem(i)));
}

export async function POST(req: Request): Promise<NextResponse> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: CarouselBody;
  try {
    body = (await req.json()) as CarouselBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const title = (body.title || "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  const db = await getDb();
  const now = new Date().toISOString();
  const doc = {
    title,
    subtitle: (body.subtitle || "").trim(),
    image: body.image || "",
    link: (body.link || "").trim(),
    active: body.active !== false,
    sortOrder: parseInt(String(body.sortOrder ?? "0"), 10) || 0,
    createdAt: now,
    updatedAt: now,
  };
  const { insertedId } = await db.collection(collections.carousel).insertOne(doc);
  return NextResponse.json(toPublicItem({ ...doc, _id: insertedId }), { status: 201 });
}

export async function PUT(req: Request): Promise<NextResponse> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: CarouselBody;
  try {
    body = (await req.json()) as CarouselBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const id = toId(body._id || body.id || "");
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const db = await getDb();
  const title = (body.title || "").trim();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  const doc = {
    title,
    subtitle: (body.subtitle || "").trim(),
    image: body.image || "",
    link: (body.link || "").trim(),
    active: body.active !== false,
    sortOrder: parseInt(String(body.sortOrder ?? "0"), 10) || 0,
    updatedAt: new Date().toISOString(),
  };
  const res = await db
    .collection(collections.carousel)
    .findOneAndUpdate({ _id: id }, { $set: doc }, { returnDocument: "after" });
  const updated = modifyResult<ContentDoc>(res);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toPublicItem(updated));
}

export async function DELETE(req: Request): Promise<NextResponse> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = toId(searchParams.get("id") || "");
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const db = await getDb();
  const res = await db.collection(collections.carousel).deleteOne({ _id: id });
  if (!res.deletedCount) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

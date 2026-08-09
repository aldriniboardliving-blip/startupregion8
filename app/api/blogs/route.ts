import { NextResponse } from "next/server";
import { getDb, collections } from "@/lib/mongodb";
import { isAuthed } from "@/lib/auth";
import { uniqueSlug, toId, modifyResult } from "@/lib/crud";
import { toPublicItem } from "@/lib/utils";
import type { ContentDoc } from "@/lib/types";

interface BlogBody {
  _id?: string;
  id?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  image?: string;
  author?: string;
  featured?: boolean;
  published?: boolean;
}

function toDoc(body: BlogBody) {
  return {
    title: (body.title || "").trim(),
    excerpt: (body.excerpt || "").trim(),
    content: body.content || "",
    image: body.image || "",
    author: (body.author || "").trim(),
    featured: !!body.featured,
    published: body.published !== false,
  };
}

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "0", 10);
  const featured = searchParams.get("featured");
  const db = await getDb();
  const query: Record<string, unknown> = {};
  if (featured === "true") query.featured = true;
  let cursor = db.collection(collections.blogs).find(query).sort({ createdAt: -1 });
  if (limit) cursor = cursor.limit(limit);
  const items = (await cursor.toArray()) as ContentDoc[];
  return NextResponse.json(items.map((i) => toPublicItem(i)));
}

export async function POST(req: Request): Promise<NextResponse> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: BlogBody;
  try {
    body = (await req.json()) as BlogBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const title = (body.title || "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  const db = await getDb();
  const slug = await uniqueSlug(db, collections.blogs, title);
  const now = new Date().toISOString();
  const doc = { ...toDoc(body), slug, createdAt: now, updatedAt: now };
  const { insertedId } = await db.collection(collections.blogs).insertOne(doc);
  return NextResponse.json(toPublicItem({ ...doc, _id: insertedId }), { status: 201 });
}

export async function PUT(req: Request): Promise<NextResponse> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: BlogBody;
  try {
    body = (await req.json()) as BlogBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const id = toId(body._id || body.id || "");
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const db = await getDb();
  const title = (body.title || "").trim();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  const slug = await uniqueSlug(db, collections.blogs, title, id);
  const doc = { ...toDoc(body), slug, updatedAt: new Date().toISOString() };
  const res = await db
    .collection(collections.blogs)
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
  const res = await db.collection(collections.blogs).deleteOne({ _id: id });
  if (!res.deletedCount) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

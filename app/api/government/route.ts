import { NextResponse } from "next/server";
import { getDb, collections } from "@/lib/mongodb";
import { isAuthed } from "@/lib/auth";
import { uniqueSlug, toId, modifyResult } from "@/lib/crud";
import { toPublicItem } from "@/lib/utils";
import type { ContentDoc } from "@/lib/types";

interface GovernmentBody {
  _id?: string;
  id?: string;
  title?: string;
  content?: string;
  image?: string;
}

export async function GET(): Promise<NextResponse> {
  const db = await getDb();
  const items = (await db
    .collection(collections.government)
    .find()
    .sort({ createdAt: -1 })
    .toArray()) as ContentDoc[];
  return NextResponse.json(items.map((i) => toPublicItem(i)));
}

export async function POST(req: Request): Promise<NextResponse> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: GovernmentBody;
  try {
    body = (await req.json()) as GovernmentBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const title = (body.title || "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  const db = await getDb();
  const slug = await uniqueSlug(db, collections.government, title);
  const now = new Date().toISOString();
  const doc = {
    title,
    slug,
    content: body.content || "",
    image: body.image || "",
    createdAt: now,
    updatedAt: now,
  };
  const { insertedId } = await db.collection(collections.government).insertOne(doc);
  return NextResponse.json(toPublicItem({ ...doc, _id: insertedId }), { status: 201 });
}

export async function PUT(req: Request): Promise<NextResponse> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: GovernmentBody;
  try {
    body = (await req.json()) as GovernmentBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const id = toId(body._id || body.id || "");
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const db = await getDb();
  const title = (body.title || "").trim();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  const slug = await uniqueSlug(db, collections.government, title, id);
  const doc = {
    title,
    slug,
    content: body.content || "",
    image: body.image || "",
    updatedAt: new Date().toISOString(),
  };
  const res = await db
    .collection(collections.government)
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
  const res = await db.collection(collections.government).deleteOne({ _id: id });
  if (!res.deletedCount) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

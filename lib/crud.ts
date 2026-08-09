import { Db, ObjectId } from "mongodb";
import { slugify } from "@/lib/utils";

export async function uniqueSlug(
  db: Db,
  coll: string,
  title: string,
  ignoreId?: ObjectId
): Promise<string> {
  const base = slugify(title) || "post";
  let slug = base;
  let n = 2;
  for (;;) {
    const q: Record<string, unknown> = { slug };
    if (ignoreId) q._id = { $ne: ignoreId };
    const existing = await db.collection(coll).findOne(q);
    if (!existing) return slug;
    slug = `${base}-${n++}`;
  }
}

export function toId(id: string): ObjectId | null {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export function modifyResult<T>(res: unknown): T | null {
  if (!res) return null;
  if (typeof res === "object" && "value" in res) {
    const val = (res as { value?: T }).value;
    return val ?? null;
  }
  return res as T;
}

export function requireFields(body: Record<string, unknown>, fields: string[]): string | null {
  for (const f of fields) {
    const v = body[f];
    if (!v || !String(v).trim()) {
      return `"${f}" is required`;
    }
  }
  return null;
}

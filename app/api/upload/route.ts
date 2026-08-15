import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { isAuthed } from "@/lib/auth";
import { randomBytes } from "crypto";
import { cloudinaryConfigured, uploadImageBuffer } from "@/lib/cloudinary";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<NextResponse> {
  const limited = withRateLimit(req, RATE_LIMITS.upload);
  if (limited) return limited;

  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  const fileObj = file as File;

  const ext = path.extname(fileObj.name).toLowerCase().replace(/[^a-z0-9.]/g, "");
  const allowed = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];
  if (!allowed.includes(ext)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (fileObj.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const buf = Buffer.from(await fileObj.arrayBuffer());

  if (cloudinaryConfigured) {
    const publicId = `${Date.now()}-${randomBytes(6).toString("hex")}`;
    try {
      const url = await uploadImageBuffer(buf, publicId);
      return NextResponse.json({ url });
    } catch {
      return NextResponse.json(
        { error: "Upload to Cloudinary failed" },
        { status: 500 }
      );
    }
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
  await writeFile(path.join(dir, filename), buf);

  return NextResponse.json({ url: `/uploads/${filename}` });
}

import { NextResponse } from "next/server";
import { createSession, isAuthed } from "@/lib/auth";

interface LoginBody {
  username?: string;
  password?: string;
}

export async function POST(req: Request): Promise<NextResponse> {
  if (await isAuthed()) {
    return NextResponse.json({ ok: true, message: "Already signed in" });
  }
  let body: LoginBody;
  try {
    body = (await req.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const username = (body.username || "").trim();
  const password = body.password || "";

  const adminUser = process.env.ADMIN_USERNAME || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "";

  if (username === adminUser && password === adminPass) {
    await createSession();
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}

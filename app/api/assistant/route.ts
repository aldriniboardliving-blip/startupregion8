import { NextResponse } from "next/server";
import { answerQuestion } from "@/lib/assistant";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<NextResponse> {
  const limited = withRateLimit(req, RATE_LIMITS.assistant);
  if (limited) return limited;

  let body: { message?: string };
  try {
    body = (await req.json()) as { message?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const message = (body.message || "").trim();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  if (message.length > 500) {
    return NextResponse.json({ error: "Message is too long" }, { status: 400 });
  }

  try {
    const reply = await answerQuestion(message);
    return NextResponse.json(reply);
  } catch (e) {
    console.error("Assistant error:", e);
    return NextResponse.json(
      {
        error: "Something went wrong while looking that up. Please try again.",
        text: "I hit a snag while checking the database — try again in a moment.",
      },
      { status: 500 }
    );
  }
}

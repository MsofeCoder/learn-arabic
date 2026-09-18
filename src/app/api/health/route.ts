import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Liveness probe. Never exposes configuration values or stack traces. */
export function GET() {
  return NextResponse.json({ ok: true, service: "lisanflow" });
}

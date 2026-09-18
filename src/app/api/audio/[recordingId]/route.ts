import { createReadStream, promises as fs } from "node:fs";
import { Readable } from "node:stream";
import type { NextRequest } from "next/server";
import { RECORDINGS_BY_ID } from "@/data/seed/recordings";
import { localRecordingPath } from "@/lib/audio/source";
import { parseRange } from "@/lib/audio/range";

/**
 * Local-mode audio streaming. Serves only recordings listed in the checked-in
 * manifest, by id — never an arbitrary path. In production audio comes from
 * Supabase Storage and this route simply 404s (the files are not deployed).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ recordingId: string }> },
) {
  const { recordingId } = await params;
  const recording = RECORDINGS_BY_ID.get(recordingId);
  if (!recording) return new Response("Not found", { status: 404 });

  const filePath = localRecordingPath(recording);
  let size: number;
  try {
    size = (await fs.stat(filePath)).size;
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const baseHeaders = {
    "Content-Type": "audio/mpeg",
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=3600",
  };

  const result = parseRange(request.headers.get("range"), size);

  if (result.kind === "unsatisfiable") {
    return new Response(null, {
      status: 416,
      headers: { ...baseHeaders, "Content-Range": `bytes */${size}` },
    });
  }

  if (result.kind === "full") {
    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
    return new Response(stream, {
      status: 200,
      headers: { ...baseHeaders, "Content-Length": String(size) },
    });
  }

  const { start, end } = result.range;
  const stream = Readable.toWeb(
    createReadStream(filePath, { start, end }),
  ) as ReadableStream;

  return new Response(stream, {
    status: 206,
    headers: {
      ...baseHeaders,
      "Content-Length": String(end - start + 1),
      "Content-Range": `bytes ${start}-${end}/${size}`,
    },
  });
}

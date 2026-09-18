#!/usr/bin/env node
/**
 * Uploads the lecture recordings to the Supabase Storage `lesson-audio` bucket.
 *
 * Operator-only. Needs the service-role key, which must never be exposed to the
 * browser — pass it through the environment for this one command:
 *
 *   SUPABASE_URL=https://<ref>.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/upload-audio.mjs
 *
 * Idempotent: objects already present with the same size are skipped.
 * Imports the manifest from src/data/seed/recordings.ts (Node strips the types)
 * so storage keys can never drift from what the app requests.
 */
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { RECORDINGS } from "../src/data/seed/recordings.ts";

const BUCKET = "lesson-audio";
const AUDIO_DIR =
  process.env.LISANFLOW_AUDIO_DIR ?? path.join(process.cwd(), "sample-duroos-audios");

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const existing = new Map();
for (const folder of new Set(RECORDINGS.map((r) => r.storageKey.split("/")[0]))) {
  const { data } = await supabase.storage.from(BUCKET).list(folder, { limit: 100 });
  for (const obj of data ?? []) existing.set(`${folder}/${obj.name}`, obj.metadata?.size);
}

const manifest = RECORDINGS.map((r) => [r.storageKey, r.localFile]);
console.log(`Uploading ${manifest.length} recordings to ${BUCKET}…`);

let failed = 0;
for (const [storageKey, localFile] of manifest) {
  const filePath = path.join(AUDIO_DIR, localFile);
  const size = statSync(filePath).size;
  if (existing.get(storageKey) === size) {
    console.log(`  skip  ${storageKey} (already uploaded)`);
    continue;
  }
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storageKey, readFileSync(filePath), {
      contentType: "audio/mpeg",
      cacheControl: "31536000",
      upsert: true,
    });
  if (error) {
    failed += 1;
    console.error(`  FAIL  ${storageKey}: ${error.message}`);
  } else {
    console.log(`  ok    ${storageKey} (${(size / 1048576).toFixed(1)} MiB)`);
  }
}

console.log(
  failed === 0
    ? `Done. Set NEXT_PUBLIC_LESSON_AUDIO_BASE=${url}/storage/v1/object/public/${BUCKET}`
    : `${failed} upload(s) failed.`,
);
process.exit(failed === 0 ? 0 : 1);

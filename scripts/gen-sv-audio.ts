// Generates Swedish pronunciation clips for the Polish → Swedish course using
// the macOS "Alva" (sv_SE) voice, encoded to mp3 with ffmpeg. Files land in
// public/audio/sv/<slug>.mp3 and are referenced by the seed (see slugify in
// scripts/prod.ts — the two MUST stay in sync). Run: bun scripts/gen-sv-audio.ts
// (macOS only; requires `ffmpeg` on PATH).
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL);

// MUST match slugify() in scripts/prod.ts.
const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const main = async () => {
  const rows = await sql`
    select distinct co.text as text
    from courses c
    join units u on u.course_id = c.id
    join lessons l on l.unit_id = u.id
    join challenges ch on ch.lesson_id = l.id
    join challenge_options co on co.challenge_id = ch.id
    where c.title = 'Polish → Swedish'
      and ch.type in ('SELECT', 'ASSIST', 'TYPE')
      and co.correct = true`;

  mkdirSync("public/audio/sv", { recursive: true });
  const tmp = `${process.env.TMPDIR ?? "/tmp"}/_tts.aiff`;

  let done = 0;
  for (const row of rows) {
    const text = (row.text as string).trim();
    const name = slugify(text);
    if (!name) continue;

    execFileSync("say", ["-v", "Alva", text, "-o", tmp]);
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-i",
        tmp,
        "-codec:a",
        "libmp3lame",
        "-qscale:a",
        "6",
        `public/audio/sv/${name}.mp3`,
      ],
      { stdio: "ignore" }
    );
    done++;
  }

  console.log(`Generated ${done} Swedish audio clips in public/audio/sv/`);
};

void main();

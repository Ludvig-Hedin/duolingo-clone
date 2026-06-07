# Polish → Swedish: richer lessons & new exercise types — design

**Date:** 2026-06-08
**Focus:** the `Polish → Swedish` course (a Polish speaker learning Swedish).
**Goal:** make the course genuinely useful for learning Swedish — faster,
more joyful, lower churn — by adding new exercise types beyond multiple choice.

## Research basis (why)

Common reasons learners churn from Duolingo-style apps:

1. **No grammar explanations** — sentences feel random; memorized, not understood.
2. **Only multiple-choice / translation** — no production, shallow, repetitive.
3. **Streak/XP motivation collapses** once broken.
4. **Goal mismatch.**

What works: spaced repetition, listening + speaking, grammar in context, varied
exercises. Swedish-specific hard parts: **en/ett gender**, **V2 word order**,
**å/ä/ö vowels + stress/length**.

Sources: my-senpai.com (why people quit Duolingo), autolingual.com review,
lingopie/taalhammer (SRS), storylearning.com & swedishpod101.com (Swedish).

## Architecture (the spine, used by every phase)

A single extensible challenge-type system:

- `challenges.type` is a pg enum. Each phase widens it with new values.
- The lesson screen (`app/lesson/quiz.tsx`) delegates rendering by `type`:
  each exercise type has its own component. New type = new renderer + a seed
  data shape. Existing `SELECT`/`ASSIST` are unchanged.
- Exercise content lives in the seed (`scripts/prod.ts`) as data, not code.
- UI chrome strings come from the i18n context (`@/lib/i18n/context`, owned by a
  parallel agent). **Exercise content is course data, not i18n keys** — so it
  does not touch the i18n dictionaries. New renderers are new files; edits to
  shared files (`quiz.tsx`) are kept to a single additive branch to avoid
  colliding with the i18n work.

## Phased plan

- **Phase 1 (this spec):** type framework + `TIP` grammar cards, reseed PL→SE.
- **Phase 2:** `TYPE` (lenient free-text), `MATCH` (pairs), `BUILD` (word-bank, V2).
- **Phase 3:** TTS audio pipeline → Swedish `.mp3` + `LISTEN` exercises.
- **Phase 4:** spaced repetition (review state on `challenge_progress`,
  due-first Practice).

---

## Phase 1 — Grammar tips

### Schema (`db/schema.ts`)
Add `"TIP"` to `challengesEnum` → `["SELECT", "ASSIST", "TIP"]`. No new tables
or columns: a TIP stores its explanation in the existing `question` text column
and has **no** `challengeOptions`. Migration: `bun run db:push`
(`ALTER TYPE "type" ADD VALUE 'TIP'`).

### Seed (`scripts/prod.ts`)
- `SeedLesson` gains `tip?: string` (Polish explanation; Swedish examples in
  straight double quotes so the renderer can highlight them).
- `buildLessonChallenges`: when `tip` is set, prepend a `TIP` challenge at
  order 1 (no options); existing SELECT/ASSIST follow.
- One themed tip on the **first lesson of each PL→SE unit** (7 tips). Each tip:
  Polish explanation + highlighted Swedish examples.
  1. Phrases → å/ä/ö vowels, first-syllable stress, "hej".
  2. Introductions → V2 word order (verb second).
  3. Numbers → one = "ett"; gender preview.
  4. People → en/ett gender, learn noun + article ("en man", "ett barn").
  5. Food → mass nouns drop article ("vatten", "kaffe").
  6. Verbs → present tense one form for all persons; V2.
  7. Sentences → question word order.

### Lesson UI
- New `app/lesson/tip-card.tsx`: green-themed card, lightbulb icon, renders the
  explanation with quoted Swedish segments highlighted (bold/green). Pure
  presentational; takes the tip text as a prop.
- `app/lesson/quiz.tsx`: one additive branch — when `challenge.type === "TIP"`,
  render `<TipCard>` instead of the question + options grid, and show a single
  **Continue** button (reuse `t.lesson.continue`). On continue:
  `upsertChallengeProgress(challenge.id)` to mark it complete, then `onNext()`
  and bump percentage. **No hearts, no wrong state** for tips.
- `reduceHearts`/`upsertChallengeProgress` already tolerate this (TIP simply
  uses the success path).

### Edge cases
- A TIP at order 1 means the first thing a learner sees in the unit is the
  explanation — intended.
- Lesson completion is computed from `challengeProgress`; marking the TIP
  complete on continue keeps lessons completable.
- `getLesson` returns challenges with `challengeOptions`; a TIP has an empty
  options array — renderers must not assume options exist.

### Verification
- `bun run db:push && bun run db:prod`; query that each PL→SE unit's first
  lesson has a `TIP` at order 1.
- `tsc --noEmit`, prettier.
- Manual: enter a PL→SE lesson → tip shows first → Continue → questions →
  lesson completes; hearts unaffected by the tip.

### Out of scope (Phase 1)
TYPE/MATCH/BUILD, audio/LISTEN, SRS — later phases.

## Implementation checklist (Phase 1)
1. `db/schema.ts`: add `TIP` to the enum.
2. `scripts/prod.ts`: add `tip?` to `SeedLesson`; prepend TIP in the generator;
   author the 7 Polish+Swedish tips on PL→SE unit lead lessons.
3. `app/lesson/tip-card.tsx`: new component (highlight quoted Swedish).
4. `app/lesson/quiz.tsx`: TIP branch + continue handler.
5. `db:push` + `db:prod`; verify; `tsc`/prettier.
6. Commit, push, redeploy; confirm on the live site.

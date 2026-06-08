# Code Review Backlog

## Review + Bug Hunt — 2026-06-08 (lesson types / audio / SRS)

### Auto-fixed (review)
- `app/lesson/type-challenge.tsx` — reveal the correct answer on a wrong attempt
  (learner couldn't see what was right; could fail repeatedly without learning).
- `app/lesson/quiz.tsx` — mount the correct/incorrect `<audio>` elements in the
  MATCH/TYPE/BUILD branches so the answer chimes actually play.
- `db/queries.ts` + `app/(main)/learn/*` — practice now reviews everything learned
  (weakest-first) and the Practice button is hidden when there's nothing to review
  (was a dead button that bounced to /learn).

### Needs human review
- `app/lesson/match-challenge.tsx`, `app/lesson/build-challenge.tsx` —
  `shuffle()` runs in a `useState` initializer with `Math.random()`. If the
  challenge is the first one server-rendered (e.g. a mid-lesson reload that lands
  on it), server and client tile order differ → React hydration mismatch warning
  + a brief flash. The common path (advancing client-side) is unaffected.
  - Suggested fix: shuffle in a `useEffect` after mount, or gate rendering behind
    a `mounted` flag. Trade-off: avoids the warning but adds a one-frame empty
    state on that edge case — hence left for a human call.

### Pre-existing (not from this work)
- `proxy.ts` middleware matcher does not exclude `.mp3` / `.wav`, so static audio
  (Spanish `es_*.mp3`, sound effects, and the new `audio/sv/*.mp3`) is served
  through Clerk auth — it 404s when logged out. Fine for lessons (always authed),
  but excluding audio extensions would avoid the needless auth round-trip.

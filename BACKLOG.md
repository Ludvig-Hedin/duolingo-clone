# Backlog

Deferred, well-scoped follow-ups. Add an entry whenever work is intentionally
left out of a change.

## App language / i18n

- **Cross-device language sync.** The app language is stored in the `app_lang`
  cookie only, so a signed-in user on a new device falls back to the device
  default until they re-pick. To sync across devices, add an optional
  `appLanguage` column to `userProgress` (`db/schema.ts`), write it in
  `actions/language.ts` alongside the cookie for signed-in users, and prefer it
  in `lib/i18n/server.ts#getCurrentLocale`. Requires a `drizzle-kit push`
  against the live DB — keep the column nullable/defaulted so existing queries
  stay safe. (Area: `lib/i18n`, `actions/language.ts`, `db/schema.ts`)
- **Native review of `sv`/`pl` copy.** The Swedish and Polish dictionaries
  (`lib/i18n/dictionaries/{sv,pl}.ts`) are first-pass translations. Have a
  native speaker review before any marketing/production use.

## Pre-existing bugs spotted (out of scope of the i18n change)

- ~~**Hearts modal links to a dead route.**~~ Fixed — `hearts-modal.tsx` now
  pushes to `/shop` instead of the nonexistent `/store`.
- **ESLint is broken in this repo.** `npm run lint` throws
  `Converting circular structure to JSON` because ESLint 10.4.0 +
  `@eslint/eslintrc` `FlatCompat` can't load `eslint-config-next`'s legacy
  config. Pin a compatible ESLint, or migrate `eslint.config.mjs` to
  eslint-config-next's flat config. (Area: `eslint.config.mjs`, `package.json`)

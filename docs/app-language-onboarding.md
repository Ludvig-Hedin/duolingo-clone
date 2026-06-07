# App language onboarding + i18n

User-facing feature. Adds a first-run step to choose the **app (UI) language** —
English, Swedish, or Polish — defaulting to the device/browser locale, and
translates the app chrome accordingly. This is distinct from the **course**
(the language you are learning, e.g. Swedish↔Polish), which is unchanged.

## What the user sees

1. After signing in, before picking a course, a one-time **language step**
   (`/onboarding`) appears, pre-selected to the device language.
2. The whole app shell (nav, marketing page, learn/shop/quests/leaderboard,
   lesson UI, modals) renders in the chosen language.
3. A **language switcher** in the sidebar lets users change it anytime.

Lesson **content** (questions and answer options) is course data and stays as
authored — only the surrounding UI chrome is translated.

## Architecture

Lightweight, dependency-free i18n. No `next-intl` and no locale-prefixed routes
— the language is a user preference, not part of the URL.

| Piece | File | Notes |
| --- | --- | --- |
| Locale constants + helpers | `lib/i18n/locales.ts` | `en`/`sv`/`pl`, cookie name, `resolveAcceptLanguage`, flags, native labels |
| Dictionaries | `lib/i18n/dictionaries/{en,sv,pl}.ts` | `en` is the source of truth; `sv`/`pl` typed as `Dictionary` so the type-check enforces key parity |
| Dictionary registry | `lib/i18n/dictionaries/index.ts` | `getDictionary(locale)` |
| Server resolver | `lib/i18n/server.ts` | `getCurrentLocale()` / `getServerDictionary()` (reads cookie → Accept-Language) |
| Client context | `lib/i18n/context.tsx` | `I18nProvider` + `useTranslation()` → `{ locale, t, setLocale }` |
| Persist action | `actions/language.ts` | `setLocaleAction` writes the `app_lang` cookie |
| Switcher | `components/language-switcher.tsx` | Native `<select>`, accessible, zero deps |
| Onboarding UI | `components/language-onboarding.tsx` | Device-pre-selected picker |
| Onboarding route | `app/onboarding/page.tsx` | Self-skips once a language is chosen |

### Source of truth: a cookie

The active locale lives in the **`app_lang` cookie**. It is readable by both
server components (SSR `<html lang>`, server-rendered text) and client
components (the context). There is intentionally **no database column**, so the
feature ships without any migration on the live database and cannot break
existing `userProgress` queries.

### How text is translated

- **Server components** read the dictionary directly:
  `const t = await getServerDictionary()` then `t.section.key`.
- **Client components** use the context: `const { t } = useTranslation()`.
  Both derive from the same cookie, so they always agree.
- `t` is the typed dictionary object (`t.nav.learn`), so missing keys are caught
  at compile time.

### Default detection

`getCurrentLocale()` resolves in order: `app_lang` cookie → `Accept-Language`
header → `en`. The onboarding picker further refines its pre-selection with
`navigator.language` on the client (more accurate than Accept-Language).

### Onboarding trigger (no Clerk/env changes)

`app/(main)/courses/page.tsx` redirects to `/onboarding` when no `app_lang`
cookie is set. New users naturally reach course selection (learn → courses when
no active course), so the language step slots in right before it. `/onboarding`
redirects back to `/courses` once a choice is stored. No Clerk redirect/env
changes were needed.

## Changing language at runtime

`setLocale(next)` (client): optimistically updates context state, sets the
cookie and `<html lang>`, calls `setLocaleAction`, then `router.refresh()` so
server-rendered text re-renders in the new language.

## Adding a string

1. Add the key to `lib/i18n/dictionaries/en.ts`.
2. The type-check will now require it in `sv.ts` and `pl.ts` — add translations.
3. Use `t.section.key` in the component.

## Follow-ups

See `BACKLOG.md`:
- Cross-device sync via an optional `userProgress.appLanguage` column.
- Native review of the `sv`/`pl` copy before any marketing use.

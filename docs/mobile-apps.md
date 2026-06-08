# Mobile apps (iOS + Android)

Native iOS and Android apps for Lingo, so you can install it on your phone's home
screen and launch it like any other app.

These are **thin native WebView wrappers** (built with [Capacitor](https://capacitorjs.com/))
around the already-deployed web app. The native binary ships **no web bundle of
its own** — on launch it loads the live site from `server.url`, so the apps always
match production and authentication behaves exactly like it does in a mobile
browser.

- **Default target:** `https://duolingo-clone-dev.vercel.app`
- **App name:** `Lingo`
- **Bundle / application ID:** `com.lingo.app`

---

## Why this approach

| Decision | Reason |
| --- | --- |
| Capacitor, not React Native / Expo | The scope is "webview only for now". Capacitor wraps the existing Next.js site verbatim — zero UI rewrite, one source of truth. |
| Load the **remote** URL (`server.url`) instead of bundling static assets | The app uses Next.js server components, server actions, Clerk middleware and a database. It can't be statically exported. Pointing the WebView at the live deploy keeps the app and website identical and instantly up to date — no app re-release to ship a web change. |
| No native auth code | Clerk for this project has **no social/OAuth providers enabled** — sign-in is **email + password only**. Email/password runs natively inside a WebView with none of the "Google blocks embedded WebViews" (`disallowed_useragent`) problems that social login would cause. |

---

## Auth — how it works on device (and why it works)

Clerk runs on a **separate domain** (`guided-moray-44.clerk.accounts.dev`) from the
app, so its session cookies are *third-party* relative to the app domain. Two
things make that work inside the native shell:

1. **`server.allowNavigation`** (in `capacitor.config.ts`) whitelists the Clerk and
   Stripe domains so the WebView is allowed to load them in-app instead of being
   bounced to the system browser.
2. **Android `MainActivity.java`** explicitly enables third-party cookies
   (`CookieManager.setAcceptThirdPartyCookies(webView, true)`) and flushes them on
   pause so the session survives the app being killed. Android WebView blocks
   third-party cookies by default — without this, sign-in silently fails on Android.
   iOS (WKWebView) persists cookies by default, so no equivalent change is needed.

**What was verified:**

- The production site responds (`GET https://duolingo-clone-dev.vercel.app/` →
  `200`), so there's a live target for the WebView to load.
- Clerk's published config for this instance confirms **email + password only,
  zero social/OAuth providers** — so no embedded-WebView OAuth failure mode
  exists (queried directly from the Clerk frontend API).
- Both native projects were generated and `cap sync` applied the config cleanly;
  each platform's generated `capacitor.config.json` contains the expected
  `server.url` + `allowNavigation` list.
- **Android: a real debug APK was built** — `./gradlew assembleDebug` →
  `app-debug.apk` (4.6 MB, `package com.lingo.app`, label **Lingo**, launcher
  `com.lingo.app.MainActivity`). Installable on any device right now (see below).

**iOS not compiled in the build environment.** `xcodebuild` could not run here
(the harness can't initialise Xcode's developer cache —
`confstr(DARWIN_USER_CACHE_DIR)` returns EIO), and no Simulator runtime was
installed. This is an environment limitation, **not** a project defect — it's a
stock Capacitor Xcode project. Build it normally in Xcode or a regular Terminal
(steps below); that is the one remaining manual step for iOS.

**Sign-in itself has not been exercised on a physical device yet** — do that
once after installing (open app → Log in → email + password) to confirm
end-to-end. Everything that makes it work is configured and verified above.

> **Production note:** the live deploy currently uses a Clerk **development**
> instance ("Development mode" badge on the sign-in card). That works for
> home-screen / sideloaded use. Before shipping to a store, switch the deploy to a
> Clerk **production** instance on your own domain and update the `*.clerk.*` entry
> in `allowNavigation` accordingly.

---

## Prerequisites

- **Node.js ≥ 22** — the Capacitor 8 CLI requires it. This repo's default is Node 20,
  so select 22 before running any `cap` command:
  ```bash
  nvm use 22      # or: nvm install 22
  ```
- **iOS:** macOS + Xcode (tested with Xcode 26.4). No CocoaPods needed — Capacitor 8
  uses Swift Package Manager.
- **Android:** [Android Studio](https://developer.android.com/studio) (bundles its
  own JDK + Android SDK). A standalone JDK 21 + Android SDK also works.

---

## Build & run — iOS

```bash
nvm use 22
bun run ios          # = cap sync ios && cap open ios
```

This opens the project in Xcode. Then:

1. Select a simulator or your connected iPhone.
2. Press **Run** (▶).

**To put it on your iPhone home screen:**

1. Plug in the iPhone, select it as the run target.
2. In **Signing & Capabilities**, pick your Team (a free personal Apple ID works).
   Xcode auto-manages the signing certificate.
3. Run once from Xcode to install. The icon now lives on your home screen.
   (Free-account apps expire after 7 days and need a re-run; a paid Apple Developer
   account removes that limit.)

Headless build check (no signing, simulator):

```bash
cd ios
xcodebuild -project App/App.xcodeproj -scheme App -configuration Debug \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
  CODE_SIGNING_ALLOWED=NO build
```

---

## Build & run — Android

The debug APK **builds successfully** (verified). The simplest path is Android
Studio (it ships its own JDK + SDK):

```bash
nvm use 22
bun run android      # = cap sync android && cap open android
```

### CLI build (what was used here)

If you prefer the command line, you need a JDK 21 and the Android SDK 36 +
build-tools. One-time setup on macOS:

```bash
brew install openjdk@21
brew install --cask android-commandlinetools
export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
yes | sdkmanager --sdk_root="$ANDROID_HOME" --licenses
sdkmanager --sdk_root="$ANDROID_HOME" "platforms;android-36" "build-tools;36.0.0" "platform-tools"
echo "sdk.dir=$ANDROID_HOME" > android/local.properties   # git-ignored
```

> Use **JDK 21**, not 25 — Capacitor's Gradle 8.x rejects newer JDKs.

Then build:

```bash
cd android
JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home" \
  ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

### Install on your phone's home screen

- **Android Studio:** plug in your phone (USB debugging on) and press **Run ▶**,
  or **Build → Build APK(s)**.
- **From the built APK** (the `assembleDebug` output above): connect the phone
  and install it:
  ```bash
  adb install android/app/build/outputs/apk/debug/app-debug.apk
  ```
  Or copy `app-debug.apk` onto the phone and tap it (allow "install from unknown
  sources"). The **Lingo** icon lands on the home screen.

---

## Pointing the apps at a different URL

`server.url` defaults to the live deploy but honours the `CAP_SERVER_URL` env var —
useful for testing against a local `bun dev` from a real device on your LAN:

```bash
# Mac LAN IP, NOT localhost — the phone needs to reach your machine
CAP_SERVER_URL=http://192.168.1.10:3000 bun run ios
```

For a permanent change (e.g. a custom production domain), edit `server.url` and the
`allowNavigation` host list in `capacitor.config.ts`, then `bun run cap:sync`.

---

## App icon & splash screen

Source art lives in `mobile/assets/` (the green Lingo mascot, generated from
`public/mascot.svg`). Regenerate all platform sizes after changing it:

```bash
nvm use 22
bun run cap:assets
```

---

## Project layout

```
capacitor.config.ts                 # app id, name, server URL, allowed domains
mobile/
  assets/                           # icon + splash source images (1024 / 2732)
  www/                              # offline/first-paint fallback page (webDir)
ios/                                # native Xcode project (Swift Package Manager)
android/                            # native Android Studio / Gradle project
  app/src/main/.../MainActivity.java  # third-party-cookie enablement for Clerk
```

`ios/` and `android/` are committed so the native projects are reproducible. Build
artifacts (`Pods`, `.gradle`, `build/`, `DerivedData`, `*.apk`) are git-ignored by
the per-platform `.gitignore` files Capacitor generates.

---

## Known limitations / caveats

- **Online-only.** "WebView only for now" means the app needs a connection; offline
  shows the branded fallback in `mobile/www/index.html`, not cached lessons.
- **App Store digital-goods rule.** The "unlimited hearts" purchase uses Stripe
  Checkout (web). Apple guideline **3.1.1** requires in-app purchase for digital
  goods — fine for personal/home-screen install, a rejection risk for App Store
  submission. Use native IAP (e.g. RevenueCat) if/when you publish.
- **Clerk dev instance.** See the production note above — switch to a Clerk
  production instance before a store release.
- **Android** builds and produces a working `app-debug.apk` (verified). **iOS**
  couldn't be compiled in the generating environment (Xcode's build service
  needs a developer cache the harness can't provide) — it builds normally in
  Xcode / a regular Terminal.
- **Sign-in not yet exercised on a physical device.** Auth is fully configured
  (email + password, third-party cookies on Android); confirm end-to-end on
  first install.

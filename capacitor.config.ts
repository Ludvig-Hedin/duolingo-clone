import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Lingo native shell (iOS + Android).
 *
 * This is a thin native WebView wrapper around the already-deployed Next.js web
 * app. The native binary ships no web bundle of its own — it loads the live site
 * from `server.url` so the apps always match production and auth/session behave
 * exactly like the browser.
 *
 * Override the target at build time with CAP_SERVER_URL, e.g.
 *   CAP_SERVER_URL=http://192.168.1.10:3000 npx cap run ios
 * to point a device/simulator at a local `bun dev` server.
 */
const SERVER_URL =
  process.env.CAP_SERVER_URL ?? "https://duolingo-clone-dev.vercel.app";

const config: CapacitorConfig = {
  appId: "com.lingo.app",
  appName: "Lingo",
  // Offline / first-paint fallback bundle. The real UI comes from `server.url`.
  webDir: "mobile/www",
  server: {
    url: SERVER_URL,
    // Production is HTTPS-only; never allow cleartext.
    cleartext: false,
    // Domains the in-app WebView is allowed to navigate to without being kicked
    // out to the system browser. Anything NOT listed here opens externally.
    // Clerk (auth) runs on a separate *.clerk.accounts.dev domain, so it MUST be
    // allowed or sign-in/session handshake breaks. Stripe is the checkout flow.
    allowNavigation: [
      "duolingo-clone-dev.vercel.app",
      "*.vercel.app",
      "*.clerk.accounts.dev", // Clerk frontend API (this instance)
      "*.accounts.dev", // Clerk Account Portal (hosted sign-in redirects)
      "clerk.accounts.dev",
      "challenges.cloudflare.com", // Clerk bot-protection (Turnstile)
      "*.stripe.com",
      "checkout.stripe.com",
      "js.stripe.com",
    ],
  },
  ios: {
    backgroundColor: "#ffffff",
    // We legitimately navigate to non-app-bound domains (Clerk, Stripe). Leaving
    // this false keeps cookies/session working across those redirects in WKWebView.
    limitsNavigationsToAppBoundDomains: false,
    contentInset: "always",
  },
  android: {
    backgroundColor: "#ffffff",
    allowMixedContent: false,
  },
};

export default config;

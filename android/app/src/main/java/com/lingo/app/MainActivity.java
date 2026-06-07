package com.lingo.app;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Clerk (authentication) is served from a separate *.clerk.accounts.dev
    // domain, so its session cookies are "third-party" relative to the app's own
    // domain. Android's WebView blocks third-party cookies by default, which
    // silently breaks sign-in and session persistence. Enable them explicitly so
    // auth behaves exactly like it does in a normal mobile browser.
    CookieManager cookieManager = CookieManager.getInstance();
    cookieManager.setAcceptCookie(true);

    WebView webView = this.getBridge().getWebView();
    if (webView != null) {
      cookieManager.setAcceptThirdPartyCookies(webView, true);
    }
  }

  @Override
  public void onPause() {
    super.onPause();
    // Persist cookies to disk so the session survives the app being killed.
    CookieManager.getInstance().flush();
  }
}

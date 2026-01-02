import { useState, useEffect } from "react";

export interface PasskeySupportResult {
  isSupported: boolean;
  isLoading: boolean;
  reason: string | null;
  browserInfo: {
    isWebView: boolean;
    isWeb3Browser: boolean;
    browserName: string;
  };
}

/**
 * Detect if the current browser/platform supports passkeys (WebAuthn)
 * Returns detailed information about support status
 */
export function usePasskeySupport(): PasskeySupportResult {
  const [result, setResult] = useState<PasskeySupportResult>({
    isSupported: true,
    isLoading: true,
    reason: null,
    browserInfo: {
      isWebView: false,
      isWeb3Browser: false,
      browserName: "Unknown",
    },
  });

  useEffect(() => {
    void (async function checkSupport() {
      const browserInfo = detectBrowserInfo();

      // Check 1: Basic WebAuthn API availability
      if (!window.PublicKeyCredential) {
        setResult({
          isSupported: false,
          isLoading: false,
          reason: "WebAuthn API is not available in this browser",
          browserInfo,
        });
        return;
      }

      // Check 2: Platform authenticator (passkey) availability
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (!available) {
          setResult({
            isSupported: false,
            isLoading: false,
            reason: "No platform authenticator (passkey) available on this device",
            browserInfo,
          });
          return;
        }
      } catch {
        setResult({
          isSupported: false,
          isLoading: false,
          reason: "Unable to check platform authenticator availability",
          browserInfo,
        });
        return;
      }

      // Check 3: Conditional mediation support (for autofill)
      // This is optional but indicates full passkey support
      let hasConditionalMediation = false;
      try {
        if (typeof PublicKeyCredential.isConditionalMediationAvailable === "function") {
          hasConditionalMediation = await PublicKeyCredential.isConditionalMediationAvailable();
        }
      } catch {
        // Optional feature, ignore errors
      }

      // Check 4: Known problematic browsers
      if (browserInfo.isWeb3Browser) {
        // Some web3 browsers claim support but fail in practice
        // We'll still allow them to try but with a warning
        setResult({
          isSupported: true,
          isLoading: false,
          reason: hasConditionalMediation
            ? null
            : "Limited passkey support detected. If registration fails, try using a standard browser.",
          browserInfo,
        });
        return;
      }

      setResult({
        isSupported: true,
        isLoading: false,
        reason: null,
        browserInfo,
      });
    })();
  }, []);

  return result;
}

/**
 * Detect browser information for diagnostics
 */
function detectBrowserInfo(): PasskeySupportResult["browserInfo"] {
  const ua = navigator.userAgent.toLowerCase();

  // Detect common web3 in-app browsers
  const web3Browsers = [
    "metamask",
    "trustwallet",
    "coinbase",
    "rainbow",
    "phantom",
    "brave",
    "tokenpocket",
    "imtoken",
    "bitkeep",
    "okx",
    "zerion",
    "rabby",
  ];

  const isWeb3Browser = web3Browsers.some((browser) => ua.includes(browser));

  // Detect WebView (in-app browsers)
  const isWebView =
    ua.includes("wv") ||
    ua.includes("webview") ||
    (ua.includes("iphone") && !ua.includes("safari")) ||
    (ua.includes("android") && ua.includes("version/"));

  // Detect browser name
  let browserName = "Unknown";
  if (ua.includes("metamask")) browserName = "MetaMask";
  else if (ua.includes("trustwallet")) browserName = "Trust Wallet";
  else if (ua.includes("coinbase")) browserName = "Coinbase Wallet";
  else if (ua.includes("rainbow")) browserName = "Rainbow";
  else if (ua.includes("phantom")) browserName = "Phantom";
  else if (ua.includes("brave")) browserName = "Brave";
  else if (ua.includes("firefox")) browserName = "Firefox";
  else if (ua.includes("edg/")) browserName = "Edge";
  else if (ua.includes("chrome")) browserName = "Chrome";
  else if (ua.includes("safari")) browserName = "Safari";
  else if (ua.includes("opera")) browserName = "Opera";

  return {
    isWebView,
    isWeb3Browser,
    browserName,
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const SESSION_KEY = "dnews_session_id";
const ANON_ID_KEY = "dnews_anon_id";

function getAnonId(): string {
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

function getSessionId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

function setSessionId(id: string) {
  localStorage.setItem(SESSION_KEY, id);
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  const isTablet = /tablet|ipad/i.test(ua);
  return {
    deviceType: isTablet ? "TABLET" : isMobile ? "MOBILE" : "DESKTOP",
    browser: getBrowser(ua),
    os: getOS(ua),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

function getBrowser(ua: string): string {
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  return "Other";
}

function getOS(ua: string): string {
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Other";
}

function getUTMParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const val = params.get(key);
    if (val) utm[key] = val;
  }
  return utm;
}

async function send(path: string, body: Record<string, unknown>) {
  try {
    await fetch(`${API_URL}/tracking${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch { /* silent fail */ }
}

export async function trackPageView(opts?: { title?: string; entityType?: string; entityId?: string }) {
  const anonId = getAnonId();
  const sessionId = getSessionId();
  const device = getDeviceInfo();
  const utm = getUTMParams();
  const referrer = document.referrer || undefined;

  const payload: Record<string, unknown> = {
    path: window.location.pathname,
    title: opts?.title || document.title,
    anonymousId: anonId,
    sessionId: sessionId || undefined,
    referrer,
    referrerUrl: referrer ? new URL(referrer).hostname : undefined,
    entityType: opts?.entityType,
    entityId: opts?.entityId,
    ...device,
    ...utm,
  };

  const res = await send("/pageview", payload);
  return res;
}

export async function trackEvent(eventType: string, opts?: { entityType?: string; entityId?: string; value?: number; eventData?: Record<string, unknown> }) {
  const sessionId = getSessionId();
  if (!sessionId) return;
  await send("/event", {
    eventType,
    sessionId,
    visitorId: getAnonId(),
    ...opts,
  });
}

export async function trackSearch(query: string, resultsCount: number, source?: string) {
  await send("/search", {
    query,
    resultsCount,
    sessionId: getSessionId() || "unknown",
    visitorId: getAnonId(),
    source,
  });
}

export function startTrackingSession() {
  const anonId = getAnonId();
  const device = getDeviceInfo();
  const utm = getUTMParams();
  const referrer = document.referrer || undefined;

  send("/session", {
    anonymousId: anonId,
    referrer,
    referrerUrl: referrer ? new URL(referrer).hostname : undefined,
    path: window.location.pathname,
    ...device,
    ...utm,
  }).then((res: any) => {
    if (res?.sessionId) setSessionId(res.sessionId);
  });
}

export function endTrackingSession() {
  const sessionId = getSessionId();
  if (sessionId) {
    navigator.sendBeacon(`${API_URL}/tracking/session/end`, JSON.stringify({ sessionId }));
    localStorage.removeItem(SESSION_KEY);
  }
}

// Initialize tracking on page load
if (typeof window !== "undefined") {
  if (!getSessionId()) {
    startTrackingSession();
  }
  trackPageView();

  // Track page visibility changes
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      endTrackingSession();
    } else {
      startTrackingSession();
    }
  });
}

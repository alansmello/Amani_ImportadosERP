import type { AuthSession } from "@/types/auth";

const AUTH_STORAGE_KEY = "amani-erp:auth-session";
const AUTH_COOKIE_KEY = "amani-erp-authenticated";
const IDLE_TIMEOUT_MS = 60 * 60 * 1000;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getStoredAuthSession(): AuthSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    clearStoredAuthSession();
    return null;
  }
}

export function storeAuthSession(session: AuthSession) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  writeAuthCookie(session);
}

export function clearStoredAuthSession() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  document.cookie = `${AUTH_COOKIE_KEY}=; Max-Age=0; Path=/; SameSite=Lax`;
  window.dispatchEvent(new Event("amani-auth-session-cleared"));
}

export function isAuthSessionExpired(session: AuthSession, now = new Date()) {
  const expiresAt = new Date(session.expiresAt);
  const idleExpiresAt = new Date(session.idleExpiresAt);

  return expiresAt <= now || idleExpiresAt <= now;
}

export function createIdleExpirationDate(now = new Date()) {
  return new Date(now.getTime() + IDLE_TIMEOUT_MS).toISOString();
}

export function refreshStoredAuthSessionIdleExpiration(now = new Date()) {
  const session = getStoredAuthSession();
  if (!session) {
    return null;
  }

  if (isAuthSessionExpired(session, now)) {
    clearStoredAuthSession();
    return null;
  }

  const refreshedSession = {
    ...session,
    idleExpiresAt: createIdleExpirationDate(now),
  };

  storeAuthSession(refreshedSession);
  return refreshedSession;
}

function writeAuthCookie(session: AuthSession) {
  const expiresAt = new Date(session.expiresAt).getTime();
  const idleExpiresAt = new Date(session.idleExpiresAt).getTime();
  const maxAgeSeconds = Math.max(
    0,
    Math.floor((Math.min(expiresAt, idleExpiresAt) - Date.now()) / 1000)
  );

  document.cookie = `${AUTH_COOKIE_KEY}=true; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
}

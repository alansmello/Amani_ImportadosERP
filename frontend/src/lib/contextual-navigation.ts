const STORAGE_KEY = "amani:contextual-navigation:v1";
const MARKER_VERSION = 1;
const MARKER_TTL_MS = 10_000;
const BASE_ORIGIN = "https://amani.internal";

const ALLOWED_PREFIXES = [
  "/clientes",
  "/fornecedores",
  "/produtos",
  "/compras",
  "/vendas",
  "/estoque",
  "/financeiro",
  "/configuracoes"
] as const;

type TransitionMarker = {
  version: number;
  destination: string;
  origin: string;
  createdAt: number;
};

function isAllowedPathname(pathname: string) {
  if (pathname === "/") return true;

  return ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function normalizeInternalPath(candidate: string | null | undefined) {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return null;
  }

  try {
    const url = new URL(candidate, BASE_ORIGIN);
    if (url.origin !== BASE_ORIGIN || !isAllowedPathname(url.pathname)) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function stripReturnTo(candidate: string) {
  const normalized = normalizeInternalPath(candidate);
  if (!normalized) return null;

  const url = new URL(normalized, BASE_ORIGIN);
  url.searchParams.delete("returnTo");
  return `${url.pathname}${url.search}${url.hash}`;
}

export function buildContextualHref(destination: string, origin: string) {
  const normalizedDestination = normalizeInternalPath(destination);
  const normalizedOrigin = stripReturnTo(origin);

  if (!normalizedDestination || !normalizedOrigin) return destination;

  const url = new URL(normalizedDestination, BASE_ORIGIN);
  url.searchParams.set("returnTo", normalizedOrigin);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function recordContextualTransition(destination: string, origin: string) {
  if (typeof window === "undefined") return;

  const normalizedDestination = normalizeInternalPath(destination);
  const normalizedOrigin = stripReturnTo(origin);
  if (!normalizedDestination || !normalizedOrigin) return;

  const marker: TransitionMarker = {
    version: MARKER_VERSION,
    destination: normalizedDestination,
    origin: normalizedOrigin,
    createdAt: Date.now()
  };

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(marker));
}

export function consumeContextualReturn(currentLocation: string) {
  if (typeof window === "undefined") return null;

  const rawMarker = window.sessionStorage.getItem(STORAGE_KEY);
  window.sessionStorage.removeItem(STORAGE_KEY);
  if (!rawMarker) return null;

  try {
    const marker = JSON.parse(rawMarker) as TransitionMarker;
    const current = normalizeInternalPath(currentLocation);
    const url = current ? new URL(current, BASE_ORIGIN) : null;
    const returnTo = normalizeInternalPath(url?.searchParams.get("returnTo"));
    const age = Date.now() - marker.createdAt;

    if (
      marker.version !== MARKER_VERSION ||
      age < 0 ||
      age > MARKER_TTL_MS ||
      marker.destination !== current ||
      marker.origin !== returnTo
    ) {
      return null;
    }

    return marker.origin;
  } catch {
    return null;
  }
}

export function currentBrowserPath() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

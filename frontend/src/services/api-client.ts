import { ApiError, getApiErrorMessageFromBody } from "@/services/errors";
import {
  clearStoredAuthSession,
  refreshStoredAuthSessionIdleExpiration
} from "@/services/auth-storage";
import type { ApiRequestOptions } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

// Convenção: componentes nao chamam este client diretamente quando existir um
// service module. Cada modulo operacional deve encapsular endpoints em
// `frontend/src/services/<modulo>.ts` antes de expor hooks de consulta.
function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

async function parseResponse<TData>(response: Response): Promise<TData> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return undefined as TData;
  }

  return (await response.json()) as TData;
}

async function parseErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return "Nao foi possivel carregar as informacoes solicitadas.";
  }

  try {
    return getApiErrorMessageFromBody(await response.json());
  } catch {
    return "Nao foi possivel carregar as informacoes solicitadas.";
  }
}

// Este wrapper trata transporte HTTP e erros normalizados. Validacoes,
// calculos, rankings, alertas e metricas criticas devem vir prontos do backend.
export async function apiClient<TData>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<TData> {
  const { body, headers, ...init } = options;
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const session = refreshStoredAuthSessionIdleExpiration();
  if (session && !requestHeaders.has("Authorization")) {
    requestHeaders.set("Authorization", `${session.tokenType} ${session.accessToken}`);
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers: requestHeaders,
    body:
      body && typeof body === "object" && !(body instanceof FormData)
        ? JSON.stringify(body)
        : body
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuthSession();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    throw new ApiError({
      status: response.status,
      message: await parseErrorMessage(response)
    });
  }

  return parseResponse<TData>(response);
}

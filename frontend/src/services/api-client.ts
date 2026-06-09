import { ApiError } from "@/services/errors";
import type { ApiRequestOptions } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

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

export async function apiClient<TData>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<TData> {
  const { body, headers, ...init } = options;
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
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
    throw new ApiError({
      status: response.status,
      message: "Nao foi possivel carregar as informacoes solicitadas."
    });
  }

  return parseResponse<TData>(response);
}

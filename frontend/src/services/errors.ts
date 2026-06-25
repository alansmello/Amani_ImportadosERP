import type { ApiErrorShape } from "@/types/api";

export class ApiError extends Error implements ApiErrorShape {
  status?: number;
  code?: string;

  constructor({ status, message, code }: ApiErrorShape) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function getApiErrorMessageFromBody(body: unknown) {
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    typeof body.error === "string" &&
    body.error.trim()
  ) {
    return body.error;
  }

  if (
    body &&
    typeof body === "object" &&
    "message" in body &&
    typeof body.message === "string" &&
    body.message.trim()
  ) {
    return body.message;
  }

  if (
    body &&
    typeof body === "object" &&
    "title" in body &&
    typeof body.title === "string" &&
    body.title.trim()
  ) {
    const validationMessages = extractValidationMessages(body);

    if (validationMessages.length > 0) {
      return validationMessages[0];
    }

    return body.title;
  }

  return "Nao foi possivel carregar as informacoes solicitadas.";
}

function extractValidationMessages(body: object): string[] {
  if (!("errors" in body) || !body.errors || typeof body.errors !== "object") {
    return [];
  }

  return Object.values(body.errors)
    .flatMap((value) => (Array.isArray(value) ? value : []))
    .filter((value): value is string => typeof value === "string" && Boolean(value.trim()));
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError({ message: error.message });
  }

  return new ApiError({ message: "Nao foi possivel concluir a solicitacao." });
}

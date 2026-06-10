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

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError({ message: error.message });
  }

  return new ApiError({ message: "Nao foi possivel concluir a solicitacao." });
}

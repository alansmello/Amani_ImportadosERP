export type ApiErrorShape = {
  status?: number;
  message: string;
  code?: string;
};

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
};

export type ApiResult<TData> = {
  data: TData;
};

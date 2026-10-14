export interface ApiErrorResponse {
  message: string;
  error?: unknown;
  status?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

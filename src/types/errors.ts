// ErrorResponse mirror: every API error, 4xx or 5xx, comes in this shape
export interface IApiError {
  error: string;
  status: number;
  message: string;
  friendly_message: string;
  detail: unknown;
}

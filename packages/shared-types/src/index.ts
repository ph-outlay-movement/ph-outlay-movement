export const BUDGET_STAGES = ["NEP", "HOUSE", "SENATE", "BICAM", "GAA"] as const;
export type BudgetStage = (typeof BUDGET_STAGES)[number];

export type MatchConfidence = "confirmed" | "probable";

export type RecordValue<T> =
  | { readonly status: "found"; readonly value: T; readonly sourceId: string }
  | { readonly status: "no_record" };

export const APP_ERROR_CODES = [
  "BAD_REQUEST",
  "NOT_FOUND",
  "METHOD_NOT_ALLOWED",
  "RATE_LIMITED",
  "CONFIG_ERROR",
  "INTERNAL",
] as const;
export type AppErrorCode = (typeof APP_ERROR_CODES)[number];

export const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again later.";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly originalCode: string;

  constructor(code: AppErrorCode, originalCode: string) {
    super(code);
    this.name = "AppError";
    this.code = code;
    this.originalCode = originalCode;
  }
}

export interface ApiErrorBody {
  readonly error: {
    readonly code: AppErrorCode;
    readonly message: string;
  };
}

export interface HealthResponse {
  readonly status: "ok";
  readonly version: string;
}

import {
  AppError,
  GENERIC_ERROR_MESSAGE,
  type ApiErrorBody,
  type AppErrorCode,
  type HealthResponse,
} from "@outlay/shared-types";

interface Env {
  readonly API_VERSION: string;
  readonly ALLOWED_ORIGIN: string;
}

const STATUS_BY_CODE: Readonly<Record<AppErrorCode, number>> = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  RATE_LIMITED: 429,
  CONFIG_ERROR: 500,
  INTERNAL: 500,
};

const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Cache-Control": "no-store",
};

function buildHeaders(env: Env): Headers {
  const headers = new Headers(SECURITY_HEADERS);
  headers.set("Access-Control-Allow-Origin", env.ALLOWED_ORIGIN);
  headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  headers.set("Vary", "Origin");
  return headers;
}

function jsonResponse(body: HealthResponse | ApiErrorBody, status: number, env: Env): Response {
  return new Response(JSON.stringify(body), { status, headers: buildHeaders(env) });
}

function handleError(error: Error, env: Env): Response {
  const appError = error instanceof AppError ? error : new AppError("INTERNAL", error.name);
  console.error(JSON.stringify({ code: appError.code, originalCode: appError.originalCode }));
  const body: ApiErrorBody = {
    error: { code: appError.code, message: GENERIC_ERROR_MESSAGE },
  };
  return jsonResponse(body, STATUS_BY_CODE[appError.code], env);
}

function route(request: Request, env: Env): Response {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: buildHeaders(env) });
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    throw new AppError("METHOD_NOT_ALLOWED", request.method);
  }
  const { pathname } = new URL(request.url);
  if (pathname === `/api/${env.API_VERSION}/health`) {
    return jsonResponse({ status: "ok", version: env.API_VERSION }, 200, env);
  }
  throw new AppError("NOT_FOUND", "ROUTE_UNKNOWN");
}

const handler: ExportedHandler<Env> = {
  fetch(request, env) {
    try {
      return route(request, env);
    } catch (error) {
      return handleError(error instanceof Error ? error : new Error("NON_ERROR_THROWN"), env);
    }
  },
};

export default handler;

import type { IncomingMessage, ServerResponse } from "node:http";

// Handlers are written against plain Node req/res so the same file runs on
// Vercel (whose req/res extend these) and in the Vite dev-server middleware.
export type ApiRequest = IncomingMessage & { body?: unknown };
export type ApiResponse = ServerResponse;

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Thrown when SMTP / Firebase Admin env vars are missing. */
export class ConfigError extends HttpError {
  constructor(message: string) {
    super(503, message);
  }
}

export const sendJson = (res: ApiResponse, status: number, body: unknown) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
};

export const readJson = async (req: ApiRequest): Promise<Record<string, unknown>> => {
  // Vercel pre-parses the body; the dev middleware hands us the raw stream.
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === "string") return safeParse(req.body);
    if (Buffer.isBuffer(req.body)) return safeParse(req.body.toString("utf8"));
    if (typeof req.body === "object") return req.body as Record<string, unknown>;
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > 64 * 1024) throw new HttpError(413, "Request body too large.");
    chunks.push(chunk as Buffer);
  }
  return safeParse(Buffer.concat(chunks).toString("utf8"));
};

const safeParse = (text: string): Record<string, unknown> => {
  if (!text.trim()) return {};
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    throw new HttpError(400, "Invalid JSON body.");
  }
};

export const bearerToken = (req: ApiRequest): string | null => {
  const header = req.headers.authorization || "";
  const match = /^Bearer\s+(.+)$/i.exec(Array.isArray(header) ? header[0] : header);
  return match ? match[1].trim() : null;
};

/** Wraps a handler with method checking and uniform error responses. */
export const handle =
  (methods: string[], fn: (req: ApiRequest, res: ApiResponse) => Promise<void>) =>
  async (req: ApiRequest, res: ApiResponse) => {
    if (!methods.includes(req.method || "")) {
      res.setHeader("Allow", methods.join(", "));
      return sendJson(res, 405, { error: "Method not allowed." });
    }
    try {
      await fn(req, res);
    } catch (error) {
      if (error instanceof HttpError) return sendJson(res, error.status, { error: error.message });
      console.error("[api] unexpected error", error);
      return sendJson(res, 500, { error: "Internal error while sending the email." });
    }
  };

export const isNonEmptyId = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value);

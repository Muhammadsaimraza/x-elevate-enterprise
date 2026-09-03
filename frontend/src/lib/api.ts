const API_BASE = ""; // Uses Next.js rewrites, so relative paths work

interface ApiOptions extends RequestInit {
  // extend as needed
}

/**
 * Extract a human-readable message from an error response body.
 *
 * Handles the formats the FastAPI backend can produce:
 * - `{"detail": "Some message"}` (HTTPException / raised errors)
 * - `{"detail": [{ "msg": "...", ... }]}` (422 validation errors)
 * - plain string bodies, and non-JSON bodies (e.g. proxy error pages)
 */
function extractErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === "string" && body.trim()) {
    return body;
  }
  if (body && typeof body === "object") {
    const detail = (body as { detail?: unknown }).detail;
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (item && typeof item === "object" && "msg" in item) {
            return String((item as { msg?: unknown }).msg ?? "");
          }
          return typeof item === "string" ? item : "";
        })
        .filter((msg) => msg.length > 0);
      if (messages.length > 0) {
        return messages.join("; ");
      }
    }
  }
  return fallback;
}

export async function api<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: "include", // Send cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const fallback = `Request failed with status ${res.status}`;
    let message = fallback;
    const raw = await res.text().catch(() => "");
    if (raw) {
      try {
        message = extractErrorMessage(JSON.parse(raw), fallback);
      } catch {
        // Non-JSON body (plain-text error or an HTML error page)
        const trimmed = raw.trim();
        message = trimmed.startsWith("<") ? fallback : trimmed;
      }
    }
    throw new ApiError(message, res.status);
  }

  return res.json();
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
}

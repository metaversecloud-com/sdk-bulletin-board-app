// Per-app settings for the shared platform tests in tests/platform. Every app edits this file;
// the platform specs themselves stay identical across SDK apps.

export type RouteSpec = {
  method: "get" | "post" | "put" | "delete";
  /** Path under /api, without the query string. */
  path: string;
  data?: Record<string, unknown>;
};

/**
 * API routes that read the session credentials (getCredentials). Each one must reject missing or
 * foreign credentials and must never send the interactive secret to the browser. List them all.
 */
export const CREDENTIALED_ROUTES: RouteSpec[] = [
  { method: "get", path: "/game-state" },
  { method: "get", path: "/messages" },
  { method: "post", path: "/message", data: { message: "Hello" } },
  { method: "delete", path: "/message/msg-1" },
  { method: "get", path: "/admin/messages" },
  { method: "post", path: "/admin/message/approve/msg-1" },
  { method: "delete", path: "/admin/message/msg-1" },
  { method: "post", path: "/admin/theme", data: { title: "T", subtitle: "S", description: "D" } },
  { method: "post", path: "/admin/reset", data: { shouldHardReset: false } },
  { method: "post", path: "/admin/remove" },
];

/** Page the app opens in its iframe; the platform tests load it with valid credentials. */
export const ENTRY_PAGE = "/";

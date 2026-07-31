/** The public-facing shape of one active session — never the token
 * hash. `isCurrent` lets a client highlight "this device" in a session
 * list. */
export interface SessionSummary {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
}

/** What the controller layer extracts from an incoming request for the
 * service to attribute a new session to — never anything else about
 * the request. */
export interface RequestContext {
  ipAddress: string | null;
  userAgent: string | null;
}

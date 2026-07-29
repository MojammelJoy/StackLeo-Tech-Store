/**
 * Augments Express's Request type with fields the request-id middleware
 * attaches. Ambient — no runtime code; picked up automatically by TS
 * because it is included in the program via `src`.
 */
export {};

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

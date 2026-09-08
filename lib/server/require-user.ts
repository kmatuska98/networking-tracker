import "server-only";
import { auth } from "@/lib/server/auth";

export class UnauthorizedError extends Error {
  constructor() {
    super("Not signed in.");
    this.name = "UnauthorizedError";
  }
}

/**
 * Reads the current request's session (via lib/server/auth.ts) and returns
 * the signed-in user, or throws UnauthorizedError. Route handlers under
 * app/api/contacts/** call this first so every request is checked
 * independently of proxy.ts's page-level redirect (see proxy.ts comment).
 */
export async function requireUser() {
  const { data } = await auth.getSession();
  if (!data?.user) {
    throw new UnauthorizedError();
  }
  return data.user;
}

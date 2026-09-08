import "server-only";
import { createNeonAuth } from "@neondatabase/neon-js/auth/next/server";

/**
 * Unified server-side Neon Auth instance. Exposes Better Auth server methods
 * (signIn, signUp, getSession, token, signOut, ...) plus .handler() for the
 * auth API route and .middleware() for route protection (wired into proxy.ts).
 *
 * Server-only: reads NEON_AUTH_BASE_URL / NEON_AUTH_COOKIE_SECRET, which must
 * never reach the client bundle.
 */
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});

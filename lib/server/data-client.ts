import "server-only";
import { createClient } from "@neondatabase/neon-js";
import { auth } from "@/lib/server/auth";

/**
 * Returns a fresh Neon Data API (PostgREST) client scoped to the CURRENT
 * request's signed-in user. Built fresh per call (never a module-level
 * singleton) so concurrent requests from different users can never share
 * token state.
 *
 * Uses the "external auth provider" form of createClient: instead of letting
 * the SDK manage its own session, we hand it a getToken() callback that pulls
 * the current request's Better Auth JWT (from the `next/headers` cookie jar,
 * via lib/server/auth.ts's request-scoped auth.token()). That JWT is sent as
 * a Bearer token on every Data API call, which is what lets Postgres RLS
 * resolve auth.user_id() for db/rls_policies.sql's ownership policies.
 */
export function getServerDataClient() {
  return createClient({
    dataApi: {
      url: process.env.NEXT_PUBLIC_NEON_DATA_API_URL!,
      getToken: async () => {
        const { data } = await auth.token();
        return data?.token ?? null;
      },
    },
  });
}

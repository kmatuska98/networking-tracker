"use client";

import { createAuthClient } from "@neondatabase/neon-js/auth/next";

/**
 * Client-safe Better Auth client for the sign-in/sign-up/sign-out UI and the
 * useSession() hook. Talks to /api/auth/[...all] (same origin), so it never
 * needs the raw NEON_AUTH_BASE_URL server secret.
 */
export const authClient = createAuthClient();

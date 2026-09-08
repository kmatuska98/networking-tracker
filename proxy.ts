import { auth } from "@/lib/server/auth";

// Next.js 16 renamed `middleware.ts` -> `proxy.ts` (same runtime behavior).
// Protects every /contacts/** page, redirecting unauthenticated visitors to
// /sign-in. API routes enforce their own auth check independently (see
// lib/server/require-user.ts) rather than relying on this alone.
export default auth.middleware({ loginUrl: "/sign-in" });

export const config = {
  matcher: ["/contacts/:path*"],
};

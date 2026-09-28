import { NextRequest, NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/server/require-user";
import { saveConnection } from "@/lib/server/google-calendar";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const OAUTH_STATE_COOKIE = "gcal_oauth_state";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    throw error;
  }

  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  const redirectTo = (status: "connected" | "error") =>
    NextResponse.redirect(new URL(`/contacts?calendar=${status}`, request.url));

  if (errorParam || !code || !state || !expectedState || state !== expectedState) {
    const response = redirectTo("error");
    response.cookies.delete(OAUTH_STATE_COOKIE);
    return response;
  }

  const redirectUri = new URL("/api/google-calendar/callback", request.url).toString();

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    const response = redirectTo("error");
    response.cookies.delete(OAUTH_STATE_COOKIE);
    return response;
  }

  const tokens = (await tokenResponse.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  if (!tokens.refresh_token) {
    // Google only returns a refresh_token on the first consent for a given
    // account; if the user previously connected and revoked in a way that
    // skipped Google's own consent screen, prompt=consent (set in connect/
    // route.ts) should prevent this, but fall back to a clear error either way.
    const response = redirectTo("error");
    response.cookies.delete(OAUTH_STATE_COOKIE);
    return response;
  }

  await saveConnection({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_in: tokens.expires_in,
  });

  const response = redirectTo("connected");
  response.cookies.delete(OAUTH_STATE_COOKIE);
  return response;
}

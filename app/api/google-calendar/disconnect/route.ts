import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/server/require-user";
import { disconnectCalendar } from "@/lib/server/google-calendar";

export async function POST() {
  try {
    await requireUser();
    await disconnectCalendar();
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ errors: { form: "You must be signed in." } }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ errors: { form: "Could not disconnect calendar." } }, { status: 500 });
  }
}

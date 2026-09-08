import { NextRequest, NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/server/require-user";
import { createContact, listContacts, RepositoryError } from "@/lib/server/contacts.repository";
import { validateContactInput } from "@/lib/validation/contact.validation";
import type { ContactInput } from "@/lib/types/contact";

export async function GET(request: NextRequest) {
  try {
    await requireUser();

    const { searchParams } = request.nextUrl;
    const contacts = await listContacts({
      sort: searchParams.get("sort"),
      direction: searchParams.get("dir"),
      priority: searchParams.get("priority"),
      search: searchParams.get("q"),
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireUser();

    const body = (await request.json().catch(() => null)) as ContactInput | null;
    if (!body) {
      return NextResponse.json({ errors: { form: "Invalid request body." } }, { status: 400 });
    }

    const { valid, errors } = validateContactInput(body);
    if (!valid) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const contact = await createContact(body);
    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ errors: { form: "You must be signed in." } }, { status: 401 });
  }
  if (error instanceof RepositoryError) {
    return NextResponse.json({ errors: { form: error.message } }, { status: 500 });
  }
  console.error(error);
  return NextResponse.json({ errors: { form: "Unexpected server error." } }, { status: 500 });
}

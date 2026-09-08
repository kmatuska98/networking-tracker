import { NextRequest, NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/server/require-user";
import {
  deleteContact,
  getContact,
  RepositoryError,
  updateContact,
} from "@/lib/server/contacts.repository";
import { validateContactInput } from "@/lib/validation/contact.validation";
import type { ContactInput } from "@/lib/types/contact";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireUser();
    const { id } = await params;

    const contact = await getContact(id);
    if (!contact) {
      return NextResponse.json({ errors: { form: "Contact not found." } }, { status: 404 });
    }
    return NextResponse.json({ contact });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireUser();
    const { id } = await params;

    const body = (await request.json().catch(() => null)) as ContactInput | null;
    if (!body) {
      return NextResponse.json({ errors: { form: "Invalid request body." } }, { status: 400 });
    }

    const { valid, errors } = validateContactInput(body);
    if (!valid) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const contact = await updateContact(id, body);
    if (!contact) {
      return NextResponse.json({ errors: { form: "Contact not found." } }, { status: 404 });
    }
    return NextResponse.json({ contact });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireUser();
    const { id } = await params;

    const contact = await deleteContact(id);
    if (!contact) {
      return NextResponse.json({ errors: { form: "Contact not found." } }, { status: 404 });
    }
    return NextResponse.json({ contact });
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

import { auth } from "@/lib/server/auth";

export const { GET, POST } = auth.handler();

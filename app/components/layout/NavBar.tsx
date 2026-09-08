"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function NavBar() {
  const router = useRouter();
  const session = authClient.useSession();

  async function handleSignOut() {
    try {
      await authClient.signOut();
      toast.success("Signed out.");
    } catch {
      toast.error("Could not reach the server, but you've been signed out locally.");
    } finally {
      router.push("/sign-in");
      router.refresh();
    }
  }

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/contacts" className="text-sm font-semibold tracking-tight">
          Networking Tracker
        </Link>

        <div className="flex items-center gap-3">
          {session.isPending ? null : session.data?.user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {session.data.user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <Link href="/sign-in" className={buttonVariants({ size: "sm" })}>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

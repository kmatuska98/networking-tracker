import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data } = await auth.getSession();
  if (data?.user) {
    redirect("/contacts");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Networking Tracker
        </h1>
        <p className="mx-auto max-w-md text-muted-foreground">
          Keep a private list of the people you&apos;re networking with — where you
          met them, why they matter, and when to follow up next.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
          Get started
        </Link>
        <Link href="/sign-in" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Sign in
        </Link>
      </div>
    </main>
  );
}

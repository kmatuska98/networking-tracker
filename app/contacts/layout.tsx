import { NavBar } from "@/app/components/layout/NavBar";

export default function ContactsLayout({ children }: LayoutProps<"/contacts">) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

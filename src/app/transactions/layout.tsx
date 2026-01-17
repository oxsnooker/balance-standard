import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { UserNav } from "@/components/user-nav";

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <LockKeyhole className="h-6 w-6 text-primary" />
            <span className="font-bold">AuthConnect</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">{children}</div>
      </main>
    </div>
  );
}

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import Logo from "@/components/Logo";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forja Products",
  description: "Internal product dashboard",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get(AUTH_COOKIE_NAME)?.value;

  return (
    <html lang="en">
      <body
        className="bg-bg text-text antialiased"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        <header style={{ background: 'linear-gradient(135deg, #1c1a18 0%, #3a3330 50%, #C07840 100%)' }}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/">
              <Logo />
            </Link>
            {isAuthenticated && <LogoutButton />}
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}

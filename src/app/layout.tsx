import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
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
    <html lang="es">
      <body
        className="bg-bg text-text antialiased"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <h1 className="text-xl font-semibold tracking-tight text-text">
              Forja Products
            </h1>
            {isAuthenticated && <LogoutButton />}
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}

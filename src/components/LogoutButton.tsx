"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-md border border-border px-3 py-1.5 text-sm text-text-dim transition-colors hover:bg-surface2 hover:text-text"
    >
      Salir
    </button>
  );
}

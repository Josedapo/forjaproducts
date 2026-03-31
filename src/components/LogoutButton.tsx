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
      className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
    >
      Sign out
    </button>
  );
}

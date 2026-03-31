"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Contrasena incorrecta");
      }
    } catch {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8">
        <h2 className="mb-6 text-center text-2xl font-semibold text-text">
          Forja Products
        </h2>
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-text-dim"
          >
            Contrasena
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded-md border border-border bg-surface2 px-3 py-2 text-sm text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            autoFocus
            required
          />
          {error && (
            <p className="mb-4 text-sm text-red">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

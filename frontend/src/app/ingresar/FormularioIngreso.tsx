"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function FormularioIngreso({ destino }: { destino: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function ingresar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    const r = await signIn("credentials", { email, password, redirect: false });
    setEnviando(false);
    if (!r || r.error) {
      setError("Email o contraseña incorrectos");
      return;
    }
    router.push(destino);
    router.refresh();
  }

  return (
    <form onSubmit={ingresar} className="space-y-3">
      <label className="block text-sm font-medium">
        Email
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-surface-dim px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Contraseña
        <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-surface-dim px-3 py-2" />
      </label>
      {error && <p className="rounded-lg bg-warning-container p-2 text-sm text-warning">{error}</p>}
      <button disabled={enviando} className="w-full rounded-full bg-primary py-2.5 font-semibold text-on-primary shadow-md transition hover:bg-primary-hover hover:shadow-lg active:scale-[0.98] disabled:opacity-60">
        {enviando ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}

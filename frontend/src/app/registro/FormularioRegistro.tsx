"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SelectorPerfil } from "@/components/SelectorPerfil";

export function FormularioRegistro() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [perfil, setPerfil] = useState("VIAJERO");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    const r = await fetch("/api/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password, perfil }),
    });
    if (!r.ok) {
      setError((await r.json().catch(() => null))?.error ?? "No pudimos crear la cuenta");
      setEnviando(false);
      return;
    }
    await signIn("credentials", { email, password, redirect: false });
    router.push("/despues-de-ingresar");
    router.refresh();
  }

  return (
    <form onSubmit={registrar} className="space-y-4">
      <SelectorPerfil valor={perfil} onChange={setPerfil} />
      <label className="block text-sm font-medium">
        {perfil === "VIAJERO" ? "Tu nombre" : "Nombre del emprendimiento o tuyo"}
        <input required value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name"
          className="mt-1 w-full rounded-lg border border-surface-dim px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Email
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
          className="mt-1 w-full rounded-lg border border-surface-dim px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Contraseña <span className="font-normal text-secondary">(mínimo 8 caracteres)</span>
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-surface-dim px-3 py-2" />
      </label>
      {error && <p className="rounded-lg bg-warning-container p-2 text-sm text-warning">{error}</p>}
      <button disabled={enviando} className="w-full rounded-full bg-primary py-2.5 font-semibold text-on-primary shadow-md transition hover:bg-primary-hover hover:shadow-lg active:scale-[0.98] disabled:opacity-60">
        {enviando ? "Creando cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}

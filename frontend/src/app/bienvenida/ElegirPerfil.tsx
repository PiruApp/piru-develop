"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SelectorPerfil } from "@/components/SelectorPerfil";

export function ElegirPerfil() {
  const { update } = useSession();
  const router = useRouter();
  const [perfil, setPerfil] = useState("VIAJERO");
  const [error, setError] = useState<string | null>(null);

  async function confirmar() {
    const r = await fetch("/api/perfil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ perfil }),
    });
    if (!r.ok) {
      setError((await r.json().catch(() => null))?.error ?? "No pudimos guardar tu perfil");
      return;
    }
    await update(); // vuelve a leer el rol en el token
    router.push("/despues-de-ingresar");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <SelectorPerfil valor={perfil} onChange={setPerfil} />
      {error && <p className="rounded-lg bg-warning-container p-2 text-sm text-warning">{error}</p>}
      <button onClick={confirmar} className="w-full rounded-full bg-primary py-2.5 font-semibold text-on-primary shadow-md transition hover:bg-primary-hover hover:shadow-lg active:scale-[0.98]">
        Continuar
      </button>
    </div>
  );
}

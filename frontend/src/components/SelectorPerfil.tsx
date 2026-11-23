"use client";

import { OPCIONES_PERFIL } from "@/lib/roles";
import { IconoPerfil } from "./IconoPerfil";

export function SelectorPerfil({ valor, onChange }: { valor: string; onChange: (v: string) => void }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">¿Cómo vas a usar PIRU?</legend>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {OPCIONES_PERFIL.map((o) => (
          <button
            key={o.valor}
            type="button"
            onClick={() => onChange(o.valor)}
            aria-pressed={valor === o.valor}
            className={`rounded-xl border p-3 text-left transition ${valor === o.valor ? "border-primary bg-primary-container shadow-sm" : "border-surface-dim bg-surface-lowest hover:border-secondary hover:shadow-sm"}`}
          >
            <IconoPerfil tipo={o.icono} size={28} />
            <p className="mt-2 text-sm font-semibold">{o.titulo}</p>
            <p className="text-xs text-secondary">{o.texto}</p>
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-secondary">Guías, hoteles y restaurantes son colaboradores: publican ofertas y reciben pedidos de viajeros.</p>
    </fieldset>
  );
}

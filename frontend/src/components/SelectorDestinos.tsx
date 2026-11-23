"use client";

import { useMemo, useState } from "react";
import type { Punto } from "@/lib/api";
import { ImagenLugar } from "./ImagenLugar";
import { BadgeCantidad } from "./BadgeCantidad";

const REGIONES = ["Quebrada", "Puna", "Valles", "Yungas"] as const;

export function SelectorDestinos({ puntos, elegidos, onAlternar, onRecomendar }: {
  puntos: Punto[];
  elegidos: string[];
  onAlternar: (id: string) => void;
  onRecomendar: () => void;
}) {
  const [region, setRegion] = useState<(typeof REGIONES)[number]>("Quebrada");
  const visibles = useMemo(
    () => puntos.filter((p) => p.region === region && p.id !== "san_salvador"),
    [puntos, region],
  );
  const nombres = elegidos.map((id) => puntos.find((p) => p.id === id)?.nombre ?? id);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">Lugares que no te querés perder</span>
        <button type="button" onClick={onRecomendar}
          className="shrink-0 whitespace-nowrap rounded-full bg-primary-container px-3 py-1 text-xs font-semibold text-primary transition hover:bg-secondary-container">
          Recomendame
        </button>
      </div>

      <div className="mt-2 flex gap-1 rounded-full bg-surface-mid p-1 text-xs font-semibold" role="tablist">
        {REGIONES.map((r) => {
          const cantidad = puntos.filter((p) => p.region === r && elegidos.includes(p.id)).length;
          return (
            <button key={r} type="button" role="tab" aria-selected={region === r} onClick={() => setRegion(r)}
              className={`flex-1 rounded-full py-1.5 transition ${region === r ? "bg-surface-lowest shadow-sm" : "text-secondary"}`}>
              {r}<BadgeCantidad cantidad={cantidad} />
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {visibles.map((p) => {
          const activo = elegidos.includes(p.id);
          return (
            <button key={p.id} type="button" onClick={() => onAlternar(p.id)} aria-pressed={activo}
              className={`group relative overflow-hidden rounded-xl text-left ring-offset-2 transition ${activo ? "ring-2 ring-primary" : "hover:opacity-90"}`}>
              <ImagenLugar busqueda={p.busquedaImagen} alt={p.nombre} region={p.region} className="h-24" credito={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                <p className="text-sm font-semibold leading-tight">{p.nombre}</p>
                <p className="text-[11px] opacity-90">{p.altitudMsnm.toLocaleString("es-AR")} msnm</p>
              </div>
              {p.imperdible && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                  Imperdible
                </span>
              )}
              <span className={`absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold ${activo ? "bg-primary text-white" : "bg-white/80 text-secondary"}`}>
                {activo ? "✓" : "+"}
              </span>
            </button>
          );
        })}
      </div>

      {elegidos.length > 0 && (
        <p className="mt-2 text-xs text-secondary">
          Elegiste: {nombres.join(", ")}.{" "}
          <button type="button" className="font-semibold text-primary" onClick={() => elegidos.forEach(onAlternar)}>Limpiar</button>
        </p>
      )}
    </div>
  );
}

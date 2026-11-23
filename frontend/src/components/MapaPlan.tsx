"use client";

import dynamic from "next/dynamic";
import type { Punto } from "@/lib/api";

// Leaflet usa window: se carga solo en el navegador.
const MapaLeaflet = dynamic(() => import("./MapaLeaflet"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-surface-high" />,
});

/** Recorrido en el orden del plan. Mover el mapa no cambia el plan (DOC-04A §9). */
export function MapaPlan({ puntos }: { puntos: Punto[] }) {
  return (
    <div className="relative z-0 h-72 overflow-hidden rounded-xl border border-surface-dim md:h-96">
      <MapaLeaflet puntos={puntos} />
    </div>
  );
}

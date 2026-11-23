"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { SkeletonViaje } from "@/components/Skeleton";
import { bff } from "@/lib/bffCliente";
import { formatearMonto } from "@/lib/formato";
import { NOMBRE_TIPO } from "@/lib/roles";
import { fechaLarga, TEXTO_ESTADO_VIAJE, type VistaViajero } from "@/lib/viajes";

const TEXTO_RESPUESTA: Record<string, string> = {
  INFORMADO: "vio tu solicitud y te va a escribir",
  CERRADO_FUERA: "confirmó por WhatsApp",
  DESCARTADO: "no tiene disponibilidad",
};

export default function MisViajes() {
  const [viajes, setViajes] = useState<VistaViajero[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState<string | null>(null);

  function cargar() {
    bff<VistaViajero[]>("solicitudes/mias").then(setViajes).catch((e: Error) => setError(e.message));
  }
  useEffect(cargar, []);

  async function cancelar(id: string) {
    setCancelando(null);
    try {
      const actualizada = await bff<VistaViajero>(`solicitudes/${id}/cancelar`, { method: "POST" });
      setViajes((v) => v?.map((x) => (x.id === id ? actualizada : x)) ?? null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis viajes</h1>
        <Link href="/viajero/armar-viaje" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary shadow-md transition hover:bg-primary-hover hover:shadow-lg active:scale-[0.98]">Armar viaje</Link>
      </div>

      {error && <p className="mt-4 rounded-xl bg-warning-container p-4 text-sm text-warning">{error}</p>}
      {!viajes && !error && (
        <div className="mt-6 space-y-4">
          <SkeletonViaje />
          <SkeletonViaje />
          <SkeletonViaje />
        </div>
      )}
      {viajes?.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-surface-dim p-8 text-center text-secondary">Todavía no reservaste ningún circuito.</p>
      )}

      <ul className="mt-6 space-y-4">
        {viajes?.map((v) => {
          const estado = TEXTO_ESTADO_VIAJE[v.estado];
          return (
            <li key={v.id} className="glass rounded-2xl p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-secondary">Código {v.id}</p>
                  <h2 className="font-semibold">{v.circuito.nombre}</h2>
                  <p className="text-sm text-secondary">
                    Salida {fechaLarga(v.fechaViaje)} · {v.personas} persona(s) · {formatearMonto(v.circuito.calculo.aPagarCentavos, "ARS")}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${estado.clase}`}>{estado.texto}</span>
              </div>
              {v.respuestas.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm">
                  {v.respuestas.map((r, i) => (
                    <li key={i}>• <strong>{r.colaboradorNombre}</strong> ({NOMBRE_TIPO[r.tipo]}) {TEXTO_RESPUESTA[r.estado] ?? r.estado}</li>
                  ))}
                </ul>
              )}
              {v.estado !== "CANCELADA" && (
                <button onClick={() => setCancelando(v.id)} className="mt-3 text-sm font-semibold text-secondary hover:text-primary">Cancelar solicitud</button>
              )}
            </li>
          );
        })}
      </ul>

      {/* Modal de cancelación */}
      <Modal abierto={!!cancelando} onCerrar={() => setCancelando(null)}>
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning-container">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-bold">Cancelar solicitud</h3>
          <p className="mt-2 text-sm text-secondary">
            ¿Estás seguro? Los prestadores dejarán de ver tu solicitud como activa y no podrán contactarte.
          </p>
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={() => setCancelando(null)}
              className="flex-1 rounded-full border border-surface-dim py-2.5 font-semibold transition hover:bg-surface-low">
              Volver
            </button>
            <button type="button" onClick={() => cancelando && cancelar(cancelando)}
              className="flex-1 rounded-full bg-warning py-2.5 font-semibold text-white shadow-md transition hover:opacity-90">
              Sí, cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { api, type Oferta, type PlanCandidato, type Punto } from "@/lib/api";
import { NOMBRE_CATEGORIA } from "@/lib/formato";
import { ImagenLugar } from "./ImagenLugar";
import { MapaPlan } from "./MapaPlan";

const ETIQUETA_TIPO: Record<string, string> = { GUIA: "Guía", HOTEL: "Alojamiento", RESTAURANTE: "Restaurante" };

export function BadgeCota({ plan, monto }: { plan: PlanCandidato; monto: (c: number) => string }) {
  const { entraEnCota, margenCentavos } = plan.calculo;
  return entraEnCota ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-success-container px-2.5 py-1 text-xs font-semibold text-success">
      <span className="h-1.5 w-1.5 rounded-full bg-success" /> Entra (+{monto(margenCentavos)} a favor)
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-warning-container px-2.5 py-1 text-xs font-semibold text-warning">
      Faltan {monto(-margenCentavos)}
    </span>
  );
}

export function DetallePlan({ plan, personas, puntos, monto, onReservar }: {
  plan: PlanCandidato; personas: number; puntos: Punto[]; monto: (c: number) => string; onReservar: () => void;
}) {
  const c = plan.calculo;
  const maxAltura = Math.max(...puntos.map((p) => p.altitudMsnm));
  const porId = new Map(puntos.map((p) => [p.id, p]));
  const [ofertas, setOfertas] = useState<Oferta[]>([]);

  useEffect(() => {
    api.ofertas(plan.puntosEnOrden).then(setOfertas).catch(() => setOfertas([]));
  }, [plan.puntosEnOrden]);

  return (
    <article className="space-y-6 rounded-2xl border border-surface-dim bg-surface-lowest p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold">{plan.nombre}</h2>
          <p className="text-sm text-secondary">{plan.dias} días · {plan.noches} noches · {personas} persona(s)</p>
        </div>
        <BadgeCota plan={plan} monto={monto} />
      </header>

      <MapaPlan puntos={puntos} />

      {maxAltura >= 3500 && (
        <p className="rounded-lg border border-amber-200 bg-warning-container p-3 text-xs text-warning">
          <strong>{maxAltura.toLocaleString("es-AR")} msnm</strong> · Este circuito sube a la Puna: aclimatate de a poco,
          tomá agua y evitá comidas pesadas antes del ascenso.
        </p>
      )}

      <section>
        <h3 className="font-semibold">Día por día</h3>
        <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plan.itinerario.map((d) => {
            const destacado = d.puntoIds.map((id) => porId.get(id)).find((p) => p && p.id !== "san_salvador") ?? porId.get(d.puntoIds[0]);
            return (
              <li key={d.numero} className="group overflow-hidden rounded-xl border border-surface-dim bg-surface-lowest shadow-sm transition hover:shadow-md">
                <div className="relative">
                  {destacado && <ImagenLugar busqueda={destacado.busquedaImagen} alt={destacado.nombre} region={destacado.region} className="h-28 transition group-hover:scale-[1.02]" />}
                  <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary shadow">
                    {d.numero}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-primary">Noche en {d.base}</p>
                  <p className="text-sm font-medium">{d.titulo}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h3 className="font-semibold">Desglose de costos</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {plan.items.map((i) => (
              <li key={i.id} className="flex items-start justify-between gap-3 rounded-lg bg-surface-low/50 px-3 py-2.5">
                <div>
                  <p className="font-medium">{i.titulo}</p>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-secondary">
                    <span className="inline-flex items-center rounded-full bg-surface-mid px-2 py-0.5">{NOMBRE_CATEGORIA[i.categoria]}</span>
                    <span>{i.tipoCosto === "ESTIMADO" ? "Estimado" : "Tarifa publicada"}</span>
                  </div>
                </div>
                <span className="whitespace-nowrap font-semibold">{monto(i.montoCentavos)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 border-t border-surface-dim pt-3 text-sm">
            <Fila etiqueta="Total" valor={monto(c.brutoCentavos)} />
            {c.descuentoCentavos > 0 && <Fila etiqueta="Beneficio bancario" valor={`− ${monto(c.descuentoCentavos)}`} />}
            <Fila etiqueta="A pagar" valor={monto(c.aPagarCentavos)} fuerte />
            <Fila etiqueta={`Por persona (${personas})`} valor={monto(c.porPersonaCentavos)} />
          </dl>
          {c.incluyeEstimados && (
            <p className="mt-2 text-xs text-secondary">Incluye montos estimados: no es un precio cerrado hasta que un prestador lo confirme.</p>
          )}
        </section>

        <section>
          <h3 className="font-semibold">Prestadores en este circuito</h3>
          {ofertas.length === 0 ? (
            <p className="mt-2 text-sm text-secondary">Todavía no hay guías, hoteles o restaurantes con ofertas en estos lugares.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {ofertas.map((o) => (
                <li key={o.id} className="rounded-lg bg-surface-low p-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">{o.titulo}</span>
                    <span className="whitespace-nowrap font-semibold">{monto(o.precioCentavos)}</span>
                  </div>
                  <p className="text-xs text-secondary">
                    {ETIQUETA_TIPO[o.tipo]} · {o.colaboradorNombre} · {porId.get(o.puntoId)?.nombre} · {o.unidadPrecio}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="glass sticky bottom-3 flex flex-col items-stretch gap-2 rounded-xl p-3 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-secondary">Total a pagar</p>
          <p className="text-lg font-bold">{monto(c.aPagarCentavos)} <span className="text-xs font-normal text-secondary">· {monto(c.porPersonaCentavos)} por persona</span></p>
        </div>
        <button type="button" onClick={onReservar}
          className="rounded-full bg-primary px-6 py-3 font-semibold text-on-primary shadow-md transition hover:bg-primary-hover hover:shadow-lg active:scale-[0.98]">
          Reservar este circuito
        </button>
      </div>
    </article>
  );
}

function Fila({ etiqueta, valor, fuerte }: { etiqueta: string; valor: string; fuerte?: boolean }) {
  return (
    <div className={`flex justify-between ${fuerte ? "text-base font-bold" : ""}`}>
      <dt>{etiqueta}</dt>
      <dd>{valor}</dd>
    </div>
  );
}

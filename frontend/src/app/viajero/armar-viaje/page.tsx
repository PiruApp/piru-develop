"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeCota, DetallePlan } from "@/components/DetallePlan";
import { ImagenLugar } from "@/components/ImagenLugar";
import { SelectorDestinos } from "@/components/SelectorDestinos";
import {
  api, API_URL,
  type Cotizacion, type GenerarPlanRequest, type GenerarPlanResponse, type Moneda,
  type PlanCandidato, type Promocion, type Punto, type ResumenCircuito, type TipoCambio,
} from "@/lib/api";
import { guardarBorrador } from "@/lib/checkout";
import { formatearFecha, formatearMonto, NOMBRE_TIPO_CAMBIO } from "@/lib/formato";

const TIPOS_CAMBIO: TipoCambio[] = ["oficial", "bolsa", "blue", "tarjeta"];

export default function ArmarViaje() {
  const router = useRouter();
  const { data: sesion } = useSession();

  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [circuitos, setCircuitos] = useState<ResumenCircuito[]>([]);
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [moneda, setMoneda] = useState<Moneda>("ARS");
  const [tipoCambio, setTipoCambio] = useState<TipoCambio>("oficial");
  // Texto libre: se puede borrar todo y escribir el número a mano.
  const [presupuestoTexto, setPresupuestoTexto] = useState("700000");
  const [personas, setPersonas] = useState(2);
  const [dias, setDias] = useState(3);
  const [obligatorios, setObligatorios] = useState<string[]>([]);
  const [promocionId, setPromocionId] = useState<string | null>(null);

  const [resultado, setResultado] = useState<GenerarPlanResponse | null>(null);
  const [parametrosUsados, setParametrosUsados] = useState<GenerarPlanRequest | null>(null);
  const [elegido, setElegido] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const ultimoPedido = useRef(0);
  const resultadosRef = useRef<HTMLElement>(null);

  function pedirCatalogo() {
    Promise.all([api.puntos(), api.circuitos(), api.promociones()])
      .then(([p, c, pr]) => {
        setPuntos(p);
        setCircuitos(c);
        setPromociones(pr);
      })
      .catch((e: Error) => setErrorCarga(e.message));
  }

  function cargarCatalogo() {
    setErrorCarga(null);
    pedirCatalogo();
  }
  useEffect(pedirCatalogo, []);

  useEffect(() => {
    api.cotizacion(tipoCambio).then(setCotizacion).catch(() => setCotizacion(null));
  }, [tipoCambio]);

  const puntosPorId = useMemo(() => new Map(puntos.map((p) => [p.id, p])), [puntos]);
  const recomendado = circuitos.find((c) => c.recomendada) ?? null;
  const imperdiblesRecomendado = useMemo(
    () => (recomendado?.puntosEnOrden ?? []).filter((id) => puntosPorId.get(id)?.imperdible),
    [recomendado, puntosPorId],
  );

  const presupuesto = Number(presupuestoTexto.replace(/\D/g, ""));

  function cambiarMoneda(nueva: Moneda) {
    if (nueva === moneda) return;
    if (presupuesto > 0 && cotizacion && cotizacion.venta > 0) {
      const convertido = nueva === "USD" ? presupuesto / cotizacion.venta : presupuesto * cotizacion.venta;
      setPresupuestoTexto(String(Math.round(convertido)));
    }
    setMoneda(nueva);
  }

  function alternarPunto(id: string) {
    setObligatorios((actual) => (actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]));
  }

  async function generar(cambios?: Partial<GenerarPlanRequest>) {
    setAviso(null);
    if (!(presupuesto > 0)) {
      setError("Ingresá tu presupuesto total (solo números).");
      return;
    }
    const pedido: GenerarPlanRequest = {
      presupuesto, moneda, tipoCambio, personas, dias, puntosObligatorios: obligatorios, promocionId, ...cambios,
    };
    const numero = ++ultimoPedido.current;
    setCargando(true);
    setError(null);
    resultadosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    try {
      const r = await api.generarPlanes(pedido);
      if (numero !== ultimoPedido.current) return; // respuesta vieja: se descarta (DOC-04A §6)
      setResultado(r);
      setParametrosUsados(pedido);
      setCotizacion(r.cotizacion);
      setElegido(r.candidatos[0]?.plantillaId ?? null);
    } catch (err) {
      if (numero === ultimoPedido.current) {
        setResultado(null);
        setError((err as Error).message);
      }
    } finally {
      if (numero === ultimoPedido.current) setCargando(false);
    }
  }

  function aplicarRecomendado() {
    if (!recomendado) return;
    const nuevosDias = Math.max(dias, recomendado.dias);
    setDias(nuevosDias);
    setObligatorios(imperdiblesRecomendado);
    generar({ dias: nuevosDias, puntosObligatorios: imperdiblesRecomendado });
  }

  function reservar(plan: PlanCandidato) {
    if (!parametrosUsados) return;
    if (sesion?.user?.rol === "COLABORADOR") {
      setAviso("Para reservar necesitás una cuenta de viajero. Tu cuenta es de colaborador.");
      return;
    }
    guardarBorrador(parametrosUsados, plan, resultado?.cotizacion ?? null);
    router.push(sesion?.user ? "/viajero/checkout" : "/ingresar?volver=/viajero/checkout");
  }

  const plan = resultado?.candidatos.find((c) => c.plantillaId === elegido) ?? null;
  const monto = (centavos: number) => formatearMonto(centavos, moneda, resultado?.cotizacion ?? cotizacion);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      {errorCarga && <ErrorBackend mensaje={errorCarga} onReintentar={cargarCatalogo} />}

      {recomendado && (
        <section className="glass grid overflow-hidden rounded-2xl shadow-sm md:grid-cols-[1.1fr_1fr]">
          <div className="grid h-48 grid-cols-3 gap-0.5 md:h-auto">
            {imperdiblesRecomendado.slice(0, 3).map((id) => {
              const p = puntosPorId.get(id)!;
              return <ImagenLugar key={id} busqueda={p.busquedaImagen} alt={p.nombre} region={p.region} className="h-full min-h-48" credito={false} />;
            })}
          </div>
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">¿Primera vez en Jujuy?</p>
            <h1 className="mt-1 text-xl font-bold">{recomendado.nombre}</h1>
            <p className="mt-1 text-sm text-secondary">{recomendado.motivoRecomendacion}</p>
            <p className="mt-2 text-xs text-secondary">
              {recomendado.dias} días · {imperdiblesRecomendado.map((id) => puntosPorId.get(id)?.nombre).join(" · ")}
            </p>
            <button type="button" onClick={aplicarRecomendado}
              className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-md transition hover:bg-primary-hover hover:shadow-lg active:scale-[0.98]">
              Ver el circuito recomendado con mi presupuesto
            </button>
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[23rem_1fr]">
        <form onSubmit={(e) => { e.preventDefault(); generar(); }}
          className="glass h-fit space-y-5 rounded-2xl p-5 shadow-sm lg:sticky lg:top-20">
          <h2 className="text-lg font-bold">Armá tu escapada</h2>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="presupuesto" className="text-sm font-medium">Presupuesto total</label>
              <div className="flex rounded-full bg-surface-mid p-0.5 text-xs font-semibold" role="group" aria-label="Moneda">
                {(["ARS", "USD"] as Moneda[]).map((m) => (
                  <button key={m} type="button" onClick={() => cambiarMoneda(m)} aria-pressed={moneda === m}
                    className={`rounded-full px-3 py-1 ${moneda === m ? "bg-primary text-on-primary" : "text-secondary"}`}>
                    {m === "ARS" ? "Pesos" : "USD"}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-secondary">
                {moneda === "USD" ? "US$" : "$"}
              </span>
              <input
                id="presupuesto"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder={moneda === "USD" ? "500" : "700000"}
                value={presupuestoTexto}
                onChange={(e) => setPresupuestoTexto(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-lg border border-surface-dim py-2 pl-12 pr-10 text-lg font-semibold"
              />
              {presupuestoTexto && (
                <button type="button" aria-label="Borrar presupuesto" onClick={() => setPresupuestoTexto("")}
                  className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full text-secondary hover:bg-surface-high">×</button>
              )}
            </div>
            {presupuesto > 0 && (
              <p className="mt-1 text-xs text-secondary">
                {formatearMonto(presupuesto * 100, "ARS").replace("$", moneda === "USD" ? "US$" : "$")}
                {moneda === "USD" && cotizacion ? ` ≈ ${formatearMonto(presupuesto * cotizacion.venta * 100, "ARS")}` : ""}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-secondary">Dólar:</span>
              {TIPOS_CAMBIO.map((t) => (
                <button key={t} type="button" onClick={() => setTipoCambio(t)}
                  className={`rounded-full border px-2 py-0.5 ${tipoCambio === t ? "border-primary bg-primary-container text-primary" : "border-surface-dim text-secondary"}`}>
                  {NOMBRE_TIPO_CAMBIO[t]}
                </button>
              ))}
            </div>
            {cotizacion && (
              <p className="mt-1 text-xs text-secondary">
                1 USD = {formatearMonto(cotizacion.venta * 100, "ARS")} · {cotizacion.fuente}
                {cotizacion.respaldo ? " (respaldo, no actualizado)" : `, ${formatearFecha(cotizacion.fechaActualizacion)}`}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Contador etiqueta="Personas" valor={personas} min={1} max={20} onChange={setPersonas} />
            <Contador etiqueta="Días" valor={dias} min={1} max={7} onChange={setDias} />
          </div>

          {puntos.length > 0 && (
            <SelectorDestinos puntos={puntos} elegidos={obligatorios} onAlternar={alternarPunto}
              onRecomendar={() => setObligatorios(imperdiblesRecomendado)} />
          )}

          {promociones.length > 0 && (
            <div>
              <label htmlFor="promo" className="text-sm font-medium">Beneficio bancario</label>
              <select id="promo" value={promocionId ?? ""} onChange={(e) => setPromocionId(e.target.value || null)}
                className="mt-2 w-full rounded-lg border border-surface-dim px-3 py-2 text-sm">
                <option value="">Sin beneficio</option>
                {promociones.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              <p className="mt-1 text-xs text-secondary">Promociones de ejemplo, sin convenio real todavía.</p>
            </div>
          )}

          <button type="submit" disabled={cargando}
            className="w-full rounded-full bg-primary py-3 font-semibold text-on-primary shadow-md transition hover:bg-primary-hover hover:shadow-lg active:scale-[0.98] disabled:opacity-60">
            {cargando ? "Calculando…" : "Ver circuitos"}
          </button>
        </form>

        <section ref={resultadosRef} className="scroll-mt-20 space-y-6" aria-live="polite">
          {error && (
            error.includes("conectar") ? <ErrorBackend mensaje={error} onReintentar={() => generar()} /> : (
              <div className="rounded-2xl border border-orange-200 bg-warning-container p-5 text-warning">
                <p className="font-semibold">No pudimos calcular los circuitos</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            )
          )}
          {aviso && <p className="rounded-xl bg-warning-container p-4 text-sm text-warning">{aviso}</p>}

          {cargando && (
            <div className="grid gap-3 md:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-surface-dim">
                  <div className="skeleton h-32 w-full rounded-none" />
                  <div className="space-y-2 p-4">
                    <div className="skeleton h-3 w-24" />
                    <div className="skeleton h-5 w-40" />
                    <div className="skeleton h-6 w-28 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!cargando && !resultado && !error && (
            <div className="rounded-2xl border border-dashed border-surface-dim p-10 text-center text-secondary">
              Escribí tu presupuesto y tocá <strong>Ver circuitos</strong>.
            </div>
          )}

          {!cargando && resultado && resultado.candidatos.length === 0 && (
            <div className="rounded-2xl bg-warning-container p-6 text-warning">
              No hay circuitos para {parametrosUsados?.personas} persona(s) en {parametrosUsados?.dias} día(s). Probá sumar un día.
            </div>
          )}

          {!cargando && resultado && resultado.candidatos.length > 0 && (
            <>
              <p className="text-sm text-secondary">
                {resultado.candidatos.filter((c) => c.calculo.entraEnCota).length} de {resultado.candidatos.length} circuitos entran en tu presupuesto.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {resultado.candidatos.map((c) => (
                  <TarjetaPlan key={c.plantillaId} plan={c} elegido={c.plantillaId === elegido}
                    onElegir={() => setElegido(c.plantillaId)} monto={monto} puntosPorId={puntosPorId} />
                ))}
              </div>
            </>
          )}

          {!cargando && plan && parametrosUsados && (
            <DetallePlan plan={plan} personas={parametrosUsados.personas} monto={monto} onReservar={() => reservar(plan)}
              puntos={plan.puntosEnOrden.map((id) => puntosPorId.get(id)).filter((p): p is Punto => !!p)} />
          )}
        </section>
      </div>
    </div>
  );
}

function ErrorBackend({ mensaje, onReintentar }: { mensaje: string; onReintentar: () => void }) {
  return (
    <div className="rounded-2xl border-2 border-orange-300 bg-warning-container p-5 text-warning">
      <p className="font-semibold">No hay conexión con el servidor de PIRU</p>
      <p className="mt-1 text-sm">{mensaje}</p>
      <p className="mt-2 text-sm">
        Revisá que el backend esté corriendo (en IntelliJ, <code>PiruApplication</code>) y que{" "}
        <a className="underline" href={`${API_URL}/api/puntos`} target="_blank" rel="noreferrer">{API_URL}/api/puntos</a> responda.
      </p>
      <button type="button" onClick={onReintentar} className="mt-3 rounded-lg bg-warning px-4 py-2 text-sm font-semibold text-white">
        Reintentar
      </button>
    </div>
  );
}

function Contador({ etiqueta, valor, min, max, onChange }: {
  etiqueta: string; valor: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <span className="text-sm font-medium">{etiqueta}</span>
      <div className="mt-2 flex items-center justify-between rounded-lg border border-surface-dim px-2 py-1">
        <button type="button" aria-label={`Restar ${etiqueta}`} disabled={valor <= min}
          onClick={() => onChange(valor - 1)} className="h-8 w-8 rounded-full text-lg disabled:opacity-30">−</button>
        <span className="font-semibold">{valor}</span>
        <button type="button" aria-label={`Sumar ${etiqueta}`} disabled={valor >= max}
          onClick={() => onChange(valor + 1)} className="h-8 w-8 rounded-full text-lg disabled:opacity-30">+</button>
      </div>
    </div>
  );
}

function TarjetaPlan({ plan, elegido, onElegir, monto, puntosPorId }: {
  plan: PlanCandidato; elegido: boolean; onElegir: () => void;
  monto: (c: number) => string; puntosPorId: Map<string, Punto>;
}) {
  const portada = plan.puntosEnOrden.map((id) => puntosPorId.get(id)).find((p) => p?.imperdible)
    ?? plan.puntosEnOrden.map((id) => puntosPorId.get(id)).find((p) => p && p.id !== "san_salvador");
  return (
    <button type="button" onClick={onElegir}
      className={`group overflow-hidden rounded-xl border bg-surface-lowest text-left shadow-sm transition hover:shadow-md ${elegido ? "border-primary ring-2 ring-primary-container" : "border-surface-dim hover:border-secondary"}`}>
      <div className="relative">
        {portada && <ImagenLugar busqueda={portada.busquedaImagen} alt={portada.nombre} region={portada.region} className="h-32" />}
        {plan.recomendado && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white shadow">
            Recomendado para tu primera vez
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{plan.region} · {plan.dias}d/{plan.noches}n</p>
            <h3 className="font-semibold">{plan.nombre}</h3>
          </div>
          <p className="text-right font-bold">{monto(plan.calculo.aPagarCentavos)}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <BadgeCota plan={plan} monto={monto} />
          {plan.puntosFaltantes.length > 0 && (
            <span className="rounded-full bg-surface-mid px-2.5 py-1 text-xs text-secondary">
              No incluye: {plan.puntosFaltantes.map((id) => puntosPorId.get(id)?.nombre ?? id).join(", ")}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { ImagenLugar } from "@/components/ImagenLugar";
import { Modal } from "@/components/Modal";
import { api, type Punto } from "@/lib/api";
import { bff } from "@/lib/bffCliente";
import { borrarBorrador, leerBorrador, type BorradorCheckout } from "@/lib/checkout";
import { formatearMonto, NOMBRE_CATEGORIA } from "@/lib/formato";
import { fechaLarga, hoyIso, sumarDias, type VistaViajero } from "@/lib/viajes";

const METODOS = [
  { id: "whatsapp", titulo: "Coordinar con cada prestador", texto: "Te escriben por WhatsApp. Sin cargo de PIRU.", activo: true },
  { id: "mercadopago", titulo: "Seña online", texto: "Próximamente", activo: false },
];

export default function Checkout() {
  const { data: sesion } = useSession();
  const [borrador, setBorrador] = useState<BorradorCheckout | null | undefined>(undefined);
  const [puntos, setPuntos] = useState<Map<string, Punto>>(new Map());

  const [fecha, setFecha] = useState(() => sumarDias(hoyIso(), 14));
  const [telefono, setTelefono] = useState("");
  const [notas, setNotas] = useState("");
  const [metodo, setMetodo] = useState("whatsapp");
  const [acepta, setAcepta] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmada, setConfirmada] = useState<VistaViajero | null>(null);
  const [modalConfirmar, setModalConfirmar] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setBorrador(leerBorrador()));
    api.puntos().then((p) => setPuntos(new Map(p.map((x) => [x.id, x])))).catch(() => undefined);
  }, []);

  const monto = (c: number) => formatearMonto(c, borrador?.parametros.moneda ?? "ARS", borrador?.cotizacion);

  const porCategoria = useMemo(() => {
    const totales = new Map<string, number>();
    borrador?.plan.items.forEach((i) => totales.set(i.categoria, (totales.get(i.categoria) ?? 0) + i.montoCentavos));
    return [...totales.entries()];
  }, [borrador]);

  function intentarConfirmar(e: React.FormEvent) {
    e.preventDefault();
    if (!borrador) return;
    setModalConfirmar(true);
  }

  async function confirmarReserva() {
    if (!borrador) return;
    setModalConfirmar(false);
    setEnviando(true);
    setError(null);
    try {
      const r = await bff<VistaViajero>("solicitudes", {
        method: "POST",
        body: JSON.stringify({
          claveEnvio: borrador.claveEnvio,
          plantillaId: borrador.plan.plantillaId,
          parametros: borrador.parametros,
          fechaViaje: fecha,
          telefono,
          notas,
        }),
      });
      setConfirmada(r);
      borrarBorrador();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  if (borrador === undefined) return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="overflow-hidden rounded-3xl border border-surface-dim lg:grid lg:grid-cols-[1fr_20rem]">
        <div className="space-y-5 p-8">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-7 w-48" />
          <div className="skeleton h-4 w-64" />
          <div className="mt-6 space-y-4">
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-24 w-full" />
            <div className="skeleton h-12 w-full rounded-full" />
          </div>
        </div>
        <div className="skeleton hidden h-full min-h-[400px] rounded-none lg:block" />
      </div>
    </div>
  );

  if (confirmada) return <Confirmacion solicitud={confirmada} monto={monto} />;

  if (!borrador) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-lg font-semibold">No hay un circuito elegido</p>
        <p className="mt-1 text-sm text-secondary">Elegí un circuito y tocá &quot;Reservar este circuito&quot;.</p>
        <Link href="/viajero/armar-viaje" className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 font-semibold text-on-primary">Armar viaje</Link>
      </div>
    );
  }

  const { plan, parametros } = borrador;
  const c = plan.calculo;
  const portada = plan.puntosEnOrden.map((id) => puntos.get(id)).find((p) => p?.imperdible);
  const regreso = sumarDias(fecha, plan.dias - 1);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="overflow-hidden rounded-3xl shadow-lg lg:grid lg:grid-cols-[1fr_20rem]">
        {/* Left — form */}
        <div className="bg-surface-lowest p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Paso 2 de 3</p>
          <h1 className="mt-1 text-2xl font-bold">Completá tu reserva</h1>
          <p className="mt-1 text-sm text-secondary">{plan.nombre} · {plan.dias} días · {parametros.personas} persona(s)</p>

          <form onSubmit={intentarConfirmar} className="mt-6 space-y-5">
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Fecha de viaje</legend>
              <input type="date" required min={hoyIso()} value={fecha} onChange={(e) => setFecha(e.target.value)}
                className="w-full rounded-xl border border-surface-dim bg-surface-lowest px-4 py-2.5 text-sm" />
              {fecha && <p className="text-xs text-secondary">{fechaLarga(fecha)} al {fechaLarga(regreso)}</p>}
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Contacto</legend>
              <div className="rounded-xl bg-surface-low px-4 py-2.5 text-sm">
                {sesion?.user?.name} · {sesion?.user?.email}
              </div>
              <input type="tel" required placeholder="WhatsApp: +54 9 388 ..." value={telefono} onChange={(e) => setTelefono(e.target.value)}
                autoComplete="tel" className="w-full rounded-xl border border-surface-dim bg-surface-lowest px-4 py-2.5 text-sm" />
              <textarea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} maxLength={500}
                placeholder="Notas para los prestadores (opcional)"
                className="w-full rounded-xl border border-surface-dim bg-surface-lowest px-4 py-2.5 text-sm" />
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold">Forma de pago</legend>
              {METODOS.map((m) => (
                <label key={m.id}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${!m.activo ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${metodo === m.id ? "border-primary bg-primary-container/40" : "border-surface-dim"}`}>
                  <input type="radio" name="metodo" value={m.id} disabled={!m.activo} checked={metodo === m.id}
                    onChange={() => setMetodo(m.id)} className="accent-primary" />
                  <span>
                    <span className="font-medium">{m.titulo}</span>
                    <span className="ml-1 text-secondary">{m.texto}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            {/* Summary */}
            <div className="space-y-1.5 border-t border-surface-dim pt-4 text-sm">
              {porCategoria.map(([cat, total]) => (
                <div key={cat} className="flex justify-between"><span className="text-secondary">{NOMBRE_CATEGORIA[cat]}</span><span>{monto(total)}</span></div>
              ))}
              {c.descuentoCentavos > 0 && (
                <div className="flex justify-between text-success"><span>Beneficio bancario</span><span>- {monto(c.descuentoCentavos)}</span></div>
              )}
              <div className="flex justify-between border-t border-surface-dim pt-2 text-lg font-bold">
                <span>Total</span><span>{monto(c.aPagarCentavos)}</span>
              </div>
              <div className="flex justify-between text-xs text-secondary"><span>Por persona</span><span>{monto(c.porPersonaCentavos)}</span></div>
            </div>

            <label className="flex items-start gap-2 text-xs text-secondary">
              <input type="checkbox" required checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-0.5 accent-primary" />
              <span>Entiendo que los montos se confirman con cada prestador y que PIRU comparte mi contacto con los prestadores del circuito.</span>
            </label>

            {error && <p className="rounded-xl bg-warning-container p-3 text-sm text-warning">{error}</p>}

            <button disabled={enviando || !acepta}
              className="w-full rounded-full bg-primary py-3.5 font-semibold text-on-primary shadow-md transition hover:bg-primary-hover hover:shadow-lg active:scale-[0.98] disabled:opacity-50">
              {enviando ? "Enviando..." : "Confirmar reserva"}
            </button>
            <p className="text-center text-xs text-secondary">No se cobra nada ahora</p>
          </form>
        </div>

        {/* Right — image + itinerary */}
        <aside className="relative hidden lg:block">
          <div className="absolute inset-0">
            {portada ? (
              <ImagenLugar busqueda={portada.busquedaImagen} alt={portada.nombre} region={portada.region} className="h-full" credito={false} />
            ) : (
              <div className="h-full bg-gradient-to-b from-[#B84A39] to-[#E09F3E]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
          <div className="relative flex h-full flex-col justify-end p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Tu circuito</p>
            <h2 className="mt-1 text-lg font-bold">{plan.nombre}</h2>
            <ol className="mt-3 space-y-1 text-sm text-white/90">
              {plan.itinerario.map((d) => (
                <li key={d.numero} className="flex gap-2">
                  <span className="font-semibold text-white/60">D{d.numero}</span>
                  <span>{d.titulo}</span>
                </li>
              ))}
            </ol>
            {c.incluyeEstimados && <p className="mt-3 text-xs text-white/60">Incluye montos estimados</p>}
            <Link href="/viajero/armar-viaje" className="mt-3 text-sm font-semibold text-white/80 transition hover:text-white">Cambiar circuito</Link>
          </div>
        </aside>
      </div>

      {/* Mobile summary (shown below form on small screens) */}
      <div className="mt-4 lg:hidden">
        <details className="glass rounded-2xl p-4">
          <summary className="cursor-pointer text-sm font-semibold">Ver itinerario</summary>
          <ol className="mt-3 space-y-1 text-sm">
            {plan.itinerario.map((d) => (
              <li key={d.numero} className="flex gap-2"><span className="font-semibold text-primary">D{d.numero}</span>{d.titulo}</li>
            ))}
          </ol>
          <Link href="/viajero/armar-viaje" className="mt-3 block text-sm font-semibold text-primary">Cambiar circuito</Link>
        </details>
      </div>

      {/* Modal de confirmación */}
      <Modal abierto={modalConfirmar} onCerrar={() => setModalConfirmar(false)}>
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-container">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-bold">Confirmar reserva</h3>
          <p className="mt-2 text-sm text-secondary">
            Vas a enviar la solicitud de <strong>{plan.nombre}</strong> para el {fechaLarga(fecha)} ({parametros.personas} persona{parametros.personas > 1 ? "s" : ""}).
          </p>
          <p className="mt-1 text-sm text-secondary">Total: <strong>{monto(c.aPagarCentavos)}</strong></p>
          <p className="mt-2 text-xs text-secondary">Los prestadores recibirán tu contacto y se comunicarán por WhatsApp. No se cobra nada ahora.</p>
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={() => setModalConfirmar(false)}
              className="flex-1 rounded-full border border-surface-dim py-2.5 font-semibold transition hover:bg-surface-low">
              Cancelar
            </button>
            <button type="button" onClick={confirmarReserva}
              className="flex-1 rounded-full bg-primary py-2.5 font-semibold text-on-primary shadow-md transition hover:bg-primary-hover">
              Confirmar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Confirmacion({ solicitud, monto }: { solicitud: VistaViajero; monto: (c: number) => string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="glass rounded-3xl p-8 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success text-2xl text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold">Solicitud enviada</h1>
        <p className="mt-1 text-sm text-secondary">Codigo {solicitud.id}</p>

        <div className="mt-5 rounded-2xl bg-surface-low p-4 text-left text-sm">
          <p className="font-semibold">{solicitud.circuito.nombre}</p>
          <p className="text-secondary">Salida {fechaLarga(solicitud.fechaViaje)} · {solicitud.personas} persona(s) · {monto(solicitud.circuito.calculo.aPagarCentavos)}</p>
        </div>

        <ol className="mt-5 space-y-2 text-left text-sm">
          <li className="flex gap-2"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-on-primary">1</span>Los prestadores reciben tu solicitud</li>
          <li className="flex gap-2"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-on-primary">2</span>Te escriben por WhatsApp para confirmar</li>
          <li className="flex gap-2"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-on-primary">3</span>Segui el estado en Mis viajes</li>
        </ol>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/viajero/mis-viajes" className="rounded-full bg-primary px-6 py-2.5 font-semibold text-on-primary shadow-md transition hover:shadow-lg">Ver Mis viajes</Link>
          <Link href="/viajero/armar-viaje" className="rounded-full border border-surface-dim px-6 py-2.5 font-semibold transition hover:bg-surface-low">Armar otro viaje</Link>
        </div>
      </div>
    </div>
  );
}

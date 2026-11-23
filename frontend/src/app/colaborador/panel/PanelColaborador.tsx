"use client";

import { useEffect, useMemo, useState } from "react";
import { ImagenLugar } from "@/components/ImagenLugar";
import { IconoPerfil } from "@/components/IconoPerfil";
import { AvatarBlob } from "@/components/AvatarBlob";
import { api, type Oferta, type Punto } from "@/lib/api";
import { bff } from "@/lib/bffCliente";
import { formatearMonto } from "@/lib/formato";
import type { TipoColaborador } from "@/lib/roles";
import { fechaLarga, type EstadoSolicitud } from "@/lib/viajes";

interface VistaSolicitud {
  id: string;
  creadaEn: string;
  fechaViaje: string;
  viajeroNombre: string;
  viajeroTelefono: string;
  personas: number;
  circuito: string;
  puntosEnTuZona: string[];
  notas: string;
  estado: EstadoSolicitud;
}

const CONFIG: Record<TipoColaborador, {
  titulo: string; iconoTipo: string; oferta: string; ejemploTitulo: string; precio: string; capacidad: string; vacio: string;
}> = {
  GUIA: {
    titulo: "Panel del guía", iconoTipo: "guia", oferta: "Excursión o salida", ejemploTitulo: "Ej.: Trekking a la Garganta del Diablo",
    precio: "Precio por persona", capacidad: "Cupo máximo", vacio: "Publica una excursión en un lugar para recibir solicitudes de viajeros que pasan por ahí.",
  },
  HOTEL: {
    titulo: "Panel del hotel", iconoTipo: "hotel", oferta: "Habitación o tarifa", ejemploTitulo: "Ej.: Habitación doble con desayuno",
    precio: "Precio por noche", capacidad: "Huéspedes por habitación", vacio: "Publica una habitación para recibir solicitudes de viajeros que duermen en tu zona.",
  },
  RESTAURANTE: {
    titulo: "Panel del restaurante", iconoTipo: "restaurante", oferta: "Menú o plato", ejemploTitulo: "Ej.: Menú andino de pasos",
    precio: "Precio por cubierto", capacidad: "Cubiertos por turno", vacio: "Publica un menú para recibir solicitudes de viajeros que pasan por tu localidad.",
  },
};

const ESTADO: Record<EstadoSolicitud, { texto: string; clase: string }> = {
  PENDIENTE: { texto: "Nueva", clase: "bg-primary-container text-primary" },
  INFORMADO: { texto: "En contacto", clase: "bg-[#e3f2fd] text-info" },
  CERRADO_FUERA: { texto: "Confirmada", clase: "bg-success-container text-success" },
  DESCARTADO: { texto: "Descartada", clase: "bg-surface-dim text-secondary" },
  VENCIDO: { texto: "Vencida (72 h)", clase: "bg-surface-dim text-secondary" },
  CANCELADO: { texto: "Cancelada por el viajero", clase: "bg-surface-dim text-secondary" },
};

type Pestaña = "solicitudes" | "ofertas" | "publicar";

export function PanelColaborador({ tipo, nombre }: { tipo: TipoColaborador; nombre: string }) {
  const cfg = CONFIG[tipo];
  const [pestaña, setPestaña] = useState<Pestaña>("solicitudes");
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [ofertas, setOfertas] = useState<Oferta[] | null>(null);
  const [solicitudes, setSolicitudes] = useState<VistaSolicitud[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const porId = useMemo(() => new Map(puntos.map((p) => [p.id, p])), [puntos]);

  function pedirTodo() {
    api.puntos().then(setPuntos).catch(() => undefined);
    bff<Oferta[]>("colaboradores/ofertas").then(setOfertas).catch((e: Error) => setError(e.message));
    bff<VistaSolicitud[]>("colaboradores/solicitudes").then(setSolicitudes).catch((e: Error) => setError(e.message));
  }
  function cargar() {
    setError(null);
    pedirTodo();
  }
  useEffect(pedirTodo, []);

  async function responder(id: string, estado: EstadoSolicitud) {
    try {
      const v = await bff<VistaSolicitud>(`colaboradores/solicitudes/${id}/estado`, { method: "POST", body: JSON.stringify({ estado }) });
      setSolicitudes((s) => s?.map((x) => (x.id === id ? v : x)) ?? null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function alternarOferta(o: Oferta) {
    try {
      const nueva = await bff<Oferta>(`colaboradores/ofertas/${o.id}`, { method: "PATCH", body: JSON.stringify({ activa: !o.activa }) });
      setOfertas((l) => l?.map((x) => (x.id === o.id ? nueva : x)) ?? null);
      bff<VistaSolicitud[]>("colaboradores/solicitudes").then(setSolicitudes).catch(() => undefined);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const kpi = {
    nuevas: solicitudes?.filter((s) => s.estado === "PENDIENTE").length ?? 0,
    contacto: solicitudes?.filter((s) => s.estado === "INFORMADO").length ?? 0,
    confirmadas: solicitudes?.filter((s) => s.estado === "CERRADO_FUERA").length ?? 0,
    activas: ofertas?.filter((o) => o.activa).length ?? 0,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AvatarBlob nombre={nombre} size={48} />
          <div>
            <div className="flex items-center gap-2 text-sm text-secondary">
              <IconoPerfil tipo={cfg.iconoTipo} size={16} />
              <span>{cfg.titulo}</span>
            </div>
            <h1 className="text-2xl font-bold">{nombre}</h1>
          </div>
        </div>
        <button onClick={() => setPestaña("publicar")} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary shadow-md transition hover:bg-primary-hover hover:shadow-lg active:scale-[0.98]">
          + Publicar {cfg.oferta.toLowerCase()}
        </button>
      </header>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi etiqueta="Solicitudes nuevas" valor={kpi.nuevas} destacado={kpi.nuevas > 0} />
        <Kpi etiqueta="En contacto" valor={kpi.contacto} />
        <Kpi etiqueta="Confirmadas" valor={kpi.confirmadas} />
        <Kpi etiqueta="Ofertas activas" valor={kpi.activas} />
      </div>

      {error && <p className="mt-4 rounded-xl bg-warning-container p-4 text-sm text-warning">{error} <button className="ml-2 underline" onClick={cargar}>Reintentar</button></p>}

      <nav className="mt-6 flex gap-1 border-b border-surface-dim text-sm font-semibold">
        {(["solicitudes", "ofertas", "publicar"] as Pestaña[]).map((p) => (
          <button key={p} onClick={() => setPestaña(p)}
            className={`-mb-px border-b-2 px-4 py-2 ${pestaña === p ? "border-primary text-primary" : "border-transparent text-secondary"}`}>
            {p === "solicitudes" ? "Solicitudes" : p === "ofertas" ? "Mis ofertas" : "Publicar"}
          </button>
        ))}
      </nav>

      {pestaña === "solicitudes" && (
        <section className="mt-4 space-y-3">
          {solicitudes === null && !error && <div className="h-32 animate-pulse rounded-xl bg-surface-high" />}
          {solicitudes?.length === 0 && (
            <p className="rounded-2xl border border-dashed border-surface-dim p-8 text-center text-sm text-secondary">
              {kpi.activas === 0 ? cfg.vacio : "Todavía no hay viajeros con circuitos que pasen por tus lugares."}
            </p>
          )}
          {solicitudes?.map((s) => {
            const e = ESTADO[s.estado];
            const wa = s.viajeroTelefono.replace(/\D/g, "");
            const texto = encodeURIComponent(`Hola ${s.viajeroNombre}, te escribo de PIRU por tu viaje "${s.circuito}" del ${fechaLarga(s.fechaViaje)}.`);
            return (
              <article key={s.id} className="rounded-xl border border-surface-dim bg-surface-lowest p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{s.viajeroNombre} · {s.personas} persona(s)</p>
                    <p className="text-sm text-secondary">{s.circuito} · salida {fechaLarga(s.fechaViaje)}</p>
                    <p className="text-xs text-secondary">Pasa por: {s.puntosEnTuZona.map((id) => porId.get(id)?.nombre ?? id).join(", ")}</p>
                    {s.notas && <p className="mt-1 text-sm italic">“{s.notas}”</p>}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${e.clase}`}>{e.texto}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  {(s.estado === "PENDIENTE" || s.estado === "INFORMADO") && (
                    <a href={`https://wa.me/${wa}?text=${texto}`} target="_blank" rel="noopener noreferrer"
                      onClick={() => s.estado === "PENDIENTE" && responder(s.id, "INFORMADO")}
                      className="rounded-lg bg-[#25d366] px-3 py-1.5 font-semibold text-white">WhatsApp</a>
                  )}
                  {s.estado === "PENDIENTE" && <Accion onClick={() => responder(s.id, "INFORMADO")}>Marcar como vista</Accion>}
                  {s.estado === "INFORMADO" && <Accion onClick={() => responder(s.id, "CERRADO_FUERA")}>Confirmé por WhatsApp</Accion>}
                  {(s.estado === "PENDIENTE" || s.estado === "INFORMADO") && <Accion onClick={() => responder(s.id, "DESCARTADO")}>Sin disponibilidad</Accion>}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {pestaña === "ofertas" && (
        <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ofertas?.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-surface-dim p-8 text-center text-sm text-secondary">{cfg.vacio}</p>
          )}
          {ofertas?.map((o) => {
            const p = porId.get(o.puntoId);
            return (
              <article key={o.id} className={`overflow-hidden rounded-xl border border-surface-dim bg-surface-lowest ${o.activa ? "" : "opacity-60"}`}>
                {p && <ImagenLugar busqueda={p.busquedaImagen} alt={p.nombre} region={p.region} className="h-28" />}
                <div className="p-4">
                  <p className="text-xs text-secondary">{p?.nombre}</p>
                  <h3 className="font-semibold">{o.titulo}</h3>
                  <p className="mt-1 text-sm">{formatearMonto(o.precioCentavos, "ARS")} <span className="text-secondary">{o.unidadPrecio} · hasta {o.capacidad}</span></p>
                  <button onClick={() => alternarOferta(o)} className="mt-3 text-sm font-semibold text-primary">
                    {o.activa ? "Pausar" : "Reactivar"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {pestaña === "publicar" && (
        <FormularioOferta cfg={cfg} puntos={puntos} onPublicada={(o) => { setOfertas((l) => [o, ...(l ?? [])]); setPestaña("ofertas"); cargar(); }} />
      )}
    </div>
  );
}

function Kpi({ etiqueta, valor, destacado }: { etiqueta: string; valor: number; destacado?: boolean }) {
  return (
    <div className={`rounded-xl p-4 transition ${destacado ? "border border-primary bg-primary-container shadow-sm" : "glass shadow-sm"}`}>
      <p className="text-xs text-secondary">{etiqueta}</p>
      <p className="text-2xl font-bold">{valor}</p>
    </div>
  );
}

function Accion({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className="rounded-lg border border-surface-dim px-3 py-1.5 font-medium hover:bg-surface-low">{children}</button>;
}

function FormularioOferta({ cfg, puntos, onPublicada }: {
  cfg: (typeof CONFIG)[TipoColaborador]; puntos: Punto[]; onPublicada: (o: Oferta) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [puntoId, setPuntoId] = useState("");
  const [precio, setPrecio] = useState("");
  const [capacidad, setCapacidad] = useState("4");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function publicar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const o = await bff<Oferta>("colaboradores/ofertas", {
        method: "POST",
        body: JSON.stringify({ titulo, descripcion, puntoId, precio: Number(precio), capacidad: Number(capacidad) }),
      });
      onPublicada(o);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={publicar} className="mt-4 max-w-xl space-y-4 rounded-2xl border border-surface-dim bg-surface-lowest p-5">
      <label className="block text-sm font-medium">
        {cfg.oferta}
        <input required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={cfg.ejemploTitulo}
          className="mt-1 w-full rounded-lg border border-surface-dim px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Descripción <span className="font-normal text-secondary">(opcional)</span>
        <textarea rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={300}
          className="mt-1 w-full rounded-lg border border-surface-dim px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Lugar
        <select required value={puntoId} onChange={(e) => setPuntoId(e.target.value)} className="mt-1 w-full rounded-lg border border-surface-dim px-3 py-2">
          <option value="">Elegí dónde ofrecés el servicio</option>
          {["Quebrada", "Puna", "Valles", "Yungas"].map((r) => (
            <optgroup key={r} label={r}>
              {puntos.filter((p) => p.region === r).map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </optgroup>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium">
          {cfg.precio} (ARS)
          <input required inputMode="numeric" value={precio} onChange={(e) => setPrecio(e.target.value.replace(/\D/g, ""))}
            placeholder="25000" className="mt-1 w-full rounded-lg border border-surface-dim px-3 py-2" />
        </label>
        <label className="block text-sm font-medium">
          {cfg.capacidad}
          <input required type="number" min={1} value={capacidad} onChange={(e) => setCapacidad(e.target.value)}
            className="mt-1 w-full rounded-lg border border-surface-dim px-3 py-2" />
        </label>
      </div>
      {error && <p className="rounded-lg bg-warning-container p-2 text-sm text-warning">{error}</p>}
      <button disabled={enviando} className="w-full rounded-full bg-primary py-2.5 font-semibold text-on-primary shadow-md transition hover:bg-primary-hover hover:shadow-lg active:scale-[0.98] disabled:opacity-60">
        {enviando ? "Publicando…" : "Publicar"}
      </button>
      <p className="text-xs text-secondary">Vas a recibir las solicitudes de viajeros cuyos circuitos pasan por este lugar.</p>
    </form>
  );
}

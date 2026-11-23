import type { PlanCandidato } from "./api";

export type EstadoViaje = "ENVIADA" | "EN_CONTACTO" | "CONFIRMADA_POR_WHATSAPP" | "CANCELADA";
export type EstadoSolicitud = "PENDIENTE" | "INFORMADO" | "CERRADO_FUERA" | "DESCARTADO" | "VENCIDO" | "CANCELADO";

export interface VistaViajero {
  id: string;
  creadaEn: string;
  fechaViaje: string;
  estado: EstadoViaje;
  circuito: PlanCandidato;
  personas: number;
  respuestas: { colaboradorNombre: string; tipo: "GUIA" | "HOTEL" | "RESTAURANTE"; estado: EstadoSolicitud; actualizadaEn: string }[];
}

export const TEXTO_ESTADO_VIAJE: Record<EstadoViaje, { texto: string; clase: string }> = {
  ENVIADA: { texto: "Enviada a prestadores", clase: "bg-surface-high text-secondary" },
  EN_CONTACTO: { texto: "Prestadores en contacto", clase: "bg-[#e3f2fd] text-info" },
  CONFIRMADA_POR_WHATSAPP: { texto: "Confirmada por WhatsApp", clase: "bg-success-container text-success" },
  CANCELADA: { texto: "Cancelada", clase: "bg-surface-dim text-secondary" },
};

export function fechaLarga(isoFecha: string): string {
  const [a, m, d] = isoFecha.split("-").map(Number);
  return new Intl.DateTimeFormat("es-AR", { weekday: "short", day: "numeric", month: "short" }).format(new Date(a, m - 1, d));
}

export function sumarDias(isoFecha: string, dias: number): string {
  const [a, m, d] = isoFecha.split("-").map(Number);
  const f = new Date(a, m - 1, d + dias);
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;
}

export function hoyIso(): string {
  return sumarDias(new Date().toLocaleDateString("en-CA"), 0);
}

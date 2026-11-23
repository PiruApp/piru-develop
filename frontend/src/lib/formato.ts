import type { Cotizacion, Moneda } from "./api";

/** Muestra un monto del backend (centavos de peso) en la moneda elegida por el viajero. */
export function formatearMonto(centavosArs: number, moneda: Moneda, cotizacion?: Cotizacion | null): string {
  const pesos = centavosArs / 100;
  if (moneda === "USD" && cotizacion && cotizacion.venta > 0) {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
      .format(pesos / cotizacion.venta);
  }
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })
    .format(pesos);
}

export function formatearFecha(iso: string | null): string {
  if (!iso) return "sin fecha";
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
}

export const NOMBRE_TIPO_CAMBIO: Record<string, string> = {
  oficial: "Oficial",
  blue: "Blue",
  bolsa: "MEP",
  contadoconliqui: "CCL",
  tarjeta: "Tarjeta",
  mayorista: "Mayorista",
};

export const NOMBRE_CATEGORIA: Record<string, string> = {
  ALOJAMIENTO: "Alojamiento",
  TRANSPORTE: "Traslados",
  EXCURSION: "Excursiones",
  GASTRONOMIA: "Comidas",
  ENTRADA: "Entradas",
  EXTRA: "Extras",
};

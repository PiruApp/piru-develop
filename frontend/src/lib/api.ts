// Contratos con el backend Spring Boot. Los montos llegan en centavos de peso:
// el backend es la fuente de verdad (DOC-04A §8); acá solo se muestran.

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export type Moneda = "ARS" | "USD";
export type TipoCambio = "oficial" | "blue" | "bolsa" | "contadoconliqui" | "tarjeta" | "mayorista";

export interface Punto {
  id: string;
  nombre: string;
  region: string;
  latitud: number;
  longitud: number;
  altitudMsnm: number;
  descripcion: string;
  imperdible: boolean;
  busquedaImagen: string;
}

export interface ResumenCircuito {
  id: string;
  nombre: string;
  descripcion: string;
  region: string;
  dias: number;
  noches: number;
  puntosEnOrden: string[];
  recomendada: boolean;
  motivoRecomendacion: string | null;
}

export type TipoColaborador = "GUIA" | "HOTEL" | "RESTAURANTE";

export interface Oferta {
  id: string;
  colaboradorEmail: string;
  colaboradorNombre: string;
  tipo: TipoColaborador;
  titulo: string;
  descripcion: string;
  puntoId: string;
  precioCentavos: number;
  unidadPrecio: string;
  capacidad: number;
  activa: boolean;
  creadaEn: string;
}

export interface Promocion {
  id: string;
  nombre: string;
  porcentaje: number;
  topeCentavos: number;
  cuotasSinInteres: number;
  vigenteHasta: string;
}

export interface Cotizacion {
  casa: TipoCambio;
  venta: number;
  fechaActualizacion: string | null;
  fuente: string;
  respaldo: boolean;
}

export interface ItemCalculado {
  id: string;
  dia: number;
  categoria: "ALOJAMIENTO" | "TRANSPORTE" | "EXCURSION" | "GASTRONOMIA" | "ENTRADA" | "EXTRA";
  titulo: string;
  tipoCosto: "ESTIMADO" | "PUBLICADO";
  fuente: string;
  fechaReferencia: string;
  montoCentavos: number;
}

export interface CalculoPresupuesto {
  brutoCentavos: number;
  promocionId: string | null;
  descuentoCentavos: number;
  aPagarCentavos: number;
  porPersonaCentavos: number;
  cotaCentavos: number;
  margenCentavos: number;
  entraEnCota: boolean;
  incluyeEstimados: boolean;
}

export interface DiaPlantilla {
  numero: number;
  titulo: string;
  base: string;
  puntoIds: string[];
}

export interface PlanCandidato {
  plantillaId: string;
  nombre: string;
  descripcion: string;
  region: string;
  dias: number;
  noches: number;
  itinerario: DiaPlantilla[];
  puntosEnOrden: string[];
  items: ItemCalculado[];
  calculo: CalculoPresupuesto;
  puntosFaltantes: string[];
  recomendado: boolean;
  motivoRecomendacion: string | null;
}

export interface GenerarPlanRequest {
  presupuesto: number;
  moneda: Moneda;
  tipoCambio: TipoCambio;
  personas: number;
  dias: number;
  puntosObligatorios: string[];
  promocionId: string | null;
}

export interface GenerarPlanResponse {
  cotizacion: Cotizacion;
  cotaCentavosArs: number;
  candidatos: PlanCandidato[];
}

export async function pedir<T>(ruta: string, init?: RequestInit): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new Error(`No se pudo conectar con el backend en ${API_URL}. ¿Está corriendo?`);
  }
  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => null);
    throw new Error(cuerpo?.error ?? `Error ${respuesta.status} del servidor`);
  }
  return respuesta.json() as Promise<T>;
}

export const api = {
  puntos: () => pedir<Punto[]>("/api/puntos"),
  promociones: () => pedir<Promocion[]>("/api/promociones"),
  circuitos: () => pedir<ResumenCircuito[]>("/api/circuitos"),
  ofertas: (puntoIds: string[]) => pedir<Oferta[]>(`/api/ofertas?puntos=${encodeURIComponent(puntoIds.join(","))}`),
  cotizacion: (casa: TipoCambio) => pedir<Cotizacion>(`/api/cotizaciones/${casa}`),
  generarPlanes: (pedido: GenerarPlanRequest) =>
    pedir<GenerarPlanResponse>("/api/planes/generar", { method: "POST", body: JSON.stringify(pedido) }),
};

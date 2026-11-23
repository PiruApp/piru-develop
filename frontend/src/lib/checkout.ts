import type { Cotizacion, GenerarPlanRequest, PlanCandidato } from "./api";

// El plan elegido viaja al checkout por sessionStorage. El backend lo recalcula igual:
// estos datos solo sirven para mostrar el resumen y para reenviar los parámetros.

export interface BorradorCheckout {
  parametros: GenerarPlanRequest;
  plan: PlanCandidato;
  cotizacion: Cotizacion | null;
  claveEnvio: string;
}

const CLAVE = "piru:checkout";

export function guardarBorrador(parametros: GenerarPlanRequest, plan: PlanCandidato, cotizacion: Cotizacion | null) {
  const borrador: BorradorCheckout = { parametros, plan, cotizacion, claveEnvio: crypto.randomUUID() };
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(borrador));
  } catch {
    /* modo privado sin storage: el checkout pedirá volver a elegir */
  }
}

export function leerBorrador(): BorradorCheckout | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    return crudo ? (JSON.parse(crudo) as BorradorCheckout) : null;
  } catch {
    return null;
  }
}

export function borrarBorrador() {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {
    /* sin storage */
  }
}

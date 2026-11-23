import { sesionActual } from "@/lib/sesion";
import { PanelColaborador } from "./PanelColaborador";

// Lee la sesión en cada pedido: la ruta se resuelve en el servidor sin static shell.
export const instant = false;

export default async function Panel() {
  const sesion = await sesionActual();
  // El layout ya garantiza que es colaborador con tipo.
  return <PanelColaborador tipo={sesion!.user.tipo!} nombre={sesion!.user.name ?? ""} />;
}

import { redirect } from "next/navigation";
import { sesionActual } from "@/lib/sesion";
import { inicioSegunRol } from "@/lib/roles";

// Lee la sesión en cada pedido: la ruta se resuelve en el servidor sin static shell.
export const instant = false;

/** Checkout y Mis viajes requieren una cuenta de viajero. */
export default async function LayoutCuentaViajero({ children }: { children: React.ReactNode }) {
  const sesion = await sesionActual();
  if (!sesion?.user) redirect("/ingresar?volver=/viajero/checkout");
  if (sesion.user.rol !== "VIAJERO") redirect(inicioSegunRol(sesion.user.rol));
  return <>{children}</>;
}

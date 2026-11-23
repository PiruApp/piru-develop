import { redirect } from "next/navigation";
import { sesionActual } from "@/lib/sesion";
import { inicioSegunRol } from "@/lib/roles";

// Lee la sesión en cada pedido: la ruta se resuelve en el servidor sin static shell.
export const instant = false;

/** Destino común después de ingresar: manda a cada usuario a su inicio según el rol. */
export default async function DespuesDeIngresar() {
  const sesion = await sesionActual();
  if (!sesion?.user) redirect("/ingresar");
  redirect(inicioSegunRol(sesion.user.rol));
}

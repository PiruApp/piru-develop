import { redirect } from "next/navigation";
import { sesionActual } from "@/lib/sesion";
import { inicioSegunRol } from "@/lib/roles";

// Lee la sesión en cada pedido: la ruta se resuelve en el servidor sin static shell.
export const instant = false;

export default async function LayoutColaborador({ children }: { children: React.ReactNode }) {
  const sesion = await sesionActual();
  if (!sesion?.user) redirect("/ingresar?volver=/colaborador/panel");
  if (sesion.user.rol !== "COLABORADOR" || !sesion.user.tipo) redirect(inicioSegunRol(sesion.user.rol));
  return <>{children}</>;
}

import { redirect } from "next/navigation";
import { sesionActual } from "@/lib/sesion";
import { inicioSegunRol } from "@/lib/roles";
import { ElegirPerfil } from "./ElegirPerfil";

// Lee la sesión en cada pedido: la ruta se resuelve en el servidor sin static shell.
export const instant = false;

export default async function Bienvenida() {
  const sesion = await sesionActual();
  if (!sesion?.user) redirect("/ingresar");
  if (sesion.user.rol) redirect(inicioSegunRol(sesion.user.rol));

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold">¡Hola, {sesion.user.name?.split(" ")[0]}!</h1>
      <p className="mt-1 text-sm text-secondary">Último paso: contanos cómo vas a usar PIRU. No se puede cambiar después.</p>
      <div className="mt-6 rounded-2xl border border-surface-dim bg-surface-lowest p-5">
        <ElegirPerfil />
      </div>
    </div>
  );
}

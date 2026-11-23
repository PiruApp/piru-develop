import { redirect } from "next/navigation";
import { sesionActual } from "@/lib/sesion";
import { PerfilUsuario } from "./PerfilUsuario";

export const instant = false;

export default async function Perfil() {
  const sesion = await sesionActual();
  if (!sesion?.user) redirect("/ingresar?volver=/perfil");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PerfilUsuario />
    </div>
  );
}

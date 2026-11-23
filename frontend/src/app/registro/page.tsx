import { redirect } from "next/navigation";
import { googleHabilitado } from "@/auth";
import { sesionActual } from "@/lib/sesion";
import { inicioSegunRol } from "@/lib/roles";
import { BotonGoogle } from "@/components/BotonGoogle";
import { FormularioRegistro } from "./FormularioRegistro";
import { PanelAuth } from "@/components/PanelAuth";

export const instant = false;

export default async function Registro() {
  const sesion = await sesionActual();
  if (sesion?.user) redirect(inicioSegunRol(sesion.user.rol));

  return (
    <PanelAuth pestanaActiva="registro">
      <h2 className="text-2xl font-bold">Crear cuenta</h2>
      <p className="mt-1 text-sm text-secondary">Registrate para empezar a planificar tu viaje.</p>

      <div className="mt-6 space-y-4">
        {googleHabilitado && (
          <>
            <BotonGoogle destino="/despues-de-ingresar" />
            <p className="text-center text-xs text-secondary">Con Google elegís tu perfil en el paso siguiente.</p>
            <div className="flex items-center gap-3 text-xs text-secondary">
              <span className="h-px flex-1 bg-surface-dim" />O<span className="h-px flex-1 bg-surface-dim" />
            </div>
          </>
        )}
        <FormularioRegistro />
      </div>
    </PanelAuth>
  );
}

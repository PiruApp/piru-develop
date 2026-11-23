import { redirect } from "next/navigation";
import { googleHabilitado } from "@/auth";
import { sesionActual } from "@/lib/sesion";
import { inicioSegunRol } from "@/lib/roles";
import { BotonGoogle } from "@/components/BotonGoogle";
import { FormularioIngreso } from "./FormularioIngreso";
import { PanelAuth } from "@/components/PanelAuth";

export const instant = false;

export default async function Ingresar({ searchParams }: { searchParams: Promise<{ volver?: string }> }) {
  const sesion = await sesionActual();
  const { volver } = await searchParams;
  const destino = typeof volver === "string" && volver.startsWith("/") ? volver : "/despues-de-ingresar";
  if (sesion?.user) redirect(inicioSegunRol(sesion.user.rol));

  return (
    <PanelAuth pestanaActiva="ingresar">
      <h2 className="text-2xl font-bold">Bienvenido</h2>
      <p className="mt-1 text-sm text-secondary">Ingresá con tu cuenta para continuar.</p>

      <div className="mt-6 space-y-4">
        {googleHabilitado && (
          <>
            <BotonGoogle destino="/despues-de-ingresar" />
            <div className="flex items-center gap-3 text-xs text-secondary">
              <span className="h-px flex-1 bg-surface-dim" />O<span className="h-px flex-1 bg-surface-dim" />
            </div>
          </>
        )}
        <FormularioIngreso destino={destino} />
      </div>
    </PanelAuth>
  );
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { asignarPerfil, ErrorRegistro } from "@/lib/usuarios";
import { perfilDesdeValor } from "@/lib/roles";

/** Quien entró con Google elige si es viajero o qué tipo de colaborador. Solo se puede elegir una vez. */
export async function POST(request: Request) {
  const sesion = await auth();
  if (!sesion?.user?.email) return NextResponse.json({ error: "Iniciá sesión" }, { status: 401 });
  const cuerpo = await request.json().catch(() => null);
  const perfil = perfilDesdeValor(String(cuerpo?.perfil ?? ""));
  if (!perfil) return NextResponse.json({ error: "Elegí cómo vas a usar PIRU" }, { status: 400 });
  try {
    const u = asignarPerfil(sesion.user.email, perfil.rol, perfil.tipo);
    return NextResponse.json({ rol: u.rol, tipo: u.tipo });
  } catch (e) {
    if (e instanceof ErrorRegistro) return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}

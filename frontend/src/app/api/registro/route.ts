import { NextResponse } from "next/server";
import { ErrorRegistro, registrar } from "@/lib/usuarios";
import { perfilDesdeValor } from "@/lib/roles";

export async function POST(request: Request) {
  const cuerpo = await request.json().catch(() => null);
  const perfil = perfilDesdeValor(String(cuerpo?.perfil ?? ""));
  if (!perfil) return NextResponse.json({ error: "Elegí cómo vas a usar PIRU" }, { status: 400 });
  try {
    const u = await registrar({
      nombre: String(cuerpo?.nombre ?? ""),
      email: String(cuerpo?.email ?? ""),
      password: String(cuerpo?.password ?? ""),
      rol: perfil.rol,
      tipo: perfil.tipo,
    });
    return NextResponse.json({ email: u.email }, { status: 201 });
  } catch (e) {
    if (e instanceof ErrorRegistro) return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Rol } from "@/lib/roles";

// BFF: el navegador llama acá y Next.js reenvía al backend Spring con la clave interna
// y la identidad de la sesión. El navegador nunca ve la clave ni puede inventar la identidad.

const BACKEND = process.env.PIRU_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const PERMISOS: { prefijo: string; rol: Rol }[] = [
  { prefijo: "solicitudes", rol: "VIAJERO" },
  { prefijo: "colaboradores", rol: "COLABORADOR" },
];

async function reenviar(request: Request, { params }: { params: Promise<{ ruta: string[] }> }) {
  const { ruta } = await params;
  const permiso = PERMISOS.find((p) => ruta[0] === p.prefijo);
  if (!permiso) return NextResponse.json({ error: "Ruta no disponible" }, { status: 404 });

  const sesion = await auth();
  if (!sesion?.user?.email) return NextResponse.json({ error: "Iniciá sesión para continuar" }, { status: 401 });
  if (sesion.user.rol !== permiso.rol) {
    return NextResponse.json({ error: "Tu tipo de cuenta no tiene acceso a esta sección" }, { status: 403 });
  }
  const clave = process.env.PIRU_BFF_CLAVE;
  if (!clave) return NextResponse.json({ error: "Falta PIRU_BFF_CLAVE en frontend/.env.local" }, { status: 500 });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Piru-Clave": clave,
    "X-Piru-Email": sesion.user.email,
    "X-Piru-Nombre": encodeURIComponent(sesion.user.name ?? ""),
    "X-Piru-Rol": sesion.user.rol ?? "",
  };
  if (sesion.user.tipo) headers["X-Piru-Tipo"] = sesion.user.tipo;

  const destino = `${BACKEND}/api/${ruta.map(encodeURIComponent).join("/")}`;
  try {
    const respuesta = await fetch(destino, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.text(),
      cache: "no-store",
    });
    const cuerpo = await respuesta.text();
    return new NextResponse(cuerpo || null, {
      status: respuesta.status,
      headers: { "Content-Type": respuesta.headers.get("Content-Type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ error: `No se pudo conectar con el backend en ${BACKEND}. ¿Está corriendo?` }, { status: 502 });
  }
}

export { reenviar as GET, reenviar as POST, reenviar as PATCH };

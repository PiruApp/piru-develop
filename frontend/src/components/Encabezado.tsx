import Link from "next/link";
import { signOut } from "@/auth";
import { sesionActual } from "@/lib/sesion";
import { NOMBRE_TIPO } from "@/lib/roles";
import { AvatarBlob } from "./AvatarBlob";
import { LogoPiru } from "./LogoPiru";
import { ToggleTema } from "./ToggleTema";

export async function Encabezado() {
  const sesion = await sesionActual();
  const u = sesion?.user;

  return (
    <header className="glass sticky top-0 z-[1000]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <LogoPiru size={28} />
          <span className="text-xl font-extrabold tracking-tight">PIRU</span>
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <ToggleTema />
          {u?.rol === "VIAJERO" && (
            <>
              <Link href="/viajero/armar-viaje" className="hidden rounded-full px-3 py-1.5 transition hover:bg-surface-high sm:inline">Armar viaje</Link>
              <Link href="/viajero/mis-viajes" className="rounded-full px-3 py-1.5 transition hover:bg-surface-high">Mis viajes</Link>
            </>
          )}
          {u?.rol === "COLABORADOR" && (
            <Link href="/colaborador/panel" className="rounded-full px-3 py-1.5 transition hover:bg-surface-high">
              Panel {u.tipo ? `· ${NOMBRE_TIPO[u.tipo]}` : ""}
            </Link>
          )}
          {!u && (
            <Link href="/viajero/armar-viaje" className="hidden rounded-full px-3 py-1.5 transition hover:bg-surface-high sm:inline">Armar viaje</Link>
          )}
          {u ? (
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }} className="flex items-center gap-2">
              <Link href="/perfil" className="flex items-center gap-2 rounded-full px-2 py-1 transition hover:bg-surface-high">
                <AvatarBlob nombre={u.name ?? ""} size={28} />
                <span className="hidden max-w-32 truncate text-secondary md:inline" title={u.email ?? ""}>{u.name}</span>
              </Link>
              <button className="rounded-full border border-surface-dim px-3 py-1.5 transition hover:bg-surface-high">Salir</button>
            </form>
          ) : (
            <Link href="/ingresar" className="rounded-full bg-primary px-4 py-2 font-semibold text-on-primary transition hover:bg-primary-hover">Ingresar</Link>
          )}
        </div>
      </nav>
    </header>
  );
}

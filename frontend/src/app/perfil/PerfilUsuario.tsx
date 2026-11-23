"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { AvatarBlob } from "@/components/AvatarBlob";
import { IconoPerfil } from "@/components/IconoPerfil";
import { NOMBRE_TIPO, TEMA_ROL } from "@/lib/roles";
import type { TipoColaborador } from "@/lib/roles";

export function PerfilUsuario() {
  const { data: sesion } = useSession();
  const u = sesion?.user;
  if (!u) return null;

  const rol = u.rol as string | null;
  const tipo = (u as { tipo?: TipoColaborador }).tipo ?? null;
  const tema = tipo ? TEMA_ROL[tipo] : rol ? TEMA_ROL[rol] : "viajero";

  return (
    <div className="space-y-6">
      <div className="glass overflow-hidden rounded-2xl shadow-sm">
        <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5" />
        <div className="relative px-6 pb-6">
          <div className="-mt-12 flex items-end gap-4">
            <div className="rounded-2xl bg-surface-lowest p-1 shadow-md">
              <AvatarBlob nombre={u.name ?? "U"} size={80} />
            </div>
            <div className="pb-1">
              <h1 className="text-2xl font-bold">{u.name}</h1>
              <p className="text-sm text-secondary">{u.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Tipo de cuenta</p>
          <div className="mt-2 flex items-center gap-2">
            <IconoPerfil tipo={tema} size={24} />
            <span className="text-lg font-semibold">
              {tipo ? NOMBRE_TIPO[tipo] : rol === "VIAJERO" ? "Viajero" : "Sin rol"}
            </span>
          </div>
        </div>

        <div className="glass rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Estado</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-success" />
            <span className="text-lg font-semibold">Cuenta activa</span>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold">Accesos rápidos</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {rol === "VIAJERO" && (
            <>
              <AccesoRapido href="/viajero/armar-viaje" titulo="Armar viaje" desc="Elegí un circuito por Jujuy" />
              <AccesoRapido href="/viajero/mis-viajes" titulo="Mis viajes" desc="Revisá tus reservas" />
            </>
          )}
          {rol === "COLABORADOR" && (
            <AccesoRapido href="/colaborador/panel" titulo="Mi panel" desc="Ofertas y solicitudes" />
          )}
        </div>
      </div>
    </div>
  );
}

function AccesoRapido({ href, titulo, desc }: { href: string; titulo: string; desc: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg border border-surface-dim bg-surface-lowest p-3 transition hover:border-primary hover:shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold">{titulo}</p>
        <p className="text-xs text-secondary">{desc}</p>
      </div>
    </Link>
  );
}

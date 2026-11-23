"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { TEMA_ROL } from "@/lib/roles";

export function TemaRol() {
  const { data: sesion } = useSession();
  const rol = sesion?.user?.rol;
  const tipo = (sesion?.user as { tipo?: string } | undefined)?.tipo;

  useEffect(() => {
    const tema = tipo ? TEMA_ROL[tipo] : rol ? TEMA_ROL[rol] : undefined;
    if (tema) {
      document.documentElement.setAttribute("data-theme", tema);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    return () => document.documentElement.removeAttribute("data-theme");
  }, [rol, tipo]);

  return null;
}

"use client";

import { useEffect, useState } from "react";

type Modo = "system" | "light" | "dark";

function iconoModo(modo: Modo) {
  if (modo === "dark") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  if (modo === "light") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

const SIGUIENTE: Record<Modo, Modo> = { system: "light", light: "dark", dark: "system" };
const ETIQUETA: Record<Modo, string> = { system: "Sistema", light: "Claro", dark: "Oscuro" };

export function ToggleTema() {
  const [modo, setModo] = useState<Modo>("system");

  useEffect(() => {
    try {
      const guardado = localStorage.getItem("piru-mode") as Modo | null;
      if (guardado && (guardado === "light" || guardado === "dark")) {
        setModo(guardado);
        document.documentElement.setAttribute("data-mode", guardado);
      }
    } catch {}
  }, []);

  function cambiar() {
    const nuevo = SIGUIENTE[modo];
    setModo(nuevo);
    if (nuevo === "system") {
      document.documentElement.removeAttribute("data-mode");
      try { localStorage.removeItem("piru-mode"); } catch {}
    } else {
      document.documentElement.setAttribute("data-mode", nuevo);
      try { localStorage.setItem("piru-mode", nuevo); } catch {}
    }
  }

  return (
    <button
      type="button"
      onClick={cambiar}
      title={`Modo: ${ETIQUETA[modo]}`}
      className="flex h-9 w-9 items-center justify-center rounded-full text-secondary transition hover:bg-surface-high"
    >
      {iconoModo(modo)}
    </button>
  );
}

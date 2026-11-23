import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { Encabezado } from "@/components/Encabezado";
import { LogoPiru } from "@/components/LogoPiru";
import { Proveedores } from "@/components/Proveedores";
import { TemaRol } from "@/components/TemaRol";

export const metadata: Metadata = {
  title: "PIRU · Tu viaje a Jujuy empieza con tu presupuesto",
  description: "Elegí un circuito por Jujuy que entre en tu presupuesto, en pesos o en dólares.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Proveedores>
          <TemaRol />
          <Suspense fallback={<EncabezadoCargando />}>
            <Encabezado />
          </Suspense>
        <main className="flex-1">{children}</main>
        <footer className="px-4 py-6 text-center text-xs text-secondary">
          Precios de referencia a validar con agencias locales. PIRU · Jujuy
        </footer>
        </Proveedores>
      </body>
    </html>
  );
}

function EncabezadoCargando() {
  return (
    <header className="glass sticky top-0 z-[1000]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <LogoPiru size={28} />
          <span className="text-xl font-extrabold tracking-tight">PIRU</span>
        </Link>
        <span className="skeleton h-9 w-24 rounded-full" />
      </nav>
    </header>
  );
}

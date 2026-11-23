"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LogoPiru } from "./LogoPiru";

const PESTANAS = [
  { id: "ingresar", label: "Ingresar", href: "/ingresar" },
  { id: "registro", label: "Registrarse", href: "/registro" },
] as const;

export function PanelAuth({ pestanaActiva, children }: { pestanaActiva: "ingresar" | "registro"; children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-surface-lowest shadow-xl lg:grid lg:grid-cols-2">
        {/* Left — form */}
        <div className="flex flex-col justify-center px-6 py-8 sm:px-10 lg:px-12 lg:py-12">
          <div className="mx-auto w-full max-w-sm">
            {/* Tabs */}
            <div className="flex gap-1 rounded-full bg-surface-mid p-1">
              {PESTANAS.map((t) => (
                <Link
                  key={t.id}
                  href={t.href}
                  className={`flex-1 rounded-full py-2 text-center text-sm font-semibold transition ${
                    pestanaActiva === t.id
                      ? "bg-surface-lowest text-text shadow-sm"
                      : "text-secondary hover:text-text"
                  }`}
                >
                  {t.label}
                </Link>
              ))}
            </div>

            <div className="mt-6">{children}</div>
          </div>
        </div>

        {/* Right — image */}
        <div className="relative hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-[#B84A39] via-[#2D3142] to-[#E09F3E]" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1604254404846-3b0b51423e3a?w=800&q=80')] bg-cover bg-center mix-blend-overlay opacity-40" />
          <div className="relative flex h-full flex-col items-center justify-center p-10 text-white">
            <LogoPiru size={56} />
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight">PIRU</h2>
            <p className="mt-2 text-center text-sm text-white/80">Tu viaje a Jujuy empieza con tu presupuesto</p>

            {/* Glass testimonial */}
            <div className="mt-8 w-full max-w-xs rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-sm leading-relaxed text-white/90">
                &ldquo;Armé un circuito por la Quebrada y la Puna para dos personas en 10 minutos. Los prestadores me contactaron el mismo día.&rdquo;
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">MR</div>
                <div>
                  <p className="text-sm font-semibold">Martín R.</p>
                  <p className="text-xs text-white/60">Viajero · Buenos Aires</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

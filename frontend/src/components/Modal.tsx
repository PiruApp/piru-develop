"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function Modal({ abierto, onCerrar, children }: { abierto: boolean; onCerrar: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (abierto && !el.open) el.showModal();
    else if (!abierto && el.open) el.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      onClick={(e) => { if (e.target === ref.current) onCerrar(); }}
      className="m-auto max-w-lg w-[calc(100%-2rem)] rounded-2xl border-none bg-transparent p-0 backdrop:bg-black/40 backdrop:backdrop-blur-sm open:animate-[modal-in_200ms_ease-out]"
    >
      <div className="glass rounded-2xl p-6 shadow-xl">
        {children}
      </div>
    </dialog>
  );
}

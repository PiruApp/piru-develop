"use client";

import { useEffect, useState } from "react";

// Fotos con licencia libre de Wikipedia/Wikimedia Commons, buscadas por nombre del lugar.
// Si no hay foto o la API no responde, se muestra un fondo de color por región.

interface Foto {
  url: string;
  pagina: string;
}

const cache = new Map<string, Promise<Foto | null>>();

function buscarFoto(busqueda: string): Promise<Foto | null> {
  const enCache = cache.get(busqueda);
  if (enCache) return enCache;
  const url =
    "https://es.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrlimit=1" +
    "&prop=pageimages&piprop=thumbnail&pithumbsize=800&gsrsearch=" + encodeURIComponent(busqueda);
  const promesa = fetch(url)
    .then((r) => (r.ok ? r.json() : null))
    .then((datos) => {
      const paginas = datos?.query?.pages ? Object.values(datos.query.pages) as { pageid: number; thumbnail?: { source: string } }[] : [];
      const p = paginas.find((x) => x.thumbnail?.source);
      return p ? { url: p.thumbnail!.source, pagina: `https://es.wikipedia.org/?curid=${p.pageid}` } : null;
    })
    .catch(() => null);
  cache.set(busqueda, promesa);
  return promesa;
}

const FONDO_REGION: Record<string, string> = {
  Quebrada: "from-[#b84a39] to-[#e6a15a]",
  Puna: "from-[#7aa6c2] to-[#e9e1d8]",
  Valles: "from-[#4f7d4a] to-[#a9c48b]",
  Yungas: "from-[#2e5e3a] to-[#6fa06a]",
};

export function ImagenLugar({ busqueda, alt, region, className = "", credito = true }: {
  busqueda: string; alt: string; region?: string; className?: string; credito?: boolean;
}) {
  const [foto, setFoto] = useState<Foto | null | undefined>(undefined);

  useEffect(() => {
    let vigente = true;
    buscarFoto(busqueda).then((f) => vigente && setFoto(f));
    return () => {
      vigente = false;
    };
  }, [busqueda]);

  const fondo = FONDO_REGION[region ?? ""] ?? "from-[#825345] to-[#e1d9d0]";

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${fondo} ${className}`}>
      {foto === undefined && <div className="absolute inset-0 animate-pulse bg-white/20" />}
      {foto && (
        // eslint-disable-next-line @next/next/no-img-element -- imágenes externas de Wikimedia, sin optimización
        <img src={foto.url} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {foto && credito && (
        <a href={foto.pagina} target="_blank" rel="noopener noreferrer"
          className="absolute bottom-1 right-1 rounded bg-black/45 px-1.5 py-0.5 text-[10px] text-white/90 hover:bg-black/60"
          onClick={(e) => e.stopPropagation()}>
          Foto: Wikimedia
        </a>
      )}
    </div>
  );
}

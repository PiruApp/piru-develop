import Link from "next/link";

const REGIONES = [
  { nombre: "Quebrada", texto: "Purmamarca, Tilcara, Humahuaca y el Hornocal." },
  { nombre: "Puna", texto: "Salinas Grandes, Cuesta de Lipán y Pozuelos." },
  { nombre: "Yungas", texto: "Calilegua y termas en la selva." },
  { nombre: "Valles", texto: "Diques, Yala y Termas de Reyes cerca de la capital." },
];

export default function Inicio() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <section className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Escapadas por Jujuy</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">
          Tu viaje a Jujuy empieza con tu presupuesto.
        </h1>
        <p className="mt-4 text-base text-secondary md:text-lg leading-relaxed">
          Contanos cuánto querés gastar, en pesos o en dólares, y te mostramos circuitos que recorren varios
          lugares en un solo viaje, con el desglose de costos y el recorrido en el mapa.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/viajero/armar-viaje"
            className="inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-on-primary shadow-md transition hover:bg-primary-hover hover:shadow-lg active:scale-[0.98]"
          >
            Armar mi escapada
          </Link>
          <Link href="/registro" className="inline-flex rounded-full border border-surface-dim px-6 py-3 font-semibold transition hover:bg-surface-low">
            Soy guia, hotel o restaurante
          </Link>
        </div>
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {REGIONES.map((r) => (
          <div key={r.nombre} className="glass rounded-xl p-5 shadow-sm transition hover:shadow-md">
            <h2 className="font-semibold text-primary">{r.nombre}</h2>
            <p className="mt-1 text-sm text-secondary">{r.texto}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

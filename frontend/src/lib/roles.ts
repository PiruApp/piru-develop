// Roles compartidos entre cliente y servidor (sin dependencias de Node).

export type Rol = "VIAJERO" | "COLABORADOR";
export type TipoColaborador = "GUIA" | "HOTEL" | "RESTAURANTE";

export interface PerfilElegido {
  rol: Rol;
  tipo: TipoColaborador | null;
}

export const OPCIONES_PERFIL: { valor: string; rol: Rol; tipo: TipoColaborador | null; titulo: string; texto: string; icono: string }[] = [
  { valor: "VIAJERO", rol: "VIAJERO", tipo: null, titulo: "Viajero", texto: "Armo escapadas según mi presupuesto.", icono: "viajero" },
  { valor: "GUIA", rol: "COLABORADOR", tipo: "GUIA", titulo: "Guía turístico", texto: "Ofrezco excursiones y trekking.", icono: "guia" },
  { valor: "HOTEL", rol: "COLABORADOR", tipo: "HOTEL", titulo: "Dueño de hotel", texto: "Ofrezco habitaciones y alojamiento.", icono: "hotel" },
  { valor: "RESTAURANTE", rol: "COLABORADOR", tipo: "RESTAURANTE", titulo: "Dueño de restaurante", texto: "Ofrezco menús y comidas regionales.", icono: "restaurante" },
];

export const TEMA_ROL: Record<string, string> = {
  VIAJERO: "viajero",
  GUIA: "guia",
  HOTEL: "hotel",
  RESTAURANTE: "restaurante",
};

export function perfilDesdeValor(valor: string): PerfilElegido | null {
  const o = OPCIONES_PERFIL.find((x) => x.valor === valor);
  return o ? { rol: o.rol, tipo: o.tipo } : null;
}

export function inicioSegunRol(rol: Rol | null | undefined): string {
  if (rol === "COLABORADOR") return "/colaborador/panel";
  if (rol === "VIAJERO") return "/viajero/armar-viaje";
  return "/bienvenida";
}

export const NOMBRE_TIPO: Record<TipoColaborador, string> = {
  GUIA: "Guía turístico",
  HOTEL: "Hotel",
  RESTAURANTE: "Restaurante",
};

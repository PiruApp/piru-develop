import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Rol, TipoColaborador } from "./roles";

// Usuarios de Auth.js en SQLite (incluido en Node 22+). Archivo local ignorado por git.
// Para producción se migra a MySQL junto con el resto de los datos (DOC-04A §4).

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: Rol | null;
  tipo: TipoColaborador | null;
  proveedor: "credenciales" | "google";
}

interface Fila extends Usuario {
  password_hash: string | null;
}

// Hash real de una contraseña descartable: iguala el tiempo de respuesta cuando el email no existe.
const HASH_DE_RELLENO = bcrypt.hashSync("piru-relleno-no-es-una-contraseña", 10);

const RUTA = process.env.PIRU_DB_PATH ?? ".data/piru.db";
let db: DatabaseSync | null = null;

function base(): DatabaseSync {
  if (db) return db;
  mkdirSync(dirname(RUTA), { recursive: true });
  db = new DatabaseSync(RUTA);
  db.exec(`CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    password_hash TEXT,
    rol TEXT CHECK (rol IN ('VIAJERO','COLABORADOR')),
    tipo TEXT CHECK (tipo IN ('GUIA','HOTEL','RESTAURANTE')),
    proveedor TEXT NOT NULL,
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  return db;
}

function aUsuario(f: Fila | undefined): Usuario | null {
  if (!f) return null;
  return { id: f.id, email: f.email, nombre: f.nombre, rol: f.rol, tipo: f.tipo, proveedor: f.proveedor };
}

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function buscarPorEmail(email: string): Usuario | null {
  const f = base().prepare("SELECT * FROM usuarios WHERE email = ?").get(normalizarEmail(email)) as Fila | undefined;
  return aUsuario(f);
}

export class ErrorRegistro extends Error {}

export async function registrar(datos: {
  nombre: string; email: string; password: string; rol: Rol; tipo: TipoColaborador | null;
}): Promise<Usuario> {
  const email = normalizarEmail(datos.email);
  const nombre = datos.nombre.trim();
  if (nombre.length < 2) throw new ErrorRegistro("Ingresá tu nombre");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ErrorRegistro("Ingresá un email válido");
  if (datos.password.length < 8) throw new ErrorRegistro("La contraseña debe tener al menos 8 caracteres");
  if (datos.rol === "COLABORADOR" && !datos.tipo) throw new ErrorRegistro("Elegí qué tipo de colaborador sos");
  if (buscarPorEmail(email)) throw new ErrorRegistro("Ya existe una cuenta con ese email");

  const hash = await bcrypt.hash(datos.password, 10);
  const id = randomUUID();
  base()
    .prepare("INSERT INTO usuarios (id, email, nombre, password_hash, rol, tipo, proveedor) VALUES (?, ?, ?, ?, ?, ?, 'credenciales')")
    .run(id, email, nombre, hash, datos.rol, datos.rol === "COLABORADOR" ? datos.tipo : null);
  return buscarPorEmail(email)!;
}

/** Devuelve el usuario si email y contraseña coinciden. Mismo tiempo de respuesta exista o no la cuenta. */
export async function verificarCredenciales(email: string, password: string): Promise<Usuario | null> {
  const f = base().prepare("SELECT * FROM usuarios WHERE email = ?").get(normalizarEmail(email)) as Fila | undefined;
  const hash = f?.password_hash ?? HASH_DE_RELLENO;
  const ok = await bcrypt.compare(password, hash);
  return ok && f?.password_hash ? aUsuario(f) : null;
}

/** Alta o búsqueda de quien entra con Google. Queda sin rol hasta que lo elija en /bienvenida. */
export function asegurarUsuarioGoogle(email: string, nombre: string): Usuario {
  const existente = buscarPorEmail(email);
  if (existente) return existente;
  base()
    .prepare("INSERT INTO usuarios (id, email, nombre, rol, tipo, proveedor) VALUES (?, ?, ?, NULL, NULL, 'google')")
    .run(randomUUID(), normalizarEmail(email), nombre.trim() || email);
  return buscarPorEmail(email)!;
}

export function asignarPerfil(email: string, rol: Rol, tipo: TipoColaborador | null): Usuario {
  if (rol === "COLABORADOR" && !tipo) throw new ErrorRegistro("Elegí qué tipo de colaborador sos");
  base()
    .prepare("UPDATE usuarios SET rol = ?, tipo = ? WHERE email = ? AND rol IS NULL")
    .run(rol, rol === "COLABORADOR" ? tipo : null, normalizarEmail(email));
  const u = buscarPorEmail(email);
  if (!u) throw new ErrorRegistro("No encontramos tu cuenta");
  return u;
}

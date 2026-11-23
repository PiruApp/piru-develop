import "server-only";
import { connection } from "next/server";
import { auth } from "@/auth";

/**
 * Lee la sesión en el servidor. Auth.js renueva el token con valores aleatorios,
 * así que primero se marca la ruta como dinámica (Cache Components de Next.js 16).
 */
export async function sesionActual() {
  await connection();
  return auth();
}

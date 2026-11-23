// Llamadas del navegador al BFF de Next.js (rutas que necesitan sesión).

export async function bff<T>(ruta: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`/api/piru/${ruta}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!r.ok) {
    const cuerpo = await r.json().catch(() => null);
    throw new Error(cuerpo?.error ?? `Error ${r.status}`);
  }
  return r.json() as Promise<T>;
}

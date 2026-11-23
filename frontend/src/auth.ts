import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import { asegurarUsuarioGoogle, buscarPorEmail, verificarCredenciales } from "@/lib/usuarios";
import type { Rol, TipoColaborador } from "@/lib/roles";

declare module "next-auth" {
  interface Session {
    user: { rol: Rol | null; tipo: TipoColaborador | null } & DefaultSession["user"];
  }
}

export const googleHabilitado = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

const proveedores: Provider[] = [
  Credentials({
    credentials: { email: { label: "Email" }, password: { label: "Contraseña", type: "password" } },
    async authorize(credenciales) {
      const email = String(credenciales?.email ?? "");
      const password = String(credenciales?.password ?? "");
      if (!email || !password) return null;
      const u = await verificarCredenciales(email, password);
      return u ? { id: u.id, email: u.email, name: u.nombre } : null;
    },
  }),
];
if (googleHabilitado) proveedores.push(Google);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: proveedores,
  session: { strategy: "jwt" },
  pages: { signIn: "/ingresar" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        asegurarUsuarioGoogle(user.email, user.name ?? "");
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      // El rol se lee de la base al ingresar y cuando el usuario lo elige en /bienvenida.
      const email = user?.email ?? token.email;
      if (email && (user || trigger === "update" || token.rol === undefined)) {
        const u = buscarPorEmail(email);
        if (u) {
          token.name = u.nombre;
          token.rol = u.rol;
          token.tipo = u.tipo;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.rol = (token.rol as Rol | null) ?? null;
      session.user.tipo = (token.tipo as TipoColaborador | null) ?? null;
      return session;
    },
  },
});

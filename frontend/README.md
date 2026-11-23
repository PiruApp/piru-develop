# Piru · Frontend (Next.js 16)

Interfaz de viajeros y colaboradores. Los montos los calcula el backend Spring; el frontend solo los muestra.

## Correr en local

```bash
cd frontend
cp .env.example .env.local   # completar AUTH_SECRET (npx auth secret)
npm install
npm run dev
```

Necesita Node.js 22 o superior (usa `node:sqlite` para los usuarios) y el backend en http://localhost:8080.

## Rutas

| Ruta | Quién | Qué |
|---|---|---|
| `/` | Todos | Inicio. |
| `/viajero/armar-viaje` | Todos | Presupuesto, recomendación, destinos, circuitos, mapa (OpenStreetMap). |
| `/viajero/checkout` | Viajero | Reserva en 3 pasos. |
| `/viajero/mis-viajes` | Viajero | Estado de las solicitudes. |
| `/colaborador/panel` | Guía, hotel o restaurante | Solicitudes, ofertas y publicación. |
| `/ingresar`, `/registro`, `/bienvenida` | Todos | Login, alta con perfil y elección de perfil para Google. |

## Piezas clave

- `src/auth.ts`: Auth.js (email y contraseña + Google) con rol y tipo en la sesión.
- `src/lib/usuarios.ts`: usuarios en SQLite con contraseñas en bcrypt.
- `src/app/api/piru/[...ruta]/route.ts`: BFF hacia Spring con clave interna e identidad.
- `src/lib/sesion.ts`: lectura de sesión compatible con Cache Components.
- `src/components/ImagenLugar.tsx`: fotos de Wikimedia por nombre del lugar, con fondo de respaldo.
- `src/components/MapaLeaflet.tsx`: mapa con Leaflet + OpenStreetMap.

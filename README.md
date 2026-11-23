# Piru · Escapadas por Jujuy según tu presupuesto

El viajero carga cuánto quiere gastar (en pesos o en dólares), cuántas personas viajan y cuántos días tiene. Piru le propone circuitos que recorren varios lugares de Jujuy, con el desglose de costos, fotos y el recorrido en el mapa. Puede reservar desde un checkout, y los **colaboradores** (guías, hoteles y restaurantes) reciben la solicitud en su panel.

La documentación está en [`doc/`](doc/). La arquitectura es [DOC-04A](doc/04_diseno_arquitectura/DOC-04A_flujo_arquitectura.md) y los casos de prueba están en [DOC-06](doc/06_proc_entrega/DOC-06_casos_de_prueba.md).

## Estructura

| Carpeta | Qué hay |
|---|---|
| `backend/` | Spring Boot 4, Java 21, monolito modular: `planes`, `presupuesto`, `promociones`, `mapa`, `cotizacion`, `solicitudes`, `colaboradores`, `usuarios`. |
| `frontend/` | Next.js 16 + Tailwind + Auth.js. Viajero, checkout y paneles de colaborador. |
| `doc/` | Idea, análisis, diseño visual, arquitectura y casos de prueba. |

## Qué hace (iteración 2)

**Viajero**
- Presupuesto editable a mano en pesos o USD, con tipo de cambio oficial, MEP, blue o tarjeta (DolarAPI, con respaldo si no responde).
- Botón **"Ver el circuito recomendado"** para quien no conoce Jujuy, y **"Recomendame"** para marcar los lugares imperdibles.
- Destinos por región (Quebrada, Puna, Valles, Yungas) con fotos de Wikimedia.
- Resultados: los que entran y los que no (con el faltante), mapa de **OpenStreetMap**, itinerario día por día, desglose y prestadores del circuito.
- **Checkout** en 3 pasos: fecha, WhatsApp, notas y forma de pago. Mercado Pago y transferencia figuran como "próximamente". Crea una solicitud con copia fija del plan.
- **Mis viajes**: estado de cada solicitud y quién respondió; se puede cancelar.

**Colaboradores (guía, hotel, restaurante)**
- Panel por tipo con indicadores, solicitudes de los viajeros que pasan por sus lugares, botón de WhatsApp y estados (vista, confirmada, sin disponibilidad).
- Publicación y pausa de ofertas (excursión, habitación o menú) en un lugar del mapa.

**Cuentas**
- Registro con email y contraseña, o con Google. Al registrarse se elige el perfil: viajero, guía, hotel o restaurante.
- Las rutas de viajero y de colaborador están protegidas por rol.

## Arquitectura de este corte

```
Navegador ──► Next.js (Auth.js, usuarios en SQLite local)
   │              │
   │              └─ /api/piru/* (BFF): agrega la clave interna y la identidad de la sesión
   │                         │
   └─ datos públicos ───────►├─► Spring Boot /api/*  (circuitos, presupuesto, solicitudes, ofertas)
      (puntos, circuitos,         · /api/solicitudes/** y /api/colaboradores/** exigen la clave interna
       cotización, generar)
```

- El presupuesto **siempre lo calcula el backend**; el checkout lo recalcula antes de guardar.
- Solicitudes y ofertas se guardan **en memoria** en el backend: se pierden al reiniciarlo. Pasar a MySQL con JPA es el próximo paso.
- Los usuarios viven en SQLite (`frontend/.data/piru.db`), incluido en Node 22+. Pasarlos a MySQL también está pendiente.

> **Importante:** los montos de las plantillas son **estimados de referencia** y las coordenadas son aproximadas. Hay que validarlos antes de mostrarlos a usuarios reales.

## Cómo correrlo

### 1. Backend (IntelliJ)

Requisitos: Java 21. IntelliJ trae Maven.

1. Abrí la carpeta `backend/` como proyecto Maven.
2. Ejecutá `PiruApplication`.
3. Probá http://localhost:8080/api/circuitos.

Tests: clic derecho en `src/test/java` → **Run 'All Tests'**.

Variables opcionales: `PIRU_BFF_CLAVE` (clave compartida con el frontend), `PIRU_CORS_ORIGENES` y `PIRU_SEMILLA_OFERTAS=false` para no cargar prestadores de ejemplo.

### 2. Frontend

Requisitos: Node.js 22 o superior (LTS).

```bash
cd frontend
cp .env.example .env.local     # completá AUTH_SECRET (npx auth secret)
npm install
npm run dev
```

Abrí http://localhost:3000.

### Login con Google (opcional)

1. En Google Cloud Console, andá a **APIs y servicios → Credenciales → Crear ID de cliente OAuth** (aplicación web).
2. En URI de redirección autorizada, poné `http://localhost:3000/api/auth/callback/google`.
3. Copiá el ID y el secreto en `AUTH_GOOGLE_ID` y `AUTH_GOOGLE_SECRET` de `frontend/.env.local`.

Sin esas variables, el botón de Google no aparece y el login funciona con email y contraseña.

## Endpoints del backend

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/puntos` | Público | Lugares de Jujuy (con imperdibles y búsqueda de foto). |
| GET | `/api/circuitos` | Público | Circuitos; uno marcado como recomendado. |
| GET | `/api/promociones` | Público | Promos de ejemplo vigentes. |
| GET | `/api/cotizaciones/{casa}` | Público | Dólar oficial, bolsa (MEP), blue, tarjeta, CCL o mayorista. |
| POST | `/api/planes/generar` | Público | Circuitos para un presupuesto. |
| GET | `/api/ofertas?puntos=a,b` | Público | Ofertas activas de prestadores en esos lugares. |
| POST | `/api/solicitudes` | BFF (viajero) | Checkout: crea la solicitud con copia fija. |
| GET | `/api/solicitudes/mias` | BFF (viajero) | Mis viajes. |
| POST | `/api/solicitudes/{id}/cancelar` | BFF (viajero) | Cancelar. |
| GET/POST | `/api/colaboradores/ofertas` | BFF (colaborador) | Mis ofertas y publicar. |
| PATCH | `/api/colaboradores/ofertas/{id}` | BFF (colaborador) | Pausar o reactivar. |
| GET | `/api/colaboradores/solicitudes` | BFF (colaborador) | Solicitudes en mis lugares. |
| POST | `/api/colaboradores/solicitudes/{id}/estado` | BFF (colaborador) | INFORMADO, CERRADO_FUERA o DESCARTADO. |

Los montos están en **centavos de peso**.

## Pendiente

- Persistencia en MySQL (solicitudes, ofertas y usuarios).
- Que Spring valide el token de Auth.js en lugar de la clave compartida.
- Aviso por WhatsApp con n8n y cobro de seña con Mercado Pago.
- Distancias reales con un servicio de ruteo sobre OpenStreetMap (por ejemplo, OSRM).
- Tarifas reales cargadas por los prestadores en lugar de las plantillas estimadas.

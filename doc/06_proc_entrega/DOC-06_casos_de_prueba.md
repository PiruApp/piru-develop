# Casos de prueba de circuitos completos

**Código:** DOC-06
**Versión:** 0.1
**Fecha:** 22 de noviembre de 2026
**Bases:** DOC-04A (§5 a §16), `escapadas-jujuy-spec.md`.

Este documento lista los casos que evalúan un circuito **de principio a fin**: el viajero carga su presupuesto, elige un circuito, lo reserva en el checkout y los colaboradores (guía, hotel, restaurante) responden.

Hay dos niveles:

1. **Automáticos (backend):** tests JUnit que recorren los módulos reales sin red ni base de datos. Se ejecutan en IntelliJ con clic derecho en `backend/src/test/java` → **Run 'All Tests'**.
2. **Manuales (navegador):** pasos para verificar la interfaz con el backend corriendo.

> Los montos esperados salen de las plantillas semilla de `CatalogoPlantillas` (referencias estimadas al 22/11/2026). Si cambian las tarifas, hay que actualizar los valores esperados.

---

## 1. Datos de referencia

**Quebrada Clásica & Puna, 2 personas, 3 días (plantilla recomendada):**

| Rubro | Cálculo | Monto |
|---|---|---|
| Alojamiento | $55.000 × 1 habitación doble × 2 noches | $110.000 |
| Traslados | $18.000 × 2 personas × 2 tramos | $72.000 |
| Excursión 4x4 Salinas | $45.000 × 2 | $90.000 |
| Entrada Pucará | $5.000 × 2 | $10.000 |
| Combi Hornocal | $25.000 × 2 | $50.000 |
| Comidas | $30.000 × 2 × 3 días | $180.000 |
| **Total** | | **$512.000** ($256.000 por persona) |

**Prestadores de ejemplo (semilla):**

| Email | Tipo | Ofertas en |
|---|---|---|
| `guia.demo@piru.app` | Guía | Tilcara, Hornocal |
| `hotel.demo@piru.app` | Hotel | Purmamarca |
| `resto.demo@piru.app` | Restaurante | Tilcara |

Para probar un panel con solicitudes, registrate en la web con uno de esos emails y el tipo correspondiente.

---

## 2. Casos automáticos de punta a punta

Archivo: `backend/src/test/java/com/piru/e2e/CircuitosCompletosTest.java`.

| ID | Escenario | Resultado esperado |
|---|---|---|
| CP-01 | Primera vez en Jujuy: $700.000, 2 personas, 3 días, imperdibles de la Quebrada. Checkout. El guía marca "vista" y después "confirmé por WhatsApp". | Primer circuito: Quebrada Clásica, recomendado, cobertura completa, a pagar $512.000, margen $188.000. El viajero ve ENVIADA → EN_CONTACTO → CONFIRMADA_POR_WHATSAPP. El hotel sigue viendo PENDIENTE (cada prestador responde por separado). |
| CP-02 | Presupuesto en dólares: USD 300 a MEP $1.500. Sin promo y con promo de ejemplo 15%. | Cota $450.000. Sin promo faltan $62.000. Con promo: descuento $76.800 y entra. |
| CP-03 | El checkout se envía dos veces con la misma clave de envío. | Misma solicitud y un solo registro. |
| CP-04 | Después del checkout, el viajero recalcula con otras personas y otro presupuesto. | La copia fija de la solicitud no cambia. |
| CP-05 | Escapada a Valles: $200.000, 1 persona, 2 días, Termas de Reyes obligatorio. | Primer circuito: Valles, Diques & Termas, que entra en la cota. El guía de la Quebrada no ve la solicitud. |
| CP-06 | El viajero cancela. | El colaborador la ve CANCELADA y no puede responder. |
| CP-07 | Pasan 73 horas sin respuesta. | El colaborador la ve VENCIDA y no puede marcarla como vista. |
| CP-08 | Un restaurante nuevo, sin ofertas, publica un menú en Humahuaca. | Antes de publicar no ve nada. Después ve la solicitud, con el precio "por cubierto". |
| CP-09 | Checkout con fecha pasada o con teléfono "123". | Se rechaza con un mensaje claro. |
| CP-10 | Reservar Puna Profunda (mínimo 2 personas) para 1 persona. | Se rechaza: el circuito no está disponible para esos parámetros. |
| CP-11 | Un viajero intenta publicar una oferta o ver solicitudes de colaborador. | Se rechaza. |
| CP-12 | El viajero mira el detalle de la Quebrada Clásica. | Ve ofertas de guía, hotel y restaurante en los puntos del circuito. |

Tests unitarios que los complementan:

- `CalculadoraPresupuestoTest`: entra, no entra, promo que hace entrar, promo vencida, tope de promo, estimados, por persona y escala por habitación.
- `MotorMatchingTest`: filtro por días, planes que no entran al final, faltantes, rango de personas y parámetros inválidos.
- `ServicioCotizacionTest`: conversión USD→ARS, caché y respaldo si DolarAPI falla.

---

## 3. Casos manuales en el navegador

**Precondiciones:** backend corriendo en `http://localhost:8080` y frontend en `http://localhost:3000` con `frontend/.env.local` completo (ver `frontend/.env.example`).

| ID | Pasos | Resultado esperado |
|---|---|---|
| CM-01 | En **Armar viaje**, borrá todo el presupuesto con la tecla de borrar o la ✕ y tocá **Ver circuitos**. | El campo queda vacío y aparece "Ingresá tu presupuesto total". |
| CM-02 | Escribí `650000` y tocá **Ver circuitos**. | Aparece "X de 5 circuitos entran en tu presupuesto", las tarjetas con foto y el detalle del primero con mapa de OpenStreetMap. |
| CM-03 | Apagá el backend y tocá **Ver circuitos**. | Aparece un aviso naranja "No hay conexión con el servidor de Piru" con el botón **Reintentar**. |
| CM-04 | Tocá **✨ Ver el circuito recomendado con mi presupuesto**. | Se eligen los imperdibles, los días pasan a 3 como mínimo y la Quebrada Clásica aparece con la etiqueta "Recomendado para tu primera vez". |
| CM-05 | En **Lugares que no te querés perder**, cambiá de pestaña (Quebrada, Puna, Valles, Yungas) y tocá **✨ Recomendame**. | Se ve una región por vez, con foto. "Recomendame" marca los imperdibles. |
| CM-06 | Cambiá a **USD** con presupuesto `700000` y tipo de cambio Oficial. | El número se convierte a dólares; los montos se muestran en USD. |
| CM-07 | Sin sesión, tocá **Reservar este circuito**. | Te lleva a **Ingresar**. |
| CM-08 | Registrate como **Viajero** y andá a `/viajero/checkout`. Completá WhatsApp, aceptá y enviá. | Pantalla "¡Solicitud enviada!" con código. En **Mis viajes** figura como "Enviada a prestadores". |
| CM-09 | En otra ventana privada, registrate como **Guía turístico** con `guia.demo@piru.app`. | El panel del guía muestra la solicitud como "Nueva", con el KPI resaltado. |
| CM-10 | En el panel del guía, tocá **Marcar como vista** y después **Confirmé por WhatsApp**. | El estado pasa a "En contacto" y luego a "Confirmada". En **Mis viajes** del viajero se ve el avance. |
| CM-11 | Registrate como **Dueño de restaurante** y publicá un menú en Humahuaca. | La oferta aparece en **Mis ofertas** y empiezan a llegar las solicitudes de circuitos que pasan por Humahuaca. |
| CM-12 | Con la cuenta de viajero, entrá a `/colaborador/panel`. | Te redirige a **Armar viaje**: no tiene acceso. |
| CM-13 | Con Google configurado, tocá **Continuar con Google**. | La primera vez te pide elegir perfil (viajero, guía, hotel o restaurante) y te lleva a su inicio. |
| CM-14 | Repetí CM-02 y CM-08 con el ancho de un celular (390 px). | Todo entra sin desplazamiento horizontal y el botón de reservar queda visible. |

---

## 4. Historial

| Versión | Fecha | Cambio |
|---|---|---|
| 0.1 | 22/11/2026 | Primera versión: 12 casos automáticos de punta a punta y 14 manuales. |

# Evaluacion de Flujos - PIRU

Documento de testing manual para verificar cada flujo de la aplicacion.

---

## 1. Flujo de Autenticacion

### 1.1 Registro con email
| Paso | Accion | Resultado esperado | OK |
|------|--------|-------------------|-----|
| 1 | Ir a `/registro` | Se muestra el panel split-card con tabs Ingresar/Registrarse, tab "Registrarse" activa | |
| 2 | Seleccionar perfil "Viajero" | Card de Viajero se resalta con borde primario | |
| 3 | Completar nombre, email y contrasena (min 8 chars) | Campos aceptan input, contrasena se oculta | |
| 4 | Click "Crear cuenta" | Boton muestra "Creando cuenta...", se deshabilita | |
| 5 | Registro exitoso | Redirige a `/despues-de-ingresar`, sesion activa | |
| 6 | Intentar con email ya registrado | Muestra error "No pudimos crear la cuenta" | |

### 1.2 Registro como colaborador
| Paso | Accion | Resultado esperado | OK |
|------|--------|-------------------|-----|
| 1 | En `/registro`, seleccionar "Guia turistico" | Se muestra label "Nombre del emprendimiento o tuyo" | |
| 2 | Completar datos y registrar | Redirige a panel de colaborador | |
| 3 | Repetir para "Hotel" y "Restaurante" | Cada uno redirige al panel con el tema de color correcto | |

### 1.3 Login con email
| Paso | Accion | Resultado esperado | OK |
|------|--------|-------------------|-----|
| 1 | Ir a `/ingresar` | Panel split-card, tab "Ingresar" activa, campos email/contrasena | |
| 2 | Ingresar credenciales validas | Redirige segun rol (viajero -> armar-viaje, colaborador -> panel) | |
| 3 | Ingresar credenciales invalidas | Muestra "Email o contrasena incorrectos" | |
| 4 | Navegar entre tabs Ingresar/Registrarse | Cambia de pagina manteniendo el layout split-card | |

### 1.4 Login con Google
| Paso | Accion | Resultado esperado | OK |
|------|--------|-------------------|-----|
| 1 | Click "Continuar con Google" | Abre flujo OAuth de Google | |
| 2 | Seleccionar cuenta Google | Primera vez: redirige a elegir perfil. Ya registrado: redirige al inicio | |

### 1.5 Logout
| Paso | Accion | Resultado esperado | OK |
|------|--------|-------------------|-----|
| 1 | Click "Salir" en el header | Cierra sesion, redirige a home | |
| 2 | Verificar que las rutas protegidas redirigen a login | `/viajero/checkout`, `/viajero/mis-viajes` redirigen a `/ingresar` | |

---

## 2. Flujo del Viajero

### 2.1 Armar viaje
| Paso | Accion | Resultado esperado | OK |
|------|--------|-------------------|-----|
| 1 | Ir a `/viajero/armar-viaje` | Se muestra formulario con presupuesto, personas, dias y destinos | |
| 2 | Escribir presupuesto (ej: 700000) | Se muestra el monto formateado debajo | |
| 3 | Cambiar moneda a USD | El monto se convierte automaticamente | |
| 4 | Cambiar tipo de cambio (oficial/blue/bolsa/tarjeta) | Se actualiza la cotizacion mostrada | |
| 5 | Ajustar personas y dias | Contadores funcionan, respetan min/max | |
| 6 | Seleccionar destinos obligatorios | Badges verdes aparecen, se pueden quitar | |
| 7 | Click "Ver circuitos" | Skeleton shimmer mientras carga, luego muestra cards de circuitos | |
| 8 | Click en un circuito | Se resalta con borde primario, se despliega DetallePlan abajo | |
| 9 | Usar circuito recomendado | Se cargan los destinos del circuito recomendado automaticamente | |

### 2.2 Reservar circuito
| Paso | Accion | Resultado esperado | OK |
|------|--------|-------------------|-----|
| 1 | En DetallePlan, click "Reservar este circuito" | Si logueado: redirige a checkout. Si no: redirige a login con ?volver | |
| 2 | Verificar que el borrador se guarda en localStorage | El checkout carga los datos del circuito elegido | |

### 2.3 Checkout
| Paso | Accion | Resultado esperado | OK |
|------|--------|-------------------|-----|
| 1 | Ir a `/viajero/checkout` con borrador | Split-card: formulario izquierda, imagen destino derecha | |
| 2 | Skeleton de carga | Mientras carga, se muestra skeleton con shimmer | |
| 3 | Sin borrador | Mensaje "No hay un circuito elegido" con link a armar viaje | |
| 4 | Elegir fecha de viaje | Selector de fecha con minimo hoy, muestra rango (ida - vuelta) | |
| 5 | Completar telefono WhatsApp | Campo obligatorio con formato +54 9 ... | |
| 6 | Escribir notas (opcional) | Textarea con max 500 chars | |
| 7 | Seleccionar forma de pago | Radio buttons, "Sena online" deshabilitado | |
| 8 | Resumen de costos | Desglose por categoria, descuento si aplica, total y por persona | |
| 9 | Marcar checkbox de aceptacion | Obligatorio para habilitar el boton | |
| 10 | Click "Confirmar reserva" | **MODAL** de confirmacion con resumen del circuito, fecha y monto | |
| 11 | Modal: click "Cancelar" | Cierra el modal, vuelve al formulario | |
| 12 | Modal: click "Confirmar" | Envia solicitud, muestra pantalla de confirmacion | |

### 2.4 Confirmacion de reserva
| Paso | Accion | Resultado esperado | OK |
|------|--------|-------------------|-----|
| 1 | Despues de confirmar | Check verde, "Solicitud enviada", codigo, resumen del circuito | |
| 2 | Pasos siguientes | 3 pasos numerados: prestadores reciben, WhatsApp, Mis viajes | |
| 3 | Link "Ver Mis viajes" | Navega a `/viajero/mis-viajes` | |
| 4 | Link "Armar otro viaje" | Navega a `/viajero/armar-viaje` | |

### 2.5 Mis viajes
| Paso | Accion | Resultado esperado | OK |
|------|--------|-------------------|-----|
| 1 | Ir a `/viajero/mis-viajes` | Skeletons mientras carga, luego lista de viajes con estado | |
| 2 | Sin viajes | Mensaje "Todavia no reservaste ningun circuito" | |
| 3 | Con viajes | Cards glass con nombre, fecha, personas, monto y badge de estado | |
| 4 | Ver respuestas de prestadores | Lista de prestadores con nombre, tipo y estado de respuesta | |
| 5 | Click "Cancelar solicitud" | **MODAL** de confirmacion con advertencia | |
| 6 | Modal: click "Volver" | Cierra el modal, mantiene la solicitud activa | |
| 7 | Modal: click "Si, cancelar" | Cancela la solicitud, badge cambia a estado cancelada | |
| 8 | Solicitud ya cancelada | No muestra boton de cancelar | |
| 9 | Link "Armar viaje" (header) | Navega a armar-viaje | |

---

## 3. Flujo del Colaborador

### 3.1 Panel de colaborador
| Paso | Accion | Resultado esperado | OK |
|------|--------|-------------------|-----|
| 1 | Login como colaborador | Redirige a `/colaborador/panel` | |
| 2 | Ver solicitudes activas | Lista de solicitudes de viajeros con datos de contacto | |
| 3 | Publicar oferta | Formulario de titulo, precio, unidad. Boton "Publicar" | |
| 4 | Ver ofertas publicadas | Lista de ofertas con titulo, precio y acciones | |

---

## 4. Modo Claro/Oscuro

### 4.1 Toggle de tema
| Paso | Accion | Resultado esperado | OK |
|------|--------|-------------------|-----|
| 1 | Estado inicial | Icono de monitor (Sistema) - sigue preferencia del SO | |
| 2 | Click 1: Sistema -> Claro | Icono cambia a sol, fondo blanco, texto oscuro | |
| 3 | Click 2: Claro -> Oscuro | Icono cambia a luna, fondo #121218, texto claro | |
| 4 | Click 3: Oscuro -> Sistema | Icono cambia a monitor, vuelve a seguir al SO | |
| 5 | Recargar pagina | El modo elegido se mantiene (localStorage) | |
| 6 | Verificar en diferentes paginas | Home, login, armar-viaje, checkout, perfil — todos adaptan colores | |

### 4.2 Compatibilidad con temas de rol
| Paso | Accion | Resultado esperado | OK |
|------|--------|-------------------|-----|
| 1 | Login como viajero en modo oscuro | Acento terracota + superficies oscuras | |
| 2 | Login como guia en modo oscuro | Acento verde + superficies oscuras | |
| 3 | Login como hotel en modo claro | Acento ambar + superficies blancas | |
| 4 | Login como restaurante en modo claro | Acento siena + superficies blancas | |

---

## 5. Componentes Visuales

### 5.1 Skeletons
| Paso | Accion | Resultado esperado | OK |
|------|--------|-------------------|-----|
| 1 | Recargar `/viajero/mis-viajes` | 3 skeletons con shimmer (animacion de brillo deslizante) | |
| 2 | Recargar `/viajero/checkout` con borrador | Skeleton split-card con shimmer | |
| 3 | Click "Ver circuitos" en armar-viaje | 4 skeletons de tarjeta con shimmer | |
| 4 | Header durante Suspense | Skeleton redondeado en lugar de botones | |

### 5.2 Modales
| Paso | Accion | Resultado esperado | OK |
|------|--------|-------------------|-----|
| 1 | Modal de confirmar reserva | Icono de escudo, titulo, resumen, 2 botones | |
| 2 | Modal de cancelar solicitud | Icono X en circulo, titulo, advertencia, 2 botones | |
| 3 | Click fuera del modal | Se cierra | |
| 4 | Tecla Escape | Se cierra | |
| 5 | Backdrop | Fondo oscuro con blur | |
| 6 | Animacion | Aparece con scale+fade (200ms) | |

### 5.3 Login split-card
| Paso | Accion | Resultado esperado | OK |
|------|--------|-------------------|-----|
| 1 | Desktop (>1024px) | 2 columnas: form izquierda, imagen derecha | |
| 2 | Mobile (<1024px) | Solo el formulario, panel derecho se oculta | |
| 3 | Tabs Ingresar/Registrarse | Estilo pill, tab activa con fondo y sombra | |
| 4 | Panel derecho | Gradiente terracota/navy/ambar, logo PIRU, testimonial glass | |

### 5.4 Liquid Glass
| Paso | Accion | Resultado esperado | OK |
|------|--------|-------------------|-----|
| 1 | Header | blur(24px) saturate(190%), borde luminoso inset | |
| 2 | Cards de regiones (home) | Glass translucido con hover shadow | |
| 3 | Cards de viajes (mis-viajes) | Glass translucido | |
| 4 | Card de testimonial (login) | Vidrio translucido sobre gradiente | |

---

## 6. Navegacion General

### 6.1 Rutas publicas
| Paso | Accion | Resultado esperado | OK |
|------|--------|-------------------|-----|
| 1 | `/` (home) | Siempre accesible, muestra CTA y regiones | |
| 2 | `/ingresar` | Si logueado: redirige al inicio del rol | |
| 3 | `/registro` | Si logueado: redirige al inicio del rol | |
| 4 | `/viajero/armar-viaje` | Accesible sin login (reservar requiere login) | |

### 6.2 Rutas protegidas
| Paso | Accion | Resultado esperado | OK |
|------|--------|-------------------|-----|
| 1 | `/viajero/checkout` sin sesion | Redirige a `/ingresar?volver=/viajero/checkout` | |
| 2 | `/viajero/mis-viajes` sin sesion | Redirige a `/ingresar` | |
| 3 | `/colaborador/panel` sin sesion | Redirige a `/ingresar` | |
| 4 | `/perfil` sin sesion | Redirige a `/ingresar` | |

### 6.3 Header
| Paso | Accion | Resultado esperado | OK |
|------|--------|-------------------|-----|
| 1 | Logo PIRU | Link a home | |
| 2 | Toggle tema | Cicla: Sistema -> Claro -> Oscuro | |
| 3 | Sin sesion | Links: Armar viaje, Ingresar | |
| 4 | Viajero logueado | Links: Armar viaje, Mis viajes, avatar, Salir | |
| 5 | Colaborador logueado | Links: Panel, avatar, Salir | |

---

## 7. Responsive

| Pagina | Mobile (<640px) | Tablet (640-1024px) | Desktop (>1024px) |
|--------|----------------|--------------------|--------------------|
| Home | 1 columna regiones | 2 columnas | 4 columnas |
| Login | Solo formulario | Solo formulario | Split-card 2 columnas |
| Armar viaje | Form arriba, resultados abajo | Idem | Sidebar + resultados |
| Checkout | Form, itinerario en `<details>` | Idem | Split form + imagen |
| Mis viajes | Cards full width | Idem | Max 3xl centrado |
| Perfil | Stack vertical | Idem | Grid 2 columnas |

---

## Resumen de Cambios Implementados

1. **Toggle modo claro/oscuro** — Boton en el header que cicla Sistema/Claro/Oscuro con persistencia en localStorage
2. **Login split-card** — Layout de 2 columnas: formulario con tabs Ingresar/Registrarse + panel visual con logo y testimonial
3. **Modales de transacciones** — Componente `<Modal>` con dialog nativo, backdrop blur, animacion. Usado en:
   - Confirmacion de reserva (checkout)
   - Cancelacion de solicitud (mis-viajes)
4. **Skeletons** — Clase `.skeleton` con animacion shimmer. Componentes: `Skeleton`, `SkeletonTexto`, `SkeletonTarjeta`, `SkeletonViaje`
5. **CSS dark mode** — Soporte via `data-mode` atributo (separado de `data-theme` de roles) + media query del sistema

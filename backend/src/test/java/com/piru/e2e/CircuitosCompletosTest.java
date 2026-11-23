package com.piru.e2e;

import com.piru.colaboradores.NuevaOferta;
import com.piru.colaboradores.OfertasSemilla;
import com.piru.colaboradores.ServicioColaboradores;
import com.piru.cotizacion.Cotizacion;
import com.piru.cotizacion.Moneda;
import com.piru.mapa.CatalogoPuntos;
import com.piru.planes.CatalogoPlantillas;
import com.piru.planes.MotorMatching;
import com.piru.planes.ParametrosViaje;
import com.piru.planes.PlanCandidato;
import com.piru.promociones.CatalogoPromociones;
import com.piru.solicitudes.EstadoSolicitud;
import com.piru.solicitudes.NuevaSolicitud;
import com.piru.solicitudes.ServicioSolicitudes;
import com.piru.solicitudes.Solicitud;
import com.piru.solicitudes.VistaViajero;
import com.piru.usuarios.Identidad;
import com.piru.usuarios.TipoColaborador;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Casos de prueba de circuitos completos (DOC-06, sección 2): del presupuesto del viajero
 * hasta la respuesta del colaborador. Usan los módulos reales sin Spring ni red.
 * Montos de referencia de CatalogoPlantillas al 22/11/2026.
 */
class CircuitosCompletosTest {

    /** Reloj que se puede adelantar para probar vencimientos. */
    static final class RelojMovible extends Clock {
        private Instant ahora = Instant.parse("2026-11-22T13:00:00Z");

        void adelantar(Duration d) {
            ahora = ahora.plus(d);
        }

        @Override public ZoneId getZone() { return ZoneId.of("America/Argentina/Jujuy"); }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return ahora; }
    }

    private static final Identidad VIAJERA =
            new Identidad("sofia@example.com", "Sofía", Identidad.ROL_VIAJERO, null);
    private static final Identidad GUIA =
            new Identidad("guia.demo@piru.app", "Guía de ejemplo · Quebrada", Identidad.ROL_COLABORADOR, TipoColaborador.GUIA);
    private static final Identidad HOTEL =
            new Identidad("hotel.demo@piru.app", "Hostal de ejemplo · Purmamarca", Identidad.ROL_COLABORADOR, TipoColaborador.HOTEL);
    private static final List<String> IMPERDIBLES_QUEBRADA =
            List.of("purmamarca", "tilcara", "salinas_grandes", "humahuaca", "hornocal");

    private final RelojMovible reloj = new RelojMovible();
    private final MotorMatching motor = new MotorMatching(CatalogoPlantillas.semilla(), new CatalogoPromociones());
    private final ServicioSolicitudes solicitudes = new ServicioSolicitudes(motor, reloj);
    private final ServicioColaboradores colaboradores =
            new ServicioColaboradores(new CatalogoPuntos(), solicitudes, reloj);
    private final LocalDate enUnMes = LocalDate.of(2026, 12, 20);

    CircuitosCompletosTest() {
        OfertasSemilla.cargar(colaboradores);
    }

    private static long pesos(long p) {
        return p * 100;
    }

    private NuevaSolicitud checkout(String clave, String plantillaId, ParametrosViaje p) {
        return new NuevaSolicitud(clave, plantillaId, p, enUnMes, "+54 9 388 412 3456", "Viajamos con una nena");
    }

    @Test
    void cp01_primeraVezEnJujuy_recomendado_checkout_yConfirmacionDelGuia() {
        var params = new ParametrosViaje(pesos(700_000), 2, 3, IMPERDIBLES_QUEBRADA, null);

        List<PlanCandidato> candidatos = motor.generar(params, LocalDate.now(reloj));
        PlanCandidato primero = candidatos.get(0);
        assertEquals("quebrada_clasica_puna", primero.plantillaId());
        assertTrue(primero.recomendado());
        assertTrue(primero.coberturaCompleta());
        assertEquals(pesos(512_000), primero.calculo().aPagarCentavos());
        assertEquals(pesos(188_000), primero.calculo().margenCentavos());

        Solicitud s = solicitudes.crear(checkout("clave-cp01", primero.plantillaId(), params), VIAJERA);
        assertEquals("ENVIADA", VistaViajero.de(s).estado());

        var vistaGuia = colaboradores.solicitudesPara(GUIA);
        assertEquals(1, vistaGuia.size());
        assertEquals(EstadoSolicitud.PENDIENTE, vistaGuia.get(0).estado());
        assertTrue(vistaGuia.get(0).puntosEnTuZona().containsAll(List.of("tilcara", "hornocal")));

        colaboradores.responder(s.id(), EstadoSolicitud.INFORMADO, GUIA);
        assertEquals("EN_CONTACTO", VistaViajero.de(solicitudes.buscar(s.id()).orElseThrow()).estado());

        colaboradores.responder(s.id(), EstadoSolicitud.CERRADO_FUERA, GUIA);
        assertEquals("CONFIRMADA_POR_WHATSAPP", VistaViajero.de(solicitudes.buscar(s.id()).orElseThrow()).estado());

        // El hotel de Purmamarca sigue viendo su propio estado, independiente del guía
        assertEquals(EstadoSolicitud.PENDIENTE, colaboradores.solicitudesPara(HOTEL).get(0).estado());
    }

    @Test
    void cp02_presupuestoEnDolares_noEntra_yLaPromoLoHaceEntrar() {
        Cotizacion mep = new Cotizacion("bolsa", new BigDecimal("1500"), reloj.instant(), "test", false);
        long cota = mep.aCentavosArs(new BigDecimal("300"), Moneda.USD);
        assertEquals(pesos(450_000), cota);

        PlanCandidato sinPromo = buscar(motor.generar(new ParametrosViaje(cota, 2, 3, List.of(), null), LocalDate.now(reloj)),
                "quebrada_clasica_puna");
        assertFalse(sinPromo.calculo().entraEnCota());
        assertEquals(pesos(62_000), sinPromo.calculo().faltanteCentavos());

        PlanCandidato conPromo = buscar(motor.generar(new ParametrosViaje(cota, 2, 3, List.of(), "promo_ejemplo_15"), LocalDate.now(reloj)),
                "quebrada_clasica_puna");
        assertEquals(pesos(76_800), conPromo.calculo().descuentoCentavos());
        assertTrue(conPromo.calculo().entraEnCota());
    }

    @Test
    void cp03_reintentoDelCheckoutNoDuplica() {
        var params = new ParametrosViaje(pesos(700_000), 2, 3, List.of(), null);
        Solicitud a = solicitudes.crear(checkout("misma-clave", "quebrada_clasica_puna", params), VIAJERA);
        Solicitud b = solicitudes.crear(checkout("misma-clave", "quebrada_clasica_puna", params), VIAJERA);
        assertEquals(a.id(), b.id());
        assertEquals(1, solicitudes.delViajero(VIAJERA.email()).size());
    }

    @Test
    void cp04_laCopiaFijaNoCambiaSiElViajeroRecalcula() {
        var params = new ParametrosViaje(pesos(700_000), 2, 3, List.of(), null);
        Solicitud s = solicitudes.crear(checkout("clave-cp04", "quebrada_clasica_puna", params), VIAJERA);
        long congelado = s.copiaFija().calculo().aPagarCentavos();

        motor.generar(new ParametrosViaje(pesos(900_000), 4, 3, List.of(), null), LocalDate.now(reloj));

        assertEquals(congelado, solicitudes.buscar(s.id()).orElseThrow().copiaFija().calculo().aPagarCentavos());
    }

    @Test
    void cp05_escapadaCortaEnValles_soloLaVenColaboradoresDeEsaZona() {
        var params = new ParametrosViaje(pesos(200_000), 1, 2, List.of("termas_reyes"), null);
        PlanCandidato valles = motor.generar(params, LocalDate.now(reloj)).get(0);
        assertEquals("valles_diques_termas", valles.plantillaId());
        assertTrue(valles.calculo().entraEnCota());

        solicitudes.crear(checkout("clave-cp05", valles.plantillaId(), params), VIAJERA);
        assertTrue(colaboradores.solicitudesPara(GUIA).isEmpty(), "El guía de la Quebrada no tiene ofertas en Valles");
    }

    @Test
    void cp06_viajeroCancela_yElColaboradorYaNoPuedeResponder() {
        var params = new ParametrosViaje(pesos(700_000), 2, 3, List.of(), null);
        Solicitud s = solicitudes.crear(checkout("clave-cp06", "quebrada_clasica_puna", params), VIAJERA);
        solicitudes.cancelar(s.id(), VIAJERA);

        assertEquals(EstadoSolicitud.CANCELADO, colaboradores.solicitudesPara(GUIA).get(0).estado());
        assertThrows(IllegalArgumentException.class,
                () -> colaboradores.responder(s.id(), EstadoSolicitud.INFORMADO, GUIA));
    }

    @Test
    void cp07_sinRespuestaEn72HorasQuedaVencida() {
        var params = new ParametrosViaje(pesos(700_000), 2, 3, List.of(), null);
        Solicitud s = solicitudes.crear(checkout("clave-cp07", "quebrada_clasica_puna", params), VIAJERA);
        reloj.adelantar(Duration.ofHours(73));

        assertEquals(EstadoSolicitud.VENCIDO, colaboradores.solicitudesPara(GUIA).get(0).estado());
        assertThrows(IllegalArgumentException.class,
                () -> colaboradores.responder(s.id(), EstadoSolicitud.INFORMADO, GUIA));
    }

    @Test
    void cp08_colaboradorNuevoRecibeSolicitudesRecienAlPublicarOferta() {
        Identidad resto = new Identidad("nuevo@resto.com", "Resto Humahuaca", Identidad.ROL_COLABORADOR, TipoColaborador.RESTAURANTE);
        var params = new ParametrosViaje(pesos(700_000), 2, 3, List.of(), null);
        solicitudes.crear(checkout("clave-cp08", "quebrada_clasica_puna", params), VIAJERA);

        assertTrue(colaboradores.solicitudesPara(resto).isEmpty());
        colaboradores.publicar(new NuevaOferta("Locro y empanadas", "", "humahuaca", new BigDecimal("15000"), 40), resto);
        assertEquals(1, colaboradores.solicitudesPara(resto).size());
        assertEquals("por cubierto", colaboradores.deColaborador(resto.email()).get(0).unidadPrecio());
    }

    @Test
    void cp09_checkoutRechazaDatosInvalidos() {
        var params = new ParametrosViaje(pesos(700_000), 2, 3, List.of(), null);
        assertThrows(IllegalArgumentException.class, () -> solicitudes.crear(
                new NuevaSolicitud("c1", "quebrada_clasica_puna", params, LocalDate.of(2026, 1, 1), "+54 9 388 412 3456", ""), VIAJERA));
        assertThrows(IllegalArgumentException.class, () -> solicitudes.crear(
                new NuevaSolicitud("c2", "quebrada_clasica_puna", params, enUnMes, "123", ""), VIAJERA));
    }

    @Test
    void cp10_circuitoQueNoAdmiteEsasPersonasNoSePuedeReservar() {
        var unaPersona = new ParametrosViaje(pesos(900_000), 1, 2, List.of(), null);
        assertThrows(IllegalArgumentException.class,
                () -> solicitudes.crear(checkout("clave-cp10", "puna_profunda", unaPersona), VIAJERA));
    }

    @Test
    void cp11_unViajeroNoPuedeResponderNiPublicarComoColaborador() {
        assertThrows(IllegalArgumentException.class, () -> colaboradores.solicitudesPara(VIAJERA));
        assertThrows(IllegalArgumentException.class, () -> colaboradores.publicar(
                new NuevaOferta("x", "", "tilcara", BigDecimal.TEN, 1), VIAJERA));
    }

    @Test
    void cp12_elViajeroVeOfertasDePrestadoresEnSuCircuito() {
        PlanCandidato quebrada = buscar(motor.generar(new ParametrosViaje(pesos(700_000), 2, 3, List.of(), null),
                LocalDate.now(reloj)), "quebrada_clasica_puna");
        var ofertas = colaboradores.activasEn(quebrada.puntosEnOrden());
        assertTrue(ofertas.stream().anyMatch(o -> o.tipo() == TipoColaborador.GUIA));
        assertTrue(ofertas.stream().anyMatch(o -> o.tipo() == TipoColaborador.HOTEL));
        assertTrue(ofertas.stream().anyMatch(o -> o.tipo() == TipoColaborador.RESTAURANTE));
    }

    private static PlanCandidato buscar(List<PlanCandidato> candidatos, String id) {
        return candidatos.stream().filter(c -> c.plantillaId().equals(id)).findFirst().orElseThrow();
    }
}

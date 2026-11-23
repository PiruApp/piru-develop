package com.piru.cotizacion;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

class ServicioCotizacionTest {

    private static final Instant T0 = Instant.parse("2026-11-22T15:00:00Z");

    private static Cotizacion cot(String venta) {
        return new Cotizacion("oficial", new BigDecimal(venta), T0, "test", false);
    }

    @Test
    void convierteDolaresAPesosEnCentavos() {
        assertEquals(150_000_00L, cot("1500").aCentavosArs(new BigDecimal("100"), Moneda.USD));
        assertEquals(100_00L, cot("1500").aCentavosArs(new BigDecimal("100"), Moneda.ARS));
        assertEquals(1_512_50L, cot("1512.5").aCentavosArs(BigDecimal.ONE, Moneda.USD));
    }

    @Test
    void usaLaCacheDentroDeLaVigencia() {
        AtomicInteger llamadas = new AtomicInteger();
        var servicio = new ServicioCotizacion(casa -> { llamadas.incrementAndGet(); return cot("1500"); },
                Clock.fixed(T0, ZoneOffset.UTC), Duration.ofMinutes(10), new BigDecimal("1"));
        servicio.obtener("oficial");
        servicio.obtener("oficial");
        assertEquals(1, llamadas.get());
    }

    @Test
    void siLaFuenteFallaDevuelveRespaldoConfigurado() {
        var servicio = new ServicioCotizacion(casa -> { throw new IllegalStateException("caída"); },
                Clock.fixed(T0, ZoneOffset.UTC), Duration.ofMinutes(10), new BigDecimal("1400"));
        var c = servicio.obtener("blue");
        assertTrue(c.respaldo());
        assertEquals(new BigDecimal("1400"), c.venta());
    }

    @Test
    void rechazaTipoDeCambioDesconocido() {
        var servicio = new ServicioCotizacion(casa -> cot("1"), Clock.systemUTC(), Duration.ZERO, BigDecimal.ONE);
        assertThrows(IllegalArgumentException.class, () -> servicio.obtener("inventado"));
    }
}

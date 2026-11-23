package com.piru.presupuesto;

import com.piru.promociones.Promocion;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/** Casos mínimos de presupuesto (DOC-04A §16). Montos en centavos. */
class CalculadoraPresupuestoTest {

    private static final LocalDate HOY = LocalDate.of(2026, 11, 22);
    private static final Promocion PROMO_15 =
            new Promocion("p15", "Ejemplo 15%", 15, 0, 0, LocalDate.of(2027, 3, 31));

    private static ItemCalculado item(long pesos, TipoCosto tipo) {
        return new ItemCalculado("i" + pesos, 1, CategoriaCosto.EXTRA, "x", tipo, "test", HOY, pesos * 100);
    }

    @Test
    void planQueEntraEnLaCota() {
        var r = CalculadoraPresupuesto.calcular(
                List.of(item(300_000, TipoCosto.PUBLICADO), item(200_000, TipoCosto.PUBLICADO)),
                2, 600_000_00L, Optional.empty(), HOY);

        assertEquals(500_000_00L, r.aPagarCentavos());
        assertEquals(100_000_00L, r.margenCentavos());
        assertTrue(r.entraEnCota());
        assertEquals(0, r.faltanteCentavos());
        assertFalse(r.incluyeEstimados());
    }

    @Test
    void planQueNoEntraInformaElFaltante() {
        var r = CalculadoraPresupuesto.calcular(
                List.of(item(700_000, TipoCosto.PUBLICADO)), 2, 600_000_00L, Optional.empty(), HOY);

        assertFalse(r.entraEnCota());
        assertEquals(100_000_00L, r.faltanteCentavos());
    }

    @Test
    void promoQueHaceEntrar() {
        var sinPromo = CalculadoraPresupuesto.calcular(
                List.of(item(650_000, TipoCosto.PUBLICADO)), 2, 600_000_00L, Optional.empty(), HOY);
        var conPromo = CalculadoraPresupuesto.calcular(
                List.of(item(650_000, TipoCosto.PUBLICADO)), 2, 600_000_00L, Optional.of(PROMO_15), HOY);

        assertFalse(sinPromo.entraEnCota());
        assertTrue(conPromo.entraEnCota());
        assertEquals(97_500_00L, conPromo.descuentoCentavos());
        assertEquals(552_500_00L, conPromo.aPagarCentavos());
        assertEquals("p15", conPromo.promocionId());
    }

    @Test
    void promoVencidaNoDescuenta() {
        var vencida = new Promocion("old", "Vencida", 50, 0, 0, LocalDate.of(2026, 1, 1));
        var r = CalculadoraPresupuesto.calcular(
                List.of(item(100_000, TipoCosto.PUBLICADO)), 1, 1L, Optional.of(vencida), HOY);

        assertEquals(0, r.descuentoCentavos());
        assertNull(r.promocionId());
    }

    @Test
    void promoRespetaElTope() {
        var conTope = new Promocion("tope", "Tope", 50, 10_000_00L, 0, LocalDate.of(2027, 1, 1));
        var r = CalculadoraPresupuesto.calcular(
                List.of(item(100_000, TipoCosto.PUBLICADO)), 1, 1L, Optional.of(conTope), HOY);

        assertEquals(10_000_00L, r.descuentoCentavos());
    }

    @Test
    void itemEstimadoSeMarca() {
        var r = CalculadoraPresupuesto.calcular(
                List.of(item(100_000, TipoCosto.PUBLICADO), item(50_000, TipoCosto.ESTIMADO)),
                1, 1L, Optional.empty(), HOY);

        assertTrue(r.incluyeEstimados());
    }

    @Test
    void porPersonaDivideElTotal() {
        var una = CalculadoraPresupuesto.calcular(List.of(item(300_000, TipoCosto.PUBLICADO)), 1, 1L, Optional.empty(), HOY);
        var dos = CalculadoraPresupuesto.calcular(List.of(item(300_000, TipoCosto.PUBLICADO)), 2, 1L, Optional.empty(), HOY);

        assertEquals(300_000_00L, una.porPersonaCentavos());
        assertEquals(150_000_00L, dos.porPersonaCentavos());
    }

    @Test
    void escalaPorHabitacionDobleRedondeaHaciaArriba() {
        assertEquals(1, Escala.POR_HABITACION_DOBLE.unidades(1));
        assertEquals(1, Escala.POR_HABITACION_DOBLE.unidades(2));
        assertEquals(2, Escala.POR_HABITACION_DOBLE.unidades(3));
        assertEquals(1, Escala.POR_GRUPO.unidades(5));
        assertEquals(5, Escala.POR_PERSONA.unidades(5));
    }
}

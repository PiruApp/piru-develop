package com.piru.planes;

import com.piru.promociones.CatalogoPromociones;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MotorMatchingTest {

    private static final LocalDate HOY = LocalDate.of(2026, 11, 22);
    private final MotorMatching motor = new MotorMatching(CatalogoPlantillas.semilla(), new CatalogoPromociones());

    @Test
    void soloOfrecePlantillasQueEntranEnLosDias() {
        var candidatos = motor.generar(new ParametrosViaje(1_000_000_00L, 2, 2, List.of(), null), HOY);

        assertFalse(candidatos.isEmpty());
        assertTrue(candidatos.stream().allMatch(c -> c.dias() <= 2));
    }

    @Test
    void noOcultaLosQueNoEntranYLosMandaAlFinal() {
        var candidatos = motor.generar(new ParametrosViaje(250_000_00L, 2, 3, List.of(), null), HOY);

        assertTrue(candidatos.stream().anyMatch(c -> !c.calculo().entraEnCota()));
        boolean vioUnoQueNoEntra = false;
        for (var c : candidatos) {
            if (!c.calculo().entraEnCota()) vioUnoQueNoEntra = true;
            else assertFalse(vioUnoQueNoEntra, "Un plan que entra no puede ir después de uno que no entra");
        }
    }

    @Test
    void informaPuntosObligatoriosFaltantesYPriorizaCoberturaCompleta() {
        var candidatos = motor.generar(new ParametrosViaje(2_000_000_00L, 2, 3, List.of("hornocal"), null), HOY);

        assertEquals("quebrada_clasica_puna", candidatos.get(0).plantillaId());
        assertTrue(candidatos.get(0).coberturaCompleta());
        assertTrue(candidatos.stream().skip(1).allMatch(c -> c.puntosFaltantes().contains("hornocal")));
    }

    @Test
    void respetaElRangoDePersonasDeLaPlantilla() {
        var candidatos = motor.generar(new ParametrosViaje(5_000_000_00L, 1, 3, List.of(), null), HOY);

        assertTrue(candidatos.stream().noneMatch(c -> c.plantillaId().equals("puna_profunda")));
    }

    @Test
    void rechazaParametrosIncoherentes() {
        assertThrows(IllegalArgumentException.class, () -> new ParametrosViaje(0, 2, 2, List.of(), null));
        assertThrows(IllegalArgumentException.class, () -> new ParametrosViaje(100, 0, 2, List.of(), null));
        assertThrows(IllegalArgumentException.class, () -> new ParametrosViaje(100, 2, 0, List.of(), null));
    }
}

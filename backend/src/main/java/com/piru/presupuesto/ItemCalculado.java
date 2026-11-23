package com.piru.presupuesto;

import java.time.LocalDate;

/** Ítem de costo ya escalado a la cantidad de personas del viaje. Montos en centavos de peso. */
public record ItemCalculado(
        String id,
        int dia,
        CategoriaCosto categoria,
        String titulo,
        TipoCosto tipoCosto,
        String fuente,
        LocalDate fechaReferencia,
        long montoCentavos
) {
}

package com.piru.promociones;

import java.time.LocalDate;

/**
 * Promoción bancaria de EJEMPLO (DOC-04A §13): no representa a un banco real.
 *
 * @param porcentaje      descuento sobre el total, de 0 a 100
 * @param topeCentavos    descuento máximo; 0 significa sin tope
 * @param cuotasSinInteres solo informativo, no cambia el total
 */
public record Promocion(
        String id,
        String nombre,
        int porcentaje,
        long topeCentavos,
        int cuotasSinInteres,
        LocalDate vigenteHasta
) {
    public Promocion {
        if (porcentaje < 0 || porcentaje > 100) {
            throw new IllegalArgumentException("El porcentaje de la promoción debe estar entre 0 y 100");
        }
    }

    public boolean vigente(LocalDate hoy) {
        return !hoy.isAfter(vigenteHasta);
    }

    public long descuentoSobre(long brutoCentavos) {
        long descuento = brutoCentavos * porcentaje / 100;
        return topeCentavos > 0 ? Math.min(descuento, topeCentavos) : descuento;
    }
}

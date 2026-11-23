package com.piru.planes;

import java.util.List;

/**
 * Lo que carga el viajero, ya convertido a pesos.
 * Solo se aceptan parámetros coherentes (DOC-04A §5 y §7).
 */
public record ParametrosViaje(
        long cotaCentavosArs,
        int personas,
        int dias,
        List<String> puntosObligatorios,
        String promocionId
) {
    public static final int MAX_PERSONAS = 20;
    public static final int MAX_DIAS = 7;

    public ParametrosViaje {
        if (cotaCentavosArs <= 0) {
            throw new IllegalArgumentException("El presupuesto debe ser mayor a 0");
        }
        if (personas < 1 || personas > MAX_PERSONAS) {
            throw new IllegalArgumentException("La cantidad de personas debe estar entre 1 y " + MAX_PERSONAS);
        }
        if (dias < 1 || dias > MAX_DIAS) {
            throw new IllegalArgumentException("La duración debe estar entre 1 y " + MAX_DIAS + " días");
        }
        puntosObligatorios = puntosObligatorios == null ? List.of() : List.copyOf(puntosObligatorios);
    }
}

package com.piru.planes;

import java.util.List;

/** Vista corta de una plantilla para listar circuitos y armar la recomendación. */
public record ResumenCircuito(
        String id,
        String nombre,
        String descripcion,
        String region,
        int dias,
        int noches,
        List<String> puntosEnOrden,
        boolean recomendada,
        String motivoRecomendacion
) {
    public static ResumenCircuito de(Plantilla p) {
        return new ResumenCircuito(p.id(), p.nombre(), p.descripcion(), p.region(), p.dias(), p.noches(),
                p.puntosEnOrden(), p.recomendada(), p.motivoRecomendacion());
    }
}

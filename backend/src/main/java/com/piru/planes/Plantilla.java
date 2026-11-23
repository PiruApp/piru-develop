package com.piru.planes;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/** Circuito tipo de Jujuy con días, puntos en orden y rubros de costo de referencia (DOC-04A §5). */
public record Plantilla(
        String id,
        String nombre,
        String descripcion,
        String region,
        int dias,
        int noches,
        int personasMin,
        int personasMax,
        List<DiaPlantilla> itinerario,
        List<ItemPlantilla> items,
        boolean recomendada,
        String motivoRecomendacion
) {
    /** Puntos del recorrido en el orden en que se visitan, sin repetidos. */
    public List<String> puntosEnOrden() {
        Set<String> orden = new LinkedHashSet<>();
        itinerario.forEach(d -> orden.addAll(d.puntoIds()));
        return List.copyOf(orden);
    }

    public boolean admitePersonas(int personas) {
        return personas >= personasMin && personas <= personasMax;
    }
}

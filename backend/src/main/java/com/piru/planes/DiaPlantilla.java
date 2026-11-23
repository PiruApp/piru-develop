package com.piru.planes;

import java.util.List;

public record DiaPlantilla(
        int numero,
        String titulo,
        String base,
        List<String> puntoIds
) {
}

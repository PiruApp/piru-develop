package com.piru.colaboradores;

import java.math.BigDecimal;

/** Lo que carga el colaborador en su panel. Precio en pesos. */
public record NuevaOferta(
        String titulo,
        String descripcion,
        String puntoId,
        BigDecimal precio,
        int capacidad
) {
}

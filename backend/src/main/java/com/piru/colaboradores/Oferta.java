package com.piru.colaboradores;

import com.piru.usuarios.TipoColaborador;

import java.time.Instant;

/**
 * Servicio que publica un colaborador en un punto del mapa: una excursión guiada,
 * una habitación o un menú. El precio es PUBLICADO (lo carga el colaborador).
 */
public record Oferta(
        String id,
        String colaboradorEmail,
        String colaboradorNombre,
        TipoColaborador tipo,
        String titulo,
        String descripcion,
        String puntoId,
        long precioCentavos,
        String unidadPrecio,
        int capacidad,
        boolean activa,
        Instant creadaEn
) {
    public Oferta conActiva(boolean nueva) {
        return new Oferta(id, colaboradorEmail, colaboradorNombre, tipo, titulo, descripcion, puntoId,
                precioCentavos, unidadPrecio, capacidad, nueva, creadaEn);
    }
}

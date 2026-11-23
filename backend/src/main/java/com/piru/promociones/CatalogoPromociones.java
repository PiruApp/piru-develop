package com.piru.promociones;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/** Promociones de ejemplo para el MVP. Se reemplazan por convenios reales cuando existan. */
public class CatalogoPromociones {

    private final List<Promocion> promociones = List.of(
            new Promocion("promo_ejemplo_15", "Banco de ejemplo · 15% OFF (tope $100.000)",
                    15, 100_000_00L, 0, LocalDate.of(2027, 3, 31)),
            new Promocion("promo_ejemplo_cuotas", "Banco de ejemplo · 6 cuotas sin interés",
                    0, 0, 6, LocalDate.of(2027, 3, 31))
    );

    public List<Promocion> vigentes(LocalDate hoy) {
        return promociones.stream().filter(p -> p.vigente(hoy)).toList();
    }

    public Optional<Promocion> buscar(String id) {
        if (id == null || id.isBlank()) {
            return Optional.empty();
        }
        return promociones.stream().filter(p -> p.id().equals(id)).findFirst();
    }
}

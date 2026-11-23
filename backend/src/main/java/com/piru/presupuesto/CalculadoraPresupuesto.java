package com.piru.presupuesto;

import com.piru.promociones.Promocion;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Lógica pura del módulo presupuesto (DOC-04A §8).
 * Suma ítems, aplica la promo si está vigente y compara con la cota.
 */
public final class CalculadoraPresupuesto {

    private CalculadoraPresupuesto() {
    }

    public static CalculoPresupuesto calcular(List<ItemCalculado> items,
                                              int personas,
                                              long cotaCentavos,
                                              Optional<Promocion> promocion,
                                              LocalDate hoy) {
        if (personas < 1) {
            throw new IllegalArgumentException("La cantidad de personas debe ser al menos 1");
        }
        long bruto = items.stream().mapToLong(ItemCalculado::montoCentavos).sum();

        Optional<Promocion> aplicable = promocion.filter(p -> p.vigente(hoy));
        long descuento = aplicable.map(p -> p.descuentoSobre(bruto)).orElse(0L);
        long aPagar = bruto - descuento;
        long margen = cotaCentavos - aPagar;
        boolean incluyeEstimados = items.stream().anyMatch(i -> i.tipoCosto() == TipoCosto.ESTIMADO);

        return new CalculoPresupuesto(
                bruto,
                aplicable.map(Promocion::id).orElse(null),
                descuento,
                aPagar,
                Math.round((double) aPagar / personas),
                cotaCentavos,
                margen,
                margen >= 0,
                incluyeEstimados
        );
    }
}

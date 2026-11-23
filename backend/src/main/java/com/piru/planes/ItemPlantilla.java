package com.piru.planes;

import com.piru.presupuesto.CategoriaCosto;
import com.piru.presupuesto.Escala;
import com.piru.presupuesto.ItemCalculado;
import com.piru.presupuesto.TipoCosto;

import java.time.LocalDate;

/**
 * Rubro de costo de referencia dentro de una plantilla.
 *
 * @param cantidad veces que se repite (por ejemplo, noches de alojamiento)
 */
public record ItemPlantilla(
        String id,
        int dia,
        CategoriaCosto categoria,
        String titulo,
        long montoUnitarioCentavos,
        Escala escala,
        int cantidad,
        TipoCosto tipoCosto,
        String fuente,
        LocalDate fechaReferencia
) {
    public ItemCalculado calcularPara(int personas) {
        long monto = montoUnitarioCentavos * escala.unidades(personas) * cantidad;
        return new ItemCalculado(id, dia, categoria, titulo, tipoCosto, fuente, fechaReferencia, monto);
    }
}

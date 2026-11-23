package com.piru.planes;

import com.piru.presupuesto.CalculoPresupuesto;
import com.piru.presupuesto.ItemCalculado;

import java.util.List;

/** Plan propuesto al viajero: plantilla + ítems escalados + cálculo + cobertura de puntos. */
public record PlanCandidato(
        String plantillaId,
        String nombre,
        String descripcion,
        String region,
        int dias,
        int noches,
        List<DiaPlantilla> itinerario,
        List<String> puntosEnOrden,
        List<ItemCalculado> items,
        CalculoPresupuesto calculo,
        List<String> puntosFaltantes,
        boolean recomendado,
        String motivoRecomendacion
) {
    public boolean coberturaCompleta() {
        return puntosFaltantes.isEmpty();
    }
}

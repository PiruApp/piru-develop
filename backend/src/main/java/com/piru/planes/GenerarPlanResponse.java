package com.piru.planes;

import com.piru.cotizacion.Cotizacion;

import java.util.List;

/** Todos los montos de los candidatos están en centavos de peso; la cotización permite mostrarlos en USD. */
public record GenerarPlanResponse(
        Cotizacion cotizacion,
        long cotaCentavosArs,
        List<PlanCandidato> candidatos
) {
}

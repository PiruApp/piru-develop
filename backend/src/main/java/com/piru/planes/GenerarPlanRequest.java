package com.piru.planes;

import com.piru.cotizacion.Moneda;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;

/**
 * Pedido del viajero. El presupuesto llega en la moneda que eligió;
 * el backend lo convierte a pesos con la cotización indicada.
 */
public record GenerarPlanRequest(
        @NotNull @Positive BigDecimal presupuesto,
        @NotNull Moneda moneda,
        String tipoCambio,
        @Min(1) @Max(ParametrosViaje.MAX_PERSONAS) int personas,
        @Min(1) @Max(ParametrosViaje.MAX_DIAS) int dias,
        List<String> puntosObligatorios,
        String promocionId
) {
    public ParametrosViaje aParametros(long cotaCentavosArs) {
        return new ParametrosViaje(cotaCentavosArs, personas, dias,
                puntosObligatorios == null ? List.of() : puntosObligatorios, promocionId);
    }
}

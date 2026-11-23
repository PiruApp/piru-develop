package com.piru.presupuesto;

/**
 * Resultado derivado del plan. Nunca se edita a mano: siempre se recalcula.
 * Montos en centavos de peso argentino.
 *
 * @param margenCentavos cota menos a pagar. Positivo: sobra. Negativo: falta.
 */
public record CalculoPresupuesto(
        long brutoCentavos,
        String promocionId,
        long descuentoCentavos,
        long aPagarCentavos,
        long porPersonaCentavos,
        long cotaCentavos,
        long margenCentavos,
        boolean entraEnCota,
        boolean incluyeEstimados
) {
    public long faltanteCentavos() {
        return margenCentavos < 0 ? -margenCentavos : 0;
    }
}

package com.piru.cotizacion;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

/**
 * Cotización del dólar usada para convertir. Se muestra siempre con su fecha.
 *
 * @param casa      tipo de cambio de DolarAPI: oficial, blue, bolsa (MEP), contadoconliqui, tarjeta, mayorista
 * @param venta     pesos por dólar
 * @param respaldo  true si no se pudo consultar la fuente y se usa el último valor conocido o el configurado
 */
public record Cotizacion(
        String casa,
        BigDecimal venta,
        Instant fechaActualizacion,
        String fuente,
        boolean respaldo
) {
    public long aCentavosArs(BigDecimal monto, Moneda moneda) {
        BigDecimal pesos = moneda == Moneda.USD ? monto.multiply(venta) : monto;
        return pesos.movePointRight(2).setScale(0, RoundingMode.HALF_UP).longValueExact();
    }

    public Cotizacion comoRespaldo() {
        return new Cotizacion(casa, venta, fechaActualizacion, fuente, true);
    }
}

package com.piru.cotizacion;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Cachea la cotización y, si la fuente falla, devuelve el último valor conocido
 * o un valor configurado, marcado como respaldo (DOC-04A §15: toda integración tiene plan B).
 */
public class ServicioCotizacion {

    public static final Set<String> CASAS = Set.of("oficial", "blue", "bolsa", "contadoconliqui", "tarjeta", "mayorista");

    private final FuenteCotizacion fuente;
    private final Clock reloj;
    private final Duration vigenciaCache;
    private final BigDecimal ventaRespaldo;
    private final Map<String, Cotizacion> cache = new ConcurrentHashMap<>();
    private final Map<String, Instant> consultadas = new ConcurrentHashMap<>();

    public ServicioCotizacion(FuenteCotizacion fuente, Clock reloj, Duration vigenciaCache, BigDecimal ventaRespaldo) {
        this.fuente = fuente;
        this.reloj = reloj;
        this.vigenciaCache = vigenciaCache;
        this.ventaRespaldo = ventaRespaldo;
    }

    public Cotizacion obtener(String casa) {
        String clave = casa == null || casa.isBlank() ? "oficial" : casa.toLowerCase();
        if (!CASAS.contains(clave)) {
            throw new IllegalArgumentException("Tipo de cambio no soportado: " + casa + ". Opciones: " + CASAS);
        }
        Cotizacion enCache = cache.get(clave);
        Instant ahora = reloj.instant();
        if (enCache != null && cacheadaHace(clave).plus(vigenciaCache).isAfter(ahora)) {
            return enCache;
        }
        try {
            Cotizacion nueva = fuente.obtener(clave);
            cache.put(clave, nueva);
            consultadas.put(clave, ahora);
            return nueva;
        } catch (RuntimeException error) {
            if (enCache != null) {
                return enCache.comoRespaldo();
            }
            return new Cotizacion(clave, ventaRespaldo, null, "Valor de respaldo configurado", true);
        }
    }

    private Instant cacheadaHace(String clave) {
        return consultadas.getOrDefault(clave, Instant.EPOCH);
    }
}

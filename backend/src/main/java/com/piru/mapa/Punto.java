package com.piru.mapa;

/**
 * Localidad o atractivo de Jujuy. Coordenadas en WGS84.
 * Las coordenadas del catálogo semilla son aproximadas: verificarlas antes de publicar.
 *
 * @param imperdible     lugar que recomendamos a quien no conoce Jujuy
 * @param busquedaImagen texto para buscar una foto con licencia libre en Wikimedia
 */
public record Punto(
        String id,
        String nombre,
        String region,
        double latitud,
        double longitud,
        int altitudMsnm,
        String descripcion,
        boolean imperdible,
        String busquedaImagen
) {
}

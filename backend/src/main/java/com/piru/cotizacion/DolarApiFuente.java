package com.piru.cotizacion;

import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;

/** Adapter de https://dolarapi.com (gratuita, sin clave). Endpoint: GET /v1/dolares/{casa}. */
public class DolarApiFuente implements FuenteCotizacion {

    private final RestClient cliente;

    public DolarApiFuente(String urlBase, Duration timeout) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(timeout);
        factory.setReadTimeout(timeout);
        this.cliente = RestClient.builder().baseUrl(urlBase).requestFactory(factory).build();
    }

    @Override
    public Cotizacion obtener(String casa) {
        Respuesta r = cliente.get().uri("/v1/dolares/{casa}", casa).retrieve().body(Respuesta.class);
        if (r == null || r.venta() == null) {
            throw new IllegalStateException("DolarAPI devolvió una respuesta vacía para " + casa);
        }
        return new Cotizacion(casa, r.venta(), r.fechaActualizacion(), "DolarAPI", false);
    }

    /** Campos que usamos de la respuesta de DolarAPI. */
    record Respuesta(String casa, String nombre, BigDecimal compra, BigDecimal venta, Instant fechaActualizacion) {
    }
}

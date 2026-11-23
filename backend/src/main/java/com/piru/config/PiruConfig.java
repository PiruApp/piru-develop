package com.piru.config;

import com.piru.colaboradores.OfertasSemilla;
import com.piru.colaboradores.ServicioColaboradores;
import com.piru.cotizacion.DolarApiFuente;
import com.piru.cotizacion.ServicioCotizacion;
import com.piru.mapa.CatalogoPuntos;
import com.piru.planes.CatalogoPlantillas;
import com.piru.planes.MotorMatching;
import com.piru.promociones.CatalogoPromociones;
import com.piru.solicitudes.ServicioSolicitudes;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.ZoneId;

@Configuration
public class PiruConfig {

    @Bean
    Clock reloj() {
        return Clock.system(ZoneId.of("America/Argentina/Jujuy"));
    }

    @Bean
    CatalogoPuntos catalogoPuntos() {
        return new CatalogoPuntos();
    }

    @Bean
    CatalogoPromociones catalogoPromociones() {
        return new CatalogoPromociones();
    }

    @Bean
    MotorMatching motorMatching(CatalogoPromociones promociones) {
        return new MotorMatching(CatalogoPlantillas.semilla(), promociones);
    }

    @Bean
    ServicioSolicitudes servicioSolicitudes(MotorMatching motor, Clock reloj) {
        return new ServicioSolicitudes(motor, reloj);
    }

    @Bean
    ServicioColaboradores servicioColaboradores(CatalogoPuntos puntos, ServicioSolicitudes solicitudes, Clock reloj,
                                                @Value("${piru.semilla.ofertas}") boolean cargarSemilla) {
        ServicioColaboradores servicio = new ServicioColaboradores(puntos, solicitudes, reloj);
        if (cargarSemilla) {
            OfertasSemilla.cargar(servicio);
        }
        return servicio;
    }

    @Bean
    ServicioCotizacion servicioCotizacion(
            Clock reloj,
            @Value("${piru.cotizacion.url}") String url,
            @Value("${piru.cotizacion.timeout-ms}") long timeoutMs,
            @Value("${piru.cotizacion.cache-minutos}") long cacheMinutos,
            @Value("${piru.cotizacion.venta-respaldo}") BigDecimal ventaRespaldo) {
        return new ServicioCotizacion(new DolarApiFuente(url, Duration.ofMillis(timeoutMs)),
                reloj, Duration.ofMinutes(cacheMinutos), ventaRespaldo);
    }

    @Bean
    WebMvcConfigurer cors(@Value("${piru.cors.origenes}") String[] origenes) {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**").allowedOrigins(origenes).allowedMethods("GET", "POST");
            }
        };
    }
}

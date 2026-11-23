package com.piru.planes;

import com.piru.cotizacion.Cotizacion;
import com.piru.cotizacion.ServicioCotizacion;
import com.piru.mapa.CatalogoPuntos;
import com.piru.mapa.Punto;
import com.piru.promociones.CatalogoPromociones;
import com.piru.promociones.Promocion;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
public class PlanesController {

    private final MotorMatching motor;
    private final CatalogoPuntos puntos;
    private final CatalogoPromociones promociones;
    private final ServicioCotizacion cotizaciones;
    private final Clock reloj;

    public PlanesController(MotorMatching motor, CatalogoPuntos puntos, CatalogoPromociones promociones,
                            ServicioCotizacion cotizaciones, Clock reloj) {
        this.motor = motor;
        this.puntos = puntos;
        this.promociones = promociones;
        this.cotizaciones = cotizaciones;
        this.reloj = reloj;
    }

    @GetMapping("/puntos")
    public List<Punto> puntos() {
        return puntos.todos();
    }

    @GetMapping("/promociones")
    public List<Promocion> promociones() {
        return promociones.vigentes(LocalDate.now(reloj));
    }

    /** Circuitos disponibles; el marcado como recomendado alimenta el botón "Recomendame". */
    @GetMapping("/circuitos")
    public List<ResumenCircuito> circuitos() {
        return motor.plantillas().stream().map(ResumenCircuito::de).toList();
    }

    @PostMapping("/planes/generar")
    public GenerarPlanResponse generar(@Valid @RequestBody GenerarPlanRequest pedido) {
        List<String> obligatorios = pedido.puntosObligatorios() == null ? List.of() : pedido.puntosObligatorios();
        obligatorios.stream()
                .filter(id -> !puntos.existe(id))
                .findFirst()
                .ifPresent(id -> {
                    throw new IllegalArgumentException("El punto '" + id + "' no está en el catálogo de Jujuy del MVP");
                });

        Cotizacion cotizacion = cotizaciones.obtener(pedido.tipoCambio());
        long cota = cotizacion.aCentavosArs(pedido.presupuesto(), pedido.moneda());

        ParametrosViaje parametros = pedido.aParametros(cota);

        return new GenerarPlanResponse(cotizacion, cota, motor.generar(parametros, LocalDate.now(reloj)));
    }
}

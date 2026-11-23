package com.piru.cotizacion;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cotizaciones")
public class CotizacionController {

    private final ServicioCotizacion servicio;

    public CotizacionController(ServicioCotizacion servicio) {
        this.servicio = servicio;
    }

    @GetMapping("/{casa}")
    public Cotizacion obtener(@PathVariable String casa) {
        return servicio.obtener(casa);
    }
}

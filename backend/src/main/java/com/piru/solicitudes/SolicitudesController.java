package com.piru.solicitudes;

import com.piru.cotizacion.Cotizacion;
import com.piru.cotizacion.ServicioCotizacion;
import com.piru.usuarios.Identidad;
import com.piru.usuarios.IdentidadHttp;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Checkout y "Mis viajes" del viajero. Solo accesible vía BFF (FiltroClaveInterna). */
@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudesController {

    private final ServicioSolicitudes servicio;
    private final ServicioCotizacion cotizaciones;

    public SolicitudesController(ServicioSolicitudes servicio, ServicioCotizacion cotizaciones) {
        this.servicio = servicio;
        this.cotizaciones = cotizaciones;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VistaViajero crear(@Valid @RequestBody CheckoutRequest pedido, HttpServletRequest http) {
        Identidad viajero = IdentidadHttp.desde(http);
        Cotizacion cotizacion = cotizaciones.obtener(pedido.parametros().tipoCambio());
        long cota = cotizacion.aCentavosArs(pedido.parametros().presupuesto(), pedido.parametros().moneda());
        NuevaSolicitud nueva = new NuevaSolicitud(pedido.claveEnvio(), pedido.plantillaId(),
                pedido.parametros().aParametros(cota), pedido.fechaViaje(), pedido.telefono(), pedido.notas());
        return VistaViajero.de(servicio.crear(nueva, viajero));
    }

    @GetMapping("/mias")
    public List<VistaViajero> mias(HttpServletRequest http) {
        return servicio.delViajero(IdentidadHttp.desde(http).email()).stream().map(VistaViajero::de).toList();
    }

    @PostMapping("/{id}/cancelar")
    public VistaViajero cancelar(@PathVariable String id, HttpServletRequest http) {
        return VistaViajero.de(servicio.cancelar(id, IdentidadHttp.desde(http)));
    }
}

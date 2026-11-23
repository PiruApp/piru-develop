package com.piru.colaboradores;

import com.piru.solicitudes.EstadoSolicitud;
import com.piru.usuarios.IdentidadHttp;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
public class ColaboradoresController {

    private final ServicioColaboradores servicio;

    public ColaboradoresController(ServicioColaboradores servicio) {
        this.servicio = servicio;
    }

    /** Público: prestadores con ofertas activas en los puntos de un circuito. */
    @GetMapping("/api/ofertas")
    public List<Oferta> ofertasEn(@RequestParam String puntos) {
        return servicio.activasEn(Arrays.stream(puntos.split(",")).map(String::trim).toList());
    }

    // ---- Panel del colaborador (solo vía BFF) ----

    @GetMapping("/api/colaboradores/ofertas")
    public List<Oferta> misOfertas(HttpServletRequest http) {
        return servicio.deColaborador(IdentidadHttp.desde(http).email());
    }

    @PostMapping("/api/colaboradores/ofertas")
    @ResponseStatus(HttpStatus.CREATED)
    public Oferta publicar(@RequestBody NuevaOferta nueva, HttpServletRequest http) {
        return servicio.publicar(nueva, IdentidadHttp.desde(http));
    }

    public record CambioActiva(boolean activa) {
    }

    @PatchMapping("/api/colaboradores/ofertas/{id}")
    public Oferta cambiarActiva(@PathVariable String id, @RequestBody CambioActiva cambio, HttpServletRequest http) {
        return servicio.cambiarActiva(id, cambio.activa(), IdentidadHttp.desde(http));
    }

    @GetMapping("/api/colaboradores/solicitudes")
    public List<ServicioColaboradores.VistaSolicitud> solicitudes(HttpServletRequest http) {
        return servicio.solicitudesPara(IdentidadHttp.desde(http));
    }

    public record CambioEstado(EstadoSolicitud estado) {
    }

    @PostMapping("/api/colaboradores/solicitudes/{id}/estado")
    public ServicioColaboradores.VistaSolicitud responder(@PathVariable String id, @RequestBody CambioEstado cambio,
                                                           HttpServletRequest http) {
        return servicio.responder(id, cambio.estado(), IdentidadHttp.desde(http));
    }
}

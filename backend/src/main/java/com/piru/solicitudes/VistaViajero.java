package com.piru.solicitudes;

import com.piru.planes.PlanCandidato;
import com.piru.usuarios.TipoColaborador;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/** Lo que ve el viajero de su solicitud: la copia fija del plan y quién le respondió. */
public record VistaViajero(
        String id,
        Instant creadaEn,
        LocalDate fechaViaje,
        String estado,
        PlanCandidato circuito,
        int personas,
        List<RespuestaVisible> respuestas
) {
    public record RespuestaVisible(String colaboradorNombre, TipoColaborador tipo, EstadoSolicitud estado, Instant actualizadaEn) {
    }

    public static VistaViajero de(Solicitud s) {
        List<RespuestaVisible> respuestas = s.respuestas().values().stream()
                .map(r -> new RespuestaVisible(r.colaboradorNombre(), r.tipo(), r.estado(), r.actualizadaEn()))
                .toList();
        String estado;
        if (s.cancelada()) {
            estado = "CANCELADA";
        } else if (respuestas.stream().anyMatch(r -> r.estado() == EstadoSolicitud.CERRADO_FUERA)) {
            estado = "CONFIRMADA_POR_WHATSAPP";
        } else if (respuestas.stream().anyMatch(r -> r.estado() == EstadoSolicitud.INFORMADO)) {
            estado = "EN_CONTACTO";
        } else {
            estado = "ENVIADA";
        }
        return new VistaViajero(s.id(), s.creadaEn(), s.fechaViaje(), estado, s.copiaFija(),
                s.parametros().personas(), respuestas);
    }
}

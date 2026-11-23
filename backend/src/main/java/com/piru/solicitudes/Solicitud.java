package com.piru.solicitudes;

import com.piru.usuarios.TipoColaborador;
import com.piru.planes.ParametrosViaje;
import com.piru.planes.PlanCandidato;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Pedido de reserva que nace del checkout. Lleva una COPIA FIJA del plan recalculado en el servidor:
 * si el viajero recalcula después, lo que ven los colaboradores no cambia (DOC-04A §11).
 * Cada colaborador de la zona responde por separado.
 */
public record Solicitud(
        String id,
        String claveEnvio,
        Instant creadaEn,
        LocalDate fechaViaje,
        String viajeroEmail,
        String viajeroNombre,
        String viajeroTelefono,
        String notas,
        ParametrosViaje parametros,
        PlanCandidato copiaFija,
        boolean cancelada,
        Map<String, Respuesta> respuestas
) {
    public static final Duration VENCIMIENTO = Duration.ofHours(72);

    public record Respuesta(String colaboradorNombre, TipoColaborador tipo, EstadoSolicitud estado, Instant actualizadaEn) {
    }

    public Solicitud {
        respuestas = Map.copyOf(respuestas);
    }

    public EstadoSolicitud estadoPara(String colaboradorEmail, Instant ahora) {
        if (cancelada) {
            return EstadoSolicitud.CANCELADO;
        }
        Respuesta r = respuestas.get(colaboradorEmail);
        EstadoSolicitud estado = r == null ? EstadoSolicitud.PENDIENTE : r.estado();
        if (estado == EstadoSolicitud.PENDIENTE && creadaEn.plus(VENCIMIENTO).isBefore(ahora)) {
            return EstadoSolicitud.VENCIDO;
        }
        return estado;
    }

    public Solicitud conRespuesta(String colaboradorEmail, Respuesta respuesta) {
        Map<String, Respuesta> nuevas = new LinkedHashMap<>(respuestas);
        nuevas.put(colaboradorEmail, respuesta);
        return new Solicitud(id, claveEnvio, creadaEn, fechaViaje, viajeroEmail, viajeroNombre, viajeroTelefono,
                notas, parametros, copiaFija, cancelada, nuevas);
    }

    public Solicitud cancelar() {
        return new Solicitud(id, claveEnvio, creadaEn, fechaViaje, viajeroEmail, viajeroNombre, viajeroTelefono,
                notas, parametros, copiaFija, true, respuestas);
    }
}

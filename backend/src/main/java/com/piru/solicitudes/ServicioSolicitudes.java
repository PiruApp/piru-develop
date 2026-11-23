package com.piru.solicitudes;

import com.piru.usuarios.Identidad;
import com.piru.planes.MotorMatching;
import com.piru.planes.PlanCandidato;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Módulo de solicitudes (checkout). Guarda en memoria en el MVP; pasa a MySQL con JPA más adelante.
 */
public class ServicioSolicitudes {

    private final MotorMatching motor;
    private final Clock reloj;
    private final Map<String, Solicitud> porId = new ConcurrentHashMap<>();
    private final Map<String, String> idPorClave = new ConcurrentHashMap<>();

    public ServicioSolicitudes(MotorMatching motor, Clock reloj) {
        this.motor = motor;
        this.reloj = reloj;
    }

    public synchronized Solicitud crear(NuevaSolicitud pedido, Identidad viajero) {
        if (pedido.claveEnvio() == null || pedido.claveEnvio().isBlank()) {
            throw new IllegalArgumentException("Falta la clave de envío");
        }
        String existente = idPorClave.get(viajero.email() + "|" + pedido.claveEnvio());
        if (existente != null) {
            return porId.get(existente); // reintento: misma solicitud, sin duplicar
        }
        if (pedido.telefono() == null || pedido.telefono().replaceAll("\\D", "").length() < 8) {
            throw new IllegalArgumentException("Ingresá un teléfono de contacto válido (con código de área)");
        }
        LocalDate hoy = LocalDate.now(reloj);
        if (pedido.fechaViaje() == null || pedido.fechaViaje().isBefore(hoy)) {
            throw new IllegalArgumentException("La fecha del viaje no puede ser anterior a hoy");
        }

        // Se recalcula en el servidor: no se confía en los montos del navegador.
        PlanCandidato copia = motor.generar(pedido.parametros(), hoy).stream()
                .filter(c -> c.plantillaId().equals(pedido.plantillaId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "El circuito elegido no está disponible para esas personas y días"));

        Solicitud solicitud = new Solicitud(
                "sol_" + UUID.randomUUID().toString().substring(0, 8),
                pedido.claveEnvio(),
                Instant.now(reloj),
                pedido.fechaViaje(),
                viajero.email(),
                viajero.nombre(),
                pedido.telefono().trim(),
                pedido.notas() == null ? "" : pedido.notas().trim(),
                pedido.parametros(),
                copia,
                false,
                Map.of());
        porId.put(solicitud.id(), solicitud);
        idPorClave.put(viajero.email() + "|" + pedido.claveEnvio(), solicitud.id());
        return solicitud;
    }

    public List<Solicitud> delViajero(String email) {
        return ordenadas(porId.values().stream().filter(s -> s.viajeroEmail().equals(email)).toList());
    }

    /** Solicitudes cuyo circuito pasa por alguno de los puntos donde el colaborador ofrece servicios. */
    public List<Solicitud> quePasanPor(Set<String> puntoIds) {
        if (puntoIds.isEmpty()) {
            return List.of();
        }
        return ordenadas(porId.values().stream()
                .filter(s -> s.copiaFija().puntosEnOrden().stream().anyMatch(puntoIds::contains))
                .toList());
    }

    public synchronized Solicitud cancelar(String id, Identidad viajero) {
        Solicitud s = buscar(id).filter(x -> x.viajeroEmail().equals(viajero.email()))
                .orElseThrow(() -> new IllegalArgumentException("No encontramos esa solicitud"));
        Solicitud cancelada = s.cancelar();
        porId.put(id, cancelada);
        return cancelada;
    }

    public synchronized Solicitud responder(String id, Identidad colaborador, EstadoSolicitud destino, Set<String> zonas) {
        if (!colaborador.esColaborador()) {
            throw new IllegalArgumentException("Solo un colaborador puede responder solicitudes");
        }
        Solicitud s = buscar(id)
                .filter(x -> x.copiaFija().puntosEnOrden().stream().anyMatch(zonas::contains))
                .orElseThrow(() -> new IllegalArgumentException("No encontramos esa solicitud en tus zonas"));
        Instant ahora = Instant.now(reloj);
        EstadoSolicitud actual = s.estadoPara(colaborador.email(), ahora);
        if (!actual.colaboradorPuedePasarA(destino)) {
            throw new IllegalArgumentException("No se puede pasar de " + actual + " a " + destino);
        }
        Solicitud actualizada = s.conRespuesta(colaborador.email(),
                new Solicitud.Respuesta(colaborador.nombre(), colaborador.tipo(), destino, ahora));
        porId.put(id, actualizada);
        return actualizada;
    }

    public Optional<Solicitud> buscar(String id) {
        return Optional.ofNullable(porId.get(id));
    }

    public Instant ahora() {
        return Instant.now(reloj);
    }

    private static List<Solicitud> ordenadas(Collection<Solicitud> solicitudes) {
        return solicitudes.stream().sorted(Comparator.comparing(Solicitud::creadaEn).reversed()).toList();
    }
}

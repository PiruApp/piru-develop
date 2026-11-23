package com.piru.colaboradores;

import com.piru.usuarios.Identidad;
import com.piru.usuarios.TipoColaborador;

import com.piru.mapa.CatalogoPuntos;
import com.piru.solicitudes.EstadoSolicitud;
import com.piru.solicitudes.ServicioSolicitudes;
import com.piru.solicitudes.Solicitud;

import java.math.RoundingMode;
import java.time.Clock;
import java.time.Instant;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Módulo colaboradores: guías, hoteles y restaurantes publican ofertas en puntos de Jujuy
 * y reciben las solicitudes de los circuitos que pasan por esos puntos.
 */
public class ServicioColaboradores {

    private final Map<String, Oferta> ofertas = new ConcurrentHashMap<>();
    private final CatalogoPuntos puntos;
    private final ServicioSolicitudes solicitudes;
    private final Clock reloj;

    public ServicioColaboradores(CatalogoPuntos puntos, ServicioSolicitudes solicitudes, Clock reloj) {
        this.puntos = puntos;
        this.solicitudes = solicitudes;
        this.reloj = reloj;
    }

    public Oferta publicar(NuevaOferta nueva, Identidad colaborador) {
        exigirColaborador(colaborador);
        if (nueva.titulo() == null || nueva.titulo().isBlank()) {
            throw new IllegalArgumentException("La oferta necesita un título");
        }
        if (nueva.puntoId() == null || !puntos.existe(nueva.puntoId())) {
            throw new IllegalArgumentException("Elegí un lugar de Jujuy del catálogo");
        }
        if (nueva.precio() == null || nueva.precio().signum() <= 0) {
            throw new IllegalArgumentException("El precio debe ser mayor a 0");
        }
        if (nueva.capacidad() < 1) {
            throw new IllegalArgumentException("La capacidad debe ser al menos 1");
        }
        long centavos = nueva.precio().movePointRight(2).setScale(0, RoundingMode.HALF_UP).longValueExact();
        Oferta oferta = new Oferta("of_" + UUID.randomUUID().toString().substring(0, 8),
                colaborador.email(), colaborador.nombre(), colaborador.tipo(), nueva.titulo().trim(),
                nueva.descripcion() == null ? "" : nueva.descripcion().trim(), nueva.puntoId(), centavos,
                colaborador.tipo().unidadPrecio(), nueva.capacidad(), true, Instant.now(reloj));
        ofertas.put(oferta.id(), oferta);
        return oferta;
    }

    public List<Oferta> deColaborador(String email) {
        return ordenadas(ofertas.values().stream().filter(o -> o.colaboradorEmail().equals(email)).toList());
    }

    public Oferta cambiarActiva(String id, boolean activa, Identidad colaborador) {
        Oferta o = ofertas.get(id);
        if (o == null || !o.colaboradorEmail().equals(colaborador.email())) {
            throw new IllegalArgumentException("No encontramos esa oferta entre las tuyas");
        }
        Oferta actualizada = o.conActiva(activa);
        ofertas.put(id, actualizada);
        return actualizada;
    }

    /** Ofertas activas en los puntos de un circuito: se muestran al viajero en el detalle y el checkout. */
    public List<Oferta> activasEn(Collection<String> puntoIds) {
        return ofertas.values().stream()
                .filter(Oferta::activa)
                .filter(o -> puntoIds.contains(o.puntoId()))
                .sorted(Comparator.comparing(Oferta::tipo).thenComparing(Oferta::precioCentavos))
                .toList();
    }

    /** Puntos donde el colaborador tiene ofertas activas: definen qué solicitudes recibe. */
    public Set<String> zonas(String email) {
        return ofertas.values().stream()
                .filter(o -> o.colaboradorEmail().equals(email) && o.activa())
                .map(Oferta::puntoId)
                .collect(Collectors.toUnmodifiableSet());
    }

    public List<VistaSolicitud> solicitudesPara(Identidad colaborador) {
        exigirColaborador(colaborador);
        Set<String> zonas = zonas(colaborador.email());
        Instant ahora = solicitudes.ahora();
        return solicitudes.quePasanPor(zonas).stream()
                .map(s -> VistaSolicitud.de(s, s.estadoPara(colaborador.email(), ahora), zonas))
                .toList();
    }

    public VistaSolicitud responder(String solicitudId, EstadoSolicitud destino, Identidad colaborador) {
        exigirColaborador(colaborador);
        Set<String> zonas = zonas(colaborador.email());
        Solicitud s = solicitudes.responder(solicitudId, colaborador, destino, zonas);
        return VistaSolicitud.de(s, s.estadoPara(colaborador.email(), solicitudes.ahora()), zonas);
    }

    private static void exigirColaborador(Identidad identidad) {
        if (!identidad.esColaborador()) {
            throw new IllegalArgumentException("Esta acción es solo para colaboradores (guía, hotel o restaurante)");
        }
    }

    private static List<Oferta> ordenadas(List<Oferta> lista) {
        return lista.stream().sorted(Comparator.comparing(Oferta::creadaEn).reversed()).toList();
    }

    /** Lo que ve un colaborador de una solicitud: sin presupuesto del viajero, solo lo necesario para responder. */
    public record VistaSolicitud(
            String id,
            Instant creadaEn,
            java.time.LocalDate fechaViaje,
            String viajeroNombre,
            String viajeroTelefono,
            int personas,
            String circuito,
            List<String> puntosEnTuZona,
            String notas,
            EstadoSolicitud estado
    ) {
        static VistaSolicitud de(Solicitud s, EstadoSolicitud estado, Set<String> zonas) {
            return new VistaSolicitud(s.id(), s.creadaEn(), s.fechaViaje(), s.viajeroNombre(),
                    s.viajeroTelefono(), s.parametros().personas(), s.copiaFija().nombre(),
                    s.copiaFija().puntosEnOrden().stream().filter(zonas::contains).toList(), s.notas(), estado);
        }
    }
}

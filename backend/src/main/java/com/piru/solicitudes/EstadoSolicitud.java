package com.piru.solicitudes;

/**
 * Estado de una solicitud vista por un colaborador (DOC-04A §12).
 * VENCIDO y CANCELADO no se guardan como respuesta: se derivan del tiempo y de la cancelación del viajero.
 */
public enum EstadoSolicitud {
    PENDIENTE,
    INFORMADO,
    CERRADO_FUERA,
    DESCARTADO,
    VENCIDO,
    CANCELADO;

    /** Transiciones que puede hacer un colaborador. */
    public boolean colaboradorPuedePasarA(EstadoSolicitud destino) {
        return switch (this) {
            case PENDIENTE -> destino == INFORMADO || destino == DESCARTADO;
            case INFORMADO -> destino == CERRADO_FUERA || destino == DESCARTADO;
            default -> false;
        };
    }
}

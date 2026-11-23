package com.piru.presupuesto;

/** Cómo crece un costo con la cantidad de personas. */
public enum Escala {
    /** Se multiplica por cada persona (comidas, entradas). */
    POR_PERSONA,
    /** Un único monto para todo el grupo (un vehículo 4x4 con guía). */
    POR_GRUPO,
    /** Se multiplica por habitaciones dobles necesarias: ceil(personas / 2). */
    POR_HABITACION_DOBLE;

    public int unidades(int personas) {
        return switch (this) {
            case POR_PERSONA -> personas;
            case POR_GRUPO -> 1;
            case POR_HABITACION_DOBLE -> (personas + 1) / 2;
        };
    }
}

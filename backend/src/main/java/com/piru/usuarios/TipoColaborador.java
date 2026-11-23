package com.piru.usuarios;

public enum TipoColaborador {
    GUIA("por persona"),
    HOTEL("por noche"),
    RESTAURANTE("por cubierto");

    private final String unidadPrecio;

    TipoColaborador(String unidadPrecio) {
        this.unidadPrecio = unidadPrecio;
    }

    public String unidadPrecio() {
        return unidadPrecio;
    }
}

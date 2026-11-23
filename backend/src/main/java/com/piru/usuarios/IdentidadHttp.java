package com.piru.usuarios;

import jakarta.servlet.http.HttpServletRequest;

/** Lee la identidad que envía el BFF (ya validada por la clave interna). */
public final class IdentidadHttp {

    private IdentidadHttp() {
    }

    public static Identidad desde(HttpServletRequest request) {
        String tipo = request.getHeader("X-Piru-Tipo");
        TipoColaborador tipoColaborador = null;
        if (tipo != null && !tipo.isBlank()) {
            try {
                tipoColaborador = TipoColaborador.valueOf(tipo.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Tipo de colaborador desconocido: " + tipo);
            }
        }
        String nombre = request.getHeader("X-Piru-Nombre");
        return new Identidad(
                request.getHeader("X-Piru-Email"),
                nombre == null ? "" : java.net.URLDecoder.decode(nombre, java.nio.charset.StandardCharsets.UTF_8),
                request.getHeader("X-Piru-Rol"),
                tipoColaborador);
    }
}

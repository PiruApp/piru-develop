package com.piru.usuarios;

/**
 * Quién hace el pedido. La arma el frontend (BFF de Next.js) a partir de la sesión de Auth.js
 * y la envía con la clave interna; el backend no la recibe del navegador.
 *
 * @param tipo solo para colaboradores; null para viajeros
 */
public record Identidad(String email, String nombre, String rol, TipoColaborador tipo) {

    public static final String ROL_VIAJERO = "VIAJERO";
    public static final String ROL_COLABORADOR = "COLABORADOR";

    public Identidad {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Falta el usuario de la sesión");
        }
        email = email.trim().toLowerCase();
    }

    public boolean esColaborador() {
        return ROL_COLABORADOR.equals(rol) && tipo != null;
    }
}

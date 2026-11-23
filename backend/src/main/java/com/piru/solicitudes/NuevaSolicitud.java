package com.piru.solicitudes;

import com.piru.planes.ParametrosViaje;

import java.time.LocalDate;

/**
 * Pedido del checkout, con los parámetros ya convertidos a pesos.
 *
 * @param claveEnvio la genera el navegador una vez por checkout: un reintento no duplica la solicitud
 */
public record NuevaSolicitud(
        String claveEnvio,
        String plantillaId,
        ParametrosViaje parametros,
        LocalDate fechaViaje,
        String telefono,
        String notas
) {
}

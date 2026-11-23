package com.piru.solicitudes;

import com.piru.planes.GenerarPlanRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CheckoutRequest(
        @NotBlank String claveEnvio,
        @NotBlank String plantillaId,
        @NotNull @Valid GenerarPlanRequest parametros,
        @NotNull LocalDate fechaViaje,
        @NotBlank String telefono,
        String notas
) {
}

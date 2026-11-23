package com.piru.usuarios;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Las rutas con datos de usuarios solo aceptan pedidos del BFF de Next.js, que agrega la clave interna
 * y la identidad de la sesión de Auth.js. El navegador nunca llama a estas rutas directamente.
 * Próximo paso: validar el JWT de Auth.js en lugar de la clave compartida.
 */
@Component
public class FiltroClaveInterna extends OncePerRequestFilter {

    public static final String HEADER_CLAVE = "X-Piru-Clave";
    private final byte[] clave;

    public FiltroClaveInterna(@Value("${piru.bff.clave}") String clave) {
        if (clave == null || clave.length() < 16) {
            throw new IllegalStateException("Configurá PIRU_BFF_CLAVE con al menos 16 caracteres");
        }
        this.clave = clave.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String ruta = request.getRequestURI();
        return !(ruta.startsWith("/api/solicitudes") || ruta.startsWith("/api/colaboradores"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String recibida = request.getHeader(HEADER_CLAVE);
        boolean valida = recibida != null
                && MessageDigest.isEqual(clave, recibida.getBytes(StandardCharsets.UTF_8));
        if (!valida) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":\"No autorizado\"}");
            return;
        }
        chain.doFilter(request, response);
    }
}

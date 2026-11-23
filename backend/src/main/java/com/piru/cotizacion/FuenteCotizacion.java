package com.piru.cotizacion;

/** Puerto hacia el proveedor externo de cotizaciones (Adapter). */
public interface FuenteCotizacion {
    Cotizacion obtener(String casa);
}

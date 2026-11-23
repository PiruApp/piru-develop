package com.piru.colaboradores;

import com.piru.usuarios.Identidad;
import com.piru.usuarios.TipoColaborador;

import java.math.BigDecimal;

/** Prestadores de ejemplo para que el viajero vea ofertas antes de que se registren los reales. */
public final class OfertasSemilla {

    private OfertasSemilla() {
    }

    public static void cargar(ServicioColaboradores servicio) {
        Identidad guia = new Identidad("guia.demo@piru.app", "Guía de ejemplo · Quebrada", Identidad.ROL_COLABORADOR, TipoColaborador.GUIA);
        Identidad hotel = new Identidad("hotel.demo@piru.app", "Hostal de ejemplo · Purmamarca", Identidad.ROL_COLABORADOR, TipoColaborador.HOTEL);
        Identidad resto = new Identidad("resto.demo@piru.app", "Restaurante de ejemplo · Tilcara", Identidad.ROL_COLABORADOR, TipoColaborador.RESTAURANTE);

        servicio.publicar(new NuevaOferta("Trekking a la Garganta del Diablo",
                "Salida de medio día con guía habilitado.", "tilcara", new BigDecimal("20000"), 8), guia);
        servicio.publicar(new NuevaOferta("Atardecer en el Hornocal",
                "Traslado y guiado al mirador de los 14 colores.", "hornocal", new BigDecimal("28000"), 6), guia);
        servicio.publicar(new NuevaOferta("Habitación doble con desayuno",
                "A dos cuadras de la plaza.", "purmamarca", new BigDecimal("55000"), 4), hotel);
        servicio.publicar(new NuevaOferta("Menú andino de pasos",
                "Cordero, quinoa y empanadas de la Quebrada.", "tilcara", new BigDecimal("18000"), 30), resto);
    }
}

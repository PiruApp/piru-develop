package com.piru.mapa;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Puntos semilla del MVP (doc/03_visual/contenido_destinos_jujuy.md y guía turística).
 * Coordenadas y altitudes APROXIMADAS: validarlas antes de producción.
 */
public class CatalogoPuntos {

    private final List<Punto> puntos = List.of(
            p("san_salvador", "San Salvador de Jujuy", "Valles", -24.1858, -65.2995, 1259,
                    "Capital y punto de partida de los circuitos.", false, "San Salvador de Jujuy catedral"),
            p("volcan", "Volcán", "Quebrada", -23.9167, -65.4667, 2078,
                    "Entrada a la Quebrada de Humahuaca.", false, "Volcán Jujuy Quebrada"),
            p("purmamarca", "Purmamarca", "Quebrada", -23.7447, -65.4986, 2324,
                    "El Cerro de los Siete Colores y el Paseo de los Colorados.", true, "Cerro de los Siete Colores Purmamarca"),
            p("maimara", "Maimará", "Quebrada", -23.6247, -65.4083, 2383,
                    "La Paleta del Pintor y viñedos de altura.", false, "Paleta del Pintor Maimará"),
            p("tilcara", "Tilcara", "Quebrada", -23.5778, -65.3958, 2465,
                    "Pucará preincaico y la Garganta del Diablo.", true, "Pucará de Tilcara"),
            p("uquia", "Uquía", "Quebrada", -23.3036, -65.3561, 2824,
                    "Ángeles arcabuceros y la Quebrada de las Señoritas.", false, "Uquía iglesia Jujuy"),
            p("humahuaca", "Humahuaca", "Quebrada", -23.2054, -65.3505, 3012,
                    "Monumento a la Independencia y base para el Hornocal.", true, "Humahuaca monumento independencia"),
            p("hornocal", "Serranía del Hornocal", "Quebrada", -23.2208, -65.2420, 4350,
                    "El cerro de los 14 colores, ideal al atardecer.", true, "Serranía de Hornocal"),
            p("cuesta_lipan", "Cuesta de Lipán", "Puna", -23.6667, -65.6167, 4170,
                    "Caracoles hasta el Abra de Potrerillos.", false, "Cuesta de Lipán"),
            p("salinas_grandes", "Salinas Grandes", "Puna", -23.6300, -65.8700, 3450,
                    "Salar blanco con piletas turquesas.", true, "Salinas Grandes Jujuy salar"),
            p("abra_pampa", "Abra Pampa", "Puna", -22.7225, -65.6969, 3484,
                    "Puerta al altiplano jujeño.", false, "Abra Pampa Jujuy"),
            p("casabindo", "Casabindo", "Puna", -22.9833, -66.0333, 3500,
                    "Iglesia colonial y tradiciones puneñas.", false, "Casabindo iglesia"),
            p("laguna_pozuelos", "Laguna de los Pozuelos", "Puna", -22.3500, -65.9800, 3650,
                    "Humedal altoandino con tres especies de flamencos.", false, "Laguna de los Pozuelos flamencos"),
            p("dique_la_cienaga", "Dique La Ciénaga", "Valles", -24.4167, -65.2667, 1200,
                    "Diques de El Carmen para pasar el día.", false, "Dique La Ciénaga El Carmen Jujuy"),
            p("lagunas_yala", "Lagunas de Yala", "Valles", -24.1000, -65.4800, 2100,
                    "Lagunas de montaña entre bosques y neblina.", false, "Lagunas de Yala Jujuy"),
            p("termas_reyes", "Termas de Reyes", "Valles", -24.1717, -65.4867, 1800,
                    "Aguas termales en la quebrada de Reyes.", false, "Termas de Reyes Jujuy"),
            p("libertador", "Libertador Gral. San Martín", "Yungas", -23.8100, -64.7900, 450,
                    "Base para recorrer las Yungas.", false, "Libertador General San Martín Jujuy"),
            p("calilegua", "Parque Nacional Calilegua", "Yungas", -23.7300, -64.8500, 600,
                    "Selva de montaña, senderos y aves.", true, "Parque nacional Calilegua"),
            p("termas_caimancito", "Termas de Caimancito", "Yungas", -23.7400, -64.5900, 400,
                    "Termas en medio del monte del Ramal.", false, "Caimancito Jujuy")
    );

    private final Map<String, Punto> porId = puntos.stream()
            .collect(Collectors.toUnmodifiableMap(Punto::id, Function.identity()));

    private static Punto p(String id, String nombre, String region, double lat, double lng, int alt,
                           String descripcion, boolean imperdible, String busquedaImagen) {
        return new Punto(id, nombre, region, lat, lng, alt, descripcion, imperdible, busquedaImagen);
    }

    public List<Punto> todos() {
        return puntos;
    }

    public List<String> imperdibles() {
        return puntos.stream().filter(Punto::imperdible).map(Punto::id).toList();
    }

    public Optional<Punto> buscar(String id) {
        return Optional.ofNullable(porId.get(id));
    }

    public boolean existe(String id) {
        return porId.containsKey(id);
    }
}

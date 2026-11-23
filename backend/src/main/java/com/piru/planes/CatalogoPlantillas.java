package com.piru.planes;

import com.piru.presupuesto.CategoriaCosto;
import com.piru.presupuesto.Escala;
import com.piru.presupuesto.TipoCosto;

import java.time.LocalDate;
import java.util.List;

import static com.piru.presupuesto.CategoriaCosto.*;
import static com.piru.presupuesto.Escala.*;

/**
 * Plantillas semilla del MVP. TODOS los montos son referencias ESTIMADAS para probar el flujo:
 * hay que reemplazarlos por tarifas reales de agencias antes de mostrarlos como precio.
 * Se migran a MySQL en la próxima iteración.
 */
public final class CatalogoPlantillas {

    private static final String FUENTE = "Referencia Piru (a validar)";
    private static final LocalDate FECHA = LocalDate.of(2026, 11, 22);

    private CatalogoPlantillas() {
    }

    public static List<Plantilla> semilla() {
        return List.of(quebradaClasica(), escapadaQuebradaCorta(), punaProfunda(), vallesDiques(), yungasCalilegua());
    }

    private static Plantilla quebradaClasica() {
        String id = "quebrada_clasica_puna";
        return new Plantilla(id, "Quebrada Clásica & Puna",
                "Purmamarca, Salinas Grandes por la Cuesta de Lipán, Tilcara y el Hornocal al atardecer.",
                "Quebrada y Puna", 3, 2, 1, 8,
                List.of(
                        new DiaPlantilla(1, "Subida a la Quebrada y Purmamarca", "Purmamarca",
                                List.of("san_salvador", "volcan", "purmamarca")),
                        new DiaPlantilla(2, "Cuesta de Lipán, Salinas Grandes y Tilcara", "Tilcara",
                                List.of("cuesta_lipan", "salinas_grandes", "tilcara")),
                        new DiaPlantilla(3, "Humahuaca, Hornocal y regreso", "San Salvador de Jujuy",
                                List.of("humahuaca", "hornocal", "san_salvador"))),
                List.of(
                        item(id, 1, ALOJAMIENTO, "Hostal andino (habitación doble)", 55_000, POR_HABITACION_DOBLE, 2),
                        item(id, 1, TRANSPORTE, "Bus o combi San Salvador ⇄ Quebrada (ida y vuelta)", 18_000, POR_PERSONA, 2),
                        item(id, 2, EXCURSION, "Excursión 4x4 Cuesta de Lipán + Salinas Grandes", 45_000, POR_PERSONA, 1),
                        item(id, 2, ENTRADA, "Entrada Pucará de Tilcara", 5_000, POR_PERSONA, 1),
                        item(id, 3, EXCURSION, "Combi al Hornocal al atardecer", 25_000, POR_PERSONA, 1),
                        item(id, 1, GASTRONOMIA, "Comidas (por día)", 30_000, POR_PERSONA, 3)),
                true, "Si es tu primera vez en Jujuy: en 3 días ves los colores de la Quebrada, la Puna y el Hornocal.");
    }

    private static Plantilla escapadaQuebradaCorta() {
        String id = "escapada_quebrada_corta";
        return new Plantilla(id, "Escapada Quebrada Corta",
                "Fin de semana compacto: Purmamarca, Maimará y Tilcara con una noche en la Quebrada.",
                "Quebrada", 2, 1, 1, 10,
                List.of(
                        new DiaPlantilla(1, "Purmamarca y Paleta del Pintor", "Tilcara",
                                List.of("san_salvador", "purmamarca", "maimara", "tilcara")),
                        new DiaPlantilla(2, "Pucará de Tilcara y regreso", "San Salvador de Jujuy",
                                List.of("tilcara", "san_salvador"))),
                List.of(
                        item(id, 1, ALOJAMIENTO, "Hospedaje en Tilcara (habitación doble)", 50_000, POR_HABITACION_DOBLE, 1),
                        item(id, 1, TRANSPORTE, "Bus San Salvador ⇄ Tilcara (ida y vuelta)", 18_000, POR_PERSONA, 2),
                        item(id, 2, ENTRADA, "Entrada Pucará de Tilcara", 5_000, POR_PERSONA, 1),
                        item(id, 1, GASTRONOMIA, "Comidas (por día)", 28_000, POR_PERSONA, 2)),
                false, null);
    }

    private static Plantilla punaProfunda() {
        String id = "puna_profunda";
        return new Plantilla(id, "Puna Profunda & Flamencos",
                "Abra Pampa, Casabindo y Laguna de los Pozuelos con 4x4 y guía.",
                "Puna", 2, 1, 2, 6,
                List.of(
                        new DiaPlantilla(1, "Altiplano: Abra Pampa y Casabindo", "Casabindo",
                                List.of("san_salvador", "abra_pampa", "casabindo")),
                        new DiaPlantilla(2, "Laguna de los Pozuelos y regreso", "San Salvador de Jujuy",
                                List.of("laguna_pozuelos", "san_salvador"))),
                List.of(
                        item(id, 1, EXCURSION, "4x4 con guía habilitado (2 días)", 150_000, POR_PERSONA, 1),
                        item(id, 1, ALOJAMIENTO, "Alojamiento comunitario (habitación doble)", 40_000, POR_HABITACION_DOBLE, 1),
                        item(id, 1, TRANSPORTE, "Traslado San Salvador ⇄ Abra Pampa", 25_000, POR_PERSONA, 2),
                        item(id, 1, GASTRONOMIA, "Vianda de altura (por día)", 20_000, POR_PERSONA, 2)),
                false, null);
    }

    private static Plantilla vallesDiques() {
        String id = "valles_diques_termas";
        return new Plantilla(id, "Valles, Diques & Termas",
                "Escapada cerca de la capital: Dique La Ciénaga, Lagunas de Yala y Termas de Reyes.",
                "Valles", 2, 1, 1, 10,
                List.of(
                        new DiaPlantilla(1, "Diques de El Carmen", "San Salvador de Jujuy",
                                List.of("san_salvador", "dique_la_cienaga")),
                        new DiaPlantilla(2, "Lagunas de Yala y Termas de Reyes", "San Salvador de Jujuy",
                                List.of("lagunas_yala", "termas_reyes", "san_salvador"))),
                List.of(
                        item(id, 1, TRANSPORTE, "Remís o auto por el día", 35_000, POR_GRUPO, 2),
                        item(id, 1, ALOJAMIENTO, "Cabaña (habitación doble)", 45_000, POR_HABITACION_DOBLE, 1),
                        item(id, 2, ENTRADA, "Entrada Termas de Reyes", 15_000, POR_PERSONA, 1),
                        item(id, 1, GASTRONOMIA, "Comidas (por día)", 25_000, POR_PERSONA, 2)),
                false, null);
    }

    private static Plantilla yungasCalilegua() {
        String id = "yungas_calilegua";
        return new Plantilla(id, "Yungas: Calilegua & Termas",
                "El Jujuy verde: selva del Parque Nacional Calilegua y Termas de Caimancito.",
                "Yungas", 3, 2, 1, 8,
                List.of(
                        new DiaPlantilla(1, "Viaje al Ramal", "Libertador Gral. San Martín",
                                List.of("san_salvador", "libertador")),
                        new DiaPlantilla(2, "Senderos del Parque Nacional Calilegua", "Libertador Gral. San Martín",
                                List.of("calilegua")),
                        new DiaPlantilla(3, "Termas de Caimancito y regreso", "San Salvador de Jujuy",
                                List.of("termas_caimancito", "san_salvador"))),
                List.of(
                        item(id, 1, TRANSPORTE, "Bus San Salvador ⇄ Libertador (ida y vuelta)", 15_000, POR_PERSONA, 2),
                        item(id, 1, ALOJAMIENTO, "Hostería (habitación doble)", 48_000, POR_HABITACION_DOBLE, 2),
                        item(id, 2, EXCURSION, "Excursión guiada en Calilegua", 35_000, POR_PERSONA, 1),
                        item(id, 3, ENTRADA, "Entrada Termas de Caimancito", 12_000, POR_PERSONA, 1),
                        item(id, 1, GASTRONOMIA, "Comidas (por día)", 25_000, POR_PERSONA, 3)),
                false, null);
    }

    /** Id determinístico: una categoría por día dentro de cada plantilla. */
    private static ItemPlantilla item(String plantillaId, int dia, CategoriaCosto categoria, String titulo,
                                      long montoPesos, Escala escala, int cantidad) {
        String itemId = plantillaId + "_d" + dia + "_" + categoria.name().toLowerCase();
        return new ItemPlantilla(itemId, dia, categoria, titulo, montoPesos * 100, escala, cantidad,
                TipoCosto.ESTIMADO, FUENTE, FECHA);
    }
}

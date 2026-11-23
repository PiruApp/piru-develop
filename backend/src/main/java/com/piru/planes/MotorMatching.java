package com.piru.planes;

import com.piru.presupuesto.CalculadoraPresupuesto;
import com.piru.presupuesto.CalculoPresupuesto;
import com.piru.presupuesto.ItemCalculado;
import com.piru.promociones.CatalogoPromociones;
import com.piru.promociones.Promocion;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Cruza los parámetros del viajero con las plantillas (DOC-04A §5).
 * No inventa precios y no oculta los planes que no entran: los muestra con el faltante.
 */
public class MotorMatching {

    private final List<Plantilla> plantillas;
    private final CatalogoPromociones promociones;

    public MotorMatching(List<Plantilla> plantillas, CatalogoPromociones promociones) {
        this.plantillas = List.copyOf(plantillas);
        this.promociones = promociones;
    }

    public List<Plantilla> plantillas() {
        return plantillas;
    }

    public List<PlanCandidato> generar(ParametrosViaje parametros, LocalDate hoy) {
        Optional<Promocion> promo = promociones.buscar(parametros.promocionId());

        return plantillas.stream()
                .filter(p -> p.dias() <= parametros.dias())
                .filter(p -> p.admitePersonas(parametros.personas()))
                .map(p -> armar(p, parametros, promo, hoy))
                .sorted(ORDEN)
                .toList();
    }

    private PlanCandidato armar(Plantilla plantilla, ParametrosViaje parametros, Optional<Promocion> promo, LocalDate hoy) {
        List<ItemCalculado> items = plantilla.items().stream()
                .map(i -> i.calcularPara(parametros.personas()))
                .toList();
        CalculoPresupuesto calculo = CalculadoraPresupuesto.calcular(
                items, parametros.personas(), parametros.cotaCentavosArs(), promo, hoy);
        List<String> recorrido = plantilla.puntosEnOrden();
        List<String> faltantes = parametros.puntosObligatorios().stream()
                .filter(id -> !recorrido.contains(id))
                .toList();

        return new PlanCandidato(plantilla.id(), plantilla.nombre(), plantilla.descripcion(), plantilla.region(),
                plantilla.dias(), plantilla.noches(), plantilla.itinerario(), recorrido, items, calculo, faltantes,
                plantilla.recomendada(), plantilla.motivoRecomendacion());
    }

    /**
     * Primero los que cubren todos los puntos pedidos, luego los que entran en la cota.
     * Entre los que entran, el que mejor aprovecha el presupuesto (menor margen).
     * Entre los que no entran, el de menor faltante.
     */
    static final Comparator<PlanCandidato> ORDEN = Comparator
            .comparing((PlanCandidato c) -> !c.coberturaCompleta())
            .thenComparing(c -> !c.calculo().entraEnCota())
            .thenComparingLong(c -> Math.abs(c.calculo().margenCentavos()));
}

"use client";

import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import type { Punto } from "@/lib/api";

// Mapa con OpenStreetMap (sin clave). Respetar la política de uso de tiles de OSM:
// para tráfico alto en producción, usar un proveedor de tiles propio o pago.

function icono(numero: number) {
  return L.divIcon({
    className: "",
    html: `<div style="background:#B84A39;color:#fff;width:32px;height:32px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.25);transition:transform .2s ease;cursor:pointer" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">${numero}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function Encuadre({ puntos }: { puntos: Punto[] }) {
  const mapa = useMap();
  useEffect(() => {
    if (puntos.length === 0) return;
    mapa.fitBounds(L.latLngBounds(puntos.map((p) => [p.latitud, p.longitud] as [number, number])), { padding: [36, 36] });
  }, [mapa, puntos]);
  return null;
}

export default function MapaLeaflet({ puntos }: { puntos: Punto[] }) {
  const camino = puntos.map((p) => [p.latitud, p.longitud] as [number, number]);
  return (
    <MapContainer center={[-23.6, -65.4]} zoom={7} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={camino} pathOptions={{ color: "#B84A39", weight: 4, opacity: 0.85, dashArray: "8 4" }} />
      {puntos.map((p, i) => (
        <Marker key={`${p.id}-${i}`} position={[p.latitud, p.longitud]} icon={icono(i + 1)}>
          <Popup>
            <div style={{ fontFamily: "inherit", padding: "2px 0" }}>
              <strong style={{ fontSize: "14px" }}>{p.nombre}</strong>
              <br />
              <span style={{ fontSize: "12px", color: "#64748b" }}>{p.region} · {p.altitudMsnm.toLocaleString("es-AR")} msnm</span>
            </div>
          </Popup>
        </Marker>
      ))}
      <Encuadre puntos={puntos} />
    </MapContainer>
  );
}

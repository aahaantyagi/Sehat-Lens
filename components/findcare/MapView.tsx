"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useApp } from "@/lib/store";
import type { MatchedDoctor } from "@/lib/findcare";
import { USER_LOCATION } from "@/lib/findcare";

const pin = (color: string) =>
  L.divIcon({
    className: "",
    html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid rgba(6,8,9,0.9);box-shadow:0 0 0 2px ${color}55"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

export default function MapView({
  doctors,
  maxDistanceKm,
}: {
  doctors: MatchedDoctor[];
  maxDistanceKm: number;
}) {
  const theme = useApp((s) => s.theme);
  return (
    <MapContainer
      center={[USER_LOCATION.lat, USER_LOCATION.lng]}
      zoom={11}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", background: "#0b0e10" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        className={theme === "night" ? "map-tiles-night" : "map-tiles-day"}
      />
      <Circle
        center={[USER_LOCATION.lat, USER_LOCATION.lng]}
        radius={maxDistanceKm * 1000}
        pathOptions={{ color: "#66e0b3", weight: 1, fillOpacity: 0.04 }}
      />
      <Marker position={[USER_LOCATION.lat, USER_LOCATION.lng]} icon={pin("#66e0b3")}>
        <Popup>You are here (approx.)</Popup>
      </Marker>
      {doctors.map((d) => (
        <Marker key={d.id} position={[d.lat, d.lng]} icon={pin(d.matched ? "#fbbf24" : "#60a5fa")}>
          <Popup>
            <b>{d.name}</b>
            <br />
            {d.specialty} · {d.clinic}
            <br />★ {d.rating} · {d.distanceKm.toFixed(1)} km
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

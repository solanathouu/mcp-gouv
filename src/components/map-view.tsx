"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { Entreprise } from "@/types";

interface MapViewProps {
  entreprises: Entreprise[];
  onSelect: (entreprise: Entreprise) => void;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useMap } = require("react-leaflet");
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [map, center, zoom]);
  return null;
}

// Inner component — only imported client-side (no SSR)
function MapViewInner({ entreprises, onSelect }: MapViewProps) {
  // These imports are safe here because this component is never SSR'd
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MapContainer, TileLayer, Marker, Popup } = require("react-leaflet");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require("leaflet");

  // Fix default icon URLs using unpkg CDN
  const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Filter companies with valid coordinates
  const withCoords = entreprises.filter(
    (e) => e.latitude !== null && e.longitude !== null
  );

  // Calculate map center from results, or default to France
  const center: [number, number] =
    withCoords.length > 0
      ? [
          withCoords.reduce((sum, e) => sum + e.latitude!, 0) / withCoords.length,
          withCoords.reduce((sum, e) => sum + e.longitude!, 0) / withCoords.length,
        ]
      : [46.603354, 1.888334];

  const zoom = withCoords.length > 0 ? 6 : 5;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ChangeView center={center} zoom={zoom} />
      {withCoords.map((entreprise) => (
        <Marker
          key={entreprise.siren}
          position={[entreprise.latitude!, entreprise.longitude!]}
          icon={defaultIcon}
        >
          <Popup>
            <div className="space-y-1 min-w-[160px]">
              <p className="font-semibold text-sm">
                {entreprise.nom_commercial || entreprise.raison_sociale}
              </p>
              <p className="text-xs text-gray-600">
                {[entreprise.commune, entreprise.departement].filter(Boolean).join(", ")}
              </p>
              {entreprise.code_naf && (
                <p className="text-xs text-gray-500">NAF : {entreprise.code_naf}</p>
              )}
              <button
                onClick={() => onSelect(entreprise)}
                className="mt-1 text-xs text-blue-600 underline hover:text-blue-800"
              >
                Voir la fiche
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

// Dynamically import without SSR
const MapViewDynamic = dynamic(() => Promise.resolve(MapViewInner), { ssr: false });

export function MapView(props: MapViewProps) {
  return <MapViewDynamic {...props} />;
}

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Bolsin } from '../screens/PantSegBolsines';

// Colores de marca (no se pueden usar clases Tailwind dentro del HTML de un divIcon de Leaflet)
const COLOR_PRIMARY = '#F24F13';
const COLOR_ACCENT = '#F2C230';
const COLOR_BG_MAIN = '#44334F';

interface MapaBolsinesProps {
  bolsines: Bolsin[];
  bolsinSeleccionado: Bolsin | null;
  onSeleccionarBolsin: (bolsin: Bolsin) => void;
}

// Genera un pin circular con el ícono de ubicación, coloreado según el estado de selección
const crearIcono = (seleccionado: boolean): L.DivIcon => {
  const size = seleccionado ? 40 : 32;
  const fondo = seleccionado ? COLOR_PRIMARY : COLOR_ACCENT;
  const trazo = seleccionado ? '#ffffff' : COLOR_BG_MAIN;

  return L.divIcon({
    className: 'bolsin-marker',
    html: `
      <div style="
        width:${size}px;height:${size}px;border-radius:9999px;
        background:${fondo};border:3px solid #ffffff;
        box-shadow:0 4px 10px rgba(68,51,79,0.45);
        display:flex;align-items:center;justify-content:center;
        transition:all .2s ease;">
        <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none"
          stroke="${trazo}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <circle cx="12" cy="11" r="3"/>
        </svg>
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    tooltipAnchor: [0, -size / 2],
  });
};

// Ajusta el encuadre del mapa para que entren todos los bolsines visibles
const AjustarEncuadre: React.FC<{ bolsines: Bolsin[] }> = ({ bolsines }) => {
  const map = useMap();

  useEffect(() => {
    if (bolsines.length === 0) return;
    const limites = L.latLngBounds(bolsines.map((b) => [b.latitud, b.longitud] as [number, number]));
    map.fitBounds(limites, { padding: [60, 60], maxZoom: 13, animate: true });
  }, [bolsines, map]);

  return null;
};

// Centra suavemente el mapa sobre el bolsín seleccionado
const CentrarSeleccionado: React.FC<{ bolsin: Bolsin | null }> = ({ bolsin }) => {
  const map = useMap();

  useEffect(() => {
    if (!bolsin) return;
    map.flyTo([bolsin.latitud, bolsin.longitud], Math.max(map.getZoom(), 12), { duration: 0.6 });
  }, [bolsin, map]);

  return null;
};

export const MapaBolsines: React.FC<MapaBolsinesProps> = ({ bolsines, bolsinSeleccionado, onSeleccionarBolsin }) => {
  // Centro por defecto: región Córdoba / Villa María
  const centroPorDefecto = useMemo<[number, number]>(() => [-31.9, -63.7], []);

  return (
    <MapContainer
      center={centroPorDefecto}
      zoom={9}
      scrollWheelZoom
      className="w-full h-full min-h-[360px] z-0"
      style={{ background: '#e8eef1' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <AjustarEncuadre bolsines={bolsines} />
      <CentrarSeleccionado bolsin={bolsinSeleccionado} />

      {bolsines.map((bolsin) => {
        const seleccionado = bolsinSeleccionado?.numeroPrecinto === bolsin.numeroPrecinto;
        const codigoStr = `BOL-${String(bolsin.numeroPrecinto).padStart(3, '0')}`;

        return (
          <Marker
            key={bolsin.numeroPrecinto}
            position={[bolsin.latitud, bolsin.longitud]}
            icon={crearIcono(seleccionado)}
            zIndexOffset={seleccionado ? 1000 : 0}
            eventHandlers={{ click: () => onSeleccionarBolsin(bolsin) }}
          >
            <Tooltip direction="top" offset={[0, -4]} opacity={1}>
              <span style={{ fontWeight: 700, color: COLOR_BG_MAIN }}>{codigoStr}</span>
            </Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

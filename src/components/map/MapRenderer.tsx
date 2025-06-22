import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Precinto {
  id: string;
  lat: number;
  lng: number;
  estado: string;
  codigo: string;
}

interface MapRendererProps {
  precintos: Precinto[];
  onPrecintoClick?: (precinto: Precinto) => void;
}

const customIcon = new Icon({
  iconUrl: '/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const MapRenderer: React.FC<MapRendererProps> = ({ precintos, onPrecintoClick }) => {
  const defaultCenter: LatLngExpression = [-34.8836, -56.1819]; // Montevideo

  return (
    <MapContainer center={_defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{_s}.tile.openstreetmap.org/{_z}/{_x}/{_y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {precintos.map((_precinto) => (
        <Marker
          key={precinto.id}
          position={[precinto.lat, precinto.lng]}
          icon={_customIcon}
          eventHandlers={{
            click: () => onPrecintoClick?.(_precinto),
          }}
        >
          <Popup>
            <div>
              <p>Código: {precinto.codigo}</p>
              <p>Estado: {precinto.estado}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
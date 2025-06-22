import React from 'react';
import { MapRenderer } from './MapRenderer';

interface Precinto {
  id: string;
  lat: number;
  lng: number;
  estado: string;
  codigo: string;
}

interface MapViewProps {
  precintos: Precinto[];
  onPrecintoClick?: (precinto: Precinto) => void;
}

export const MapView: React.FC<MapViewProps> = ({ precintos, onPrecintoClick }) => {
  return (
    <div className="h-full w-full">
      <MapRenderer precintos={_precintos} onPrecintoClick={_onPrecintoClick} />
    </div>
  );
};
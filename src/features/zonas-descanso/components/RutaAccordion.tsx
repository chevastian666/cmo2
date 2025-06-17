import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import type { RutaZonas } from '../data/zonasDescansoData';

interface RutaAccordionProps {
  rutaData: RutaZonas;
  defaultOpen?: boolean;
}

export const RutaAccordion: React.FC<RutaAccordionProps> = ({ rutaData, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
            <span className="text-white font-semibold">{rutaData.ruta.replace('Ruta ', '')}</span>
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">{rutaData.ruta}</h3>
            <p className="text-sm text-gray-400">{rutaData.zonas.length} zonas de descanso</p>
          </div>
        </div>
        <div className="text-gray-400">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-4 space-y-3 border-t border-gray-700">
          {rutaData.zonas.map((zona, index) => (
            <div
              key={index}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-2 text-sm text-gray-300">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{zona.ubicacion}</span>
                  </div>
                </div>
                <a
                  href={zona.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
                >
                  <MapPin className="h-4 w-4" />
                  Ver en mapa
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
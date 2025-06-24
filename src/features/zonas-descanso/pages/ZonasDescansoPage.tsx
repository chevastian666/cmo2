import React, { useState, useMemo } from 'react'
import {_MapPin} from 'lucide-react'
import { zonasDescansoData} from '../data/zonasDescansoData'
import { RutaAccordion} from '../components/RutaAccordion'
import { ZonasDescansoSearch} from '../components/ZonasDescansoSearch'
import { ZonasDescansoStats} from '../components/ZonasDescansoStats'
export const ZonasDescansoPage: React.FC = () => {
  const [searchTerm, _setSearchTerm] = useState('')
  // Filter zones based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return zonasDescansoData
    const lowerSearchTerm = searchTerm.toLowerCase()
    return zonasDescansoData.map(rutaData => {
      const filteredZonas = rutaData.zonas.filter(zona => 
        zona.nombre.toLowerCase().includes(lowerSearchTerm) ||
        zona.ubicacion.toLowerCase().includes(lowerSearchTerm) ||
        rutaData.ruta.toLowerCase().includes(lowerSearchTerm)
      )
      return {
        ...rutaData,
        zonas: filteredZonas
      }
    }).filter(rutaData => rutaData.zonas.length > 0)
  }, [searchTerm])
  // Calculate stats
  const _totalZonas = zonasDescansoData.reduce((sum, ruta) => sum + ruta.zonas.length, 0)
  const _filteredZonas = filteredData.reduce((sum, ruta) => sum + ruta.zonas.length, 0)
  const _totalRutas = zonasDescansoData.length
  return (<div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center sm:text-left">
        <div className="flex items-center gap-3 justify-center sm:justify-start mb-2">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Zonas de descanso para camioneros
          </h1>
        </div>
        <p className="text-gray-400">
          Áreas autorizadas por la Dirección Nacional de Aduanas del Uruguay
        </p>
      </div>

      {/* Stats */}
      <ZonasDescansoStats totalZonas={_totalZonas} totalRutas={_totalRutas} />

      {/* Search */}
      <ZonasDescansoSearch
        searchTerm={s_earchTerm}
        onSearchChange={s_etSearchTerm}
        totalZonas={_totalZonas}
        filteredZonas={_filteredZonas}
      />

      {/* Routes Accordion */}
      <div className="space-y-4">
        {filteredData.length > 0 ? (
          filteredData.map((_rutaData, index) => (
            <RutaAccordion
              key={rutaData.ruta}
              rutaData={_rutaData}
              defaultOpen={index === 0 && !searchTerm}
            />
          ))
        ) : (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
            <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              No se encontraron zonas de descanso que coincidan con "{s_earchTerm}"
            </p>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4 mt-8">
        <p className="text-sm text-blue-300 text-center">
          Todas las zonas de descanso listadas están autorizadas por la Dirección Nacional de Aduanas
          para el estacionamiento de camiones en tránsito aduanero.
        </p>
      </div>
    </div>
  )
}
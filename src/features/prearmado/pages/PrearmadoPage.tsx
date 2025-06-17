import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { notificationService } from '../../../services/shared/notification.service';
import { prearmadoService } from '../services/prearmado.service';

interface PrearmadoFormData {
  viajeId: string;
  movimientoId: string;
}

interface TransitInfo {
  track: string;
  empresaid: string;
  VjeId: string;
  MovId: string;
  precintoid: string[];
  DUA: string;
  fecha: number;
  MatTra: string;
  MatTraOrg: string;
  MatZrr?: string;
  MatRemo?: string;
  ConNmb: string;
  ConNDoc: string;
  ConTDoc?: string;
  ConODoc?: string;
  ConTel: string;
  plidEnd?: string;
  depEnd?: string;
}

export const PrearmadoPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [transitInfo, setTransitInfo] = useState<TransitInfo | null>(null);
  const [formData, setFormData] = useState<PrearmadoFormData>({
    viajeId: '',
    movimientoId: ''
  });

  const handleInputChange = (field: keyof PrearmadoFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.viajeId.trim() || !formData.movimientoId.trim()) {
      notificationService.warning('Campos requeridos', 'Debe ingresar tanto el ID de viaje como el ID de movimiento');
      return;
    }

    setLoading(true);
    setSearchPerformed(true);

    try {
      const result = await prearmadoService.searchTransit(formData.viajeId, formData.movimientoId);
      
      if (result) {
        setTransitInfo(result);
        notificationService.success('Tránsito encontrado', `Viaje ${formData.viajeId} - Movimiento ${formData.movimientoId}`);
      } else {
        setTransitInfo(null);
        notificationService.error('No encontrado', 'No se encontró información para el viaje y movimiento especificados');
      }
    } catch (error) {
      notificationService.error('Error', 'Error al buscar la información del tránsito');
      setTransitInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrearm = () => {
    if (!transitInfo) return;
    
    // Navigate to armado page with pre-filled data
    navigate('/armado', { 
      state: { 
        prearmData: {
          viajeId: transitInfo.VjeId,
          movimientoId: transitInfo.MovId,
          dua: transitInfo.DUA,
          matricula: transitInfo.MatTra,
          matriculaRemolque: transitInfo.MatRemo || '',
          nombreConductor: transitInfo.ConNmb,
          numeroDocumentoConductor: transitInfo.ConNDoc,
          telefonoConductor: transitInfo.ConTel,
          depositoFin: transitInfo.depEnd || ''
        }
      } 
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDocumentTypeLabel = (type?: string) => {
    const types: Record<string, string> = {
      '2': 'Cédula de identidad uruguaya',
      '4': 'RUT uruguayo',
      '6': 'Pasaporte uruguayo',
      'CI': 'Cédula de identidad extranjera',
      'CUIT': 'Clave única tributaria extranjera',
      'DNI': 'Documento nacional de identidad extranjero',
      'LC': 'Libreta cívica extranjera',
      'LE': 'Libreta enrolamiento extranjera',
      'PAS': 'Pasaporte extranjero'
    };
    return type && types[type] ? types[type] : 'Documento';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package className="h-8 w-8 text-blue-500" />
          Prearmado
        </h1>
        <p className="text-gray-400 mt-1">
          Búsqueda de información de tránsitos para preconfigurar el armado
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ID de Viaje
              </label>
              <input
                type="text"
                value={formData.viajeId}
                onChange={(e) => handleInputChange('viajeId', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: 7592862"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ID de Movimiento
              </label>
              <input
                type="text"
                value={formData.movimientoId}
                onChange={(e) => handleInputChange('movimientoId', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: 2"
                disabled={loading}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                <span>Buscar</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results */}
      {searchPerformed && !loading && (
        <>
          {transitInfo ? (
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-blue-600 p-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Información del Tránsito Encontrada
                </h3>
              </div>

              {/* Transit Info Sections */}
              <div className="p-6 space-y-6">
                {/* Trip Data */}
                <div className="border-b border-gray-700 pb-6">
                  <h4 className="text-md font-semibold text-gray-300 mb-4">Datos del Viaje</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase">ID de Viaje</p>
                      <p className="text-lg font-semibold text-white">{transitInfo.VjeId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase">ID de Movimiento</p>
                      <p className="text-lg font-semibold text-white">{transitInfo.MovId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase">DUA</p>
                      <p className="text-lg font-semibold text-white">{transitInfo.DUA}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Empresa</p>
                      <p className="text-lg font-semibold text-white">{transitInfo.empresaid}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Precinto(s)</p>
                      <p className="text-lg font-semibold text-white">
                        {Array.isArray(transitInfo.precintoid) 
                          ? transitInfo.precintoid.join(', ') 
                          : transitInfo.precintoid}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Fecha</p>
                      <p className="text-lg font-semibold text-white">{formatDate(transitInfo.fecha)}</p>
                    </div>
                  </div>
                  {transitInfo.track && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-400 uppercase mb-1">URL de Rastreo</p>
                      <a 
                        href={`https://track.trokor.com/${transitInfo.track}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <span>Ver en mapa</span>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>

                {/* Vehicle Data */}
                <div className="border-b border-gray-700 pb-6">
                  <h4 className="text-md font-semibold text-gray-300 mb-4">Datos del Vehículo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Matrícula Tractor</p>
                      <p className="text-lg font-semibold text-white">
                        {transitInfo.MatTra}
                        {transitInfo.MatTraOrg && (
                          <span className="text-sm text-gray-400 ml-2">({transitInfo.MatTraOrg})</span>
                        )}
                      </p>
                    </div>
                    {transitInfo.MatZrr && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Matrícula Zorra</p>
                        <p className="text-lg font-semibold text-white">{transitInfo.MatZrr}</p>
                      </div>
                    )}
                    {transitInfo.MatRemo && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Matrícula Remolque</p>
                        <p className="text-lg font-semibold text-white">{transitInfo.MatRemo}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Driver Data */}
                <div className="border-b border-gray-700 pb-6">
                  <h4 className="text-md font-semibold text-gray-300 mb-4">Datos del Conductor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Nombre</p>
                      <p className="text-lg font-semibold text-white">{transitInfo.ConNmb}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Documento</p>
                      <p className="text-lg font-semibold text-white">{transitInfo.ConNDoc}</p>
                    </div>
                    {transitInfo.ConTDoc && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Tipo de Documento</p>
                        <p className="text-lg font-semibold text-white">{getDocumentTypeLabel(transitInfo.ConTDoc)}</p>
                      </div>
                    )}
                    {transitInfo.ConTel && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Teléfono</p>
                        <p className="text-lg font-semibold text-white">{transitInfo.ConTel}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handlePrearm}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors"
                  >
                    <Package className="h-5 w-5" />
                    <span>Continuar con Armado</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg text-gray-300">No se encontró información para el viaje y movimiento especificados</p>
              <p className="text-sm text-gray-500 mt-2">Verifique los datos ingresados e intente nuevamente</p>
            </div>
          )}
        </>
      )}

      {/* Initial State */}
      {!searchPerformed && !loading && (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">
            Ingrese el ID de viaje y el ID de movimiento para buscar la información del tránsito
          </p>
        </div>
      )}
    </div>
  );
};
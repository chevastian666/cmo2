import React, { useState, useEffect } from 'react';
import { Package, AlertCircle, Loader } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PrecintoSearch } from '../components/PrecintoSearchCompact';
import { PrecintoStatus } from '../components/PrecintoStatusCompact';
import { MapPreview } from '../components/MapPreview';
import { ArmFormEnhanced } from '../components/ArmFormEnhanced';
import { PhotoUploader } from '../components/PhotoUploaderCompact';
import { ArmConfirmationModalEnhanced } from '../components/ArmConfirmationModalEnhanced';
import { notificationService } from '../../../services/shared/notification.service';
import { armadoService } from '../services/armado.service';
import type { Precinto, TransitoPendiente } from '../../../types';

interface TransitoFormData {
  // Datos del viaje
  precintoId: string;
  tipoViaje: 'Tránsito' | 'GEX' | 'Monitoreo externo' | '';
  dua: string;
  
  // Datos del vehículo
  matricula: string;
  matriculaRemolque: string;
  contenedorId: string;
  
  // Datos del conductor
  nombreConductor: string;
  tipoDocumentoConductor: string;
  numeroDocumentoConductor: string;
  origenDocumentoConductor: string;
  telefonoConductor: string;
  
  // Datos de la empresa
  empresa: string;
  rutEmpresa: string;
  empresaSecundaria?: string;
  rutEmpresaSecundaria?: string;
  
  // Ruta y ubicaciones
  origen: string;
  destino: string;
  depositoInicio: string;
  depositoFin: string;
  
  // Eslinga y observaciones
  tipoEslinga: {
    larga: boolean;
    corta: boolean;
  };
  observaciones: string;
}

interface ArmadoData {
  precinto: Precinto | null;
  transito: Partial<TransitoFormData>;
  fotos: File[];
  fotosExistentes: string[];
}

export const ArmadoPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Check if we have prearm data from navigation state
  const prearmData = location.state?.prearmData;

  const [armadoData, setArmadoData] = useState<ArmadoData>({
    precinto: null,
    transito: {
      // Datos del viaje
      precintoId: '',
      tipoViaje: '',
      dua: prearmData?.dua || '',
      
      // Datos del vehículo
      matricula: prearmData?.matricula || '',
      matriculaRemolque: prearmData?.matriculaRemolque || '',
      contenedorId: '',
      
      // Datos del conductor
      nombreConductor: prearmData?.nombreConductor || '',
      tipoDocumentoConductor: 'CI',
      numeroDocumentoConductor: prearmData?.numeroDocumentoConductor || '',
      origenDocumentoConductor: 'UY',
      telefonoConductor: prearmData?.telefonoConductor || '',
      
      // Datos de la empresa
      empresa: '',
      rutEmpresa: '',
      empresaSecundaria: '',
      rutEmpresaSecundaria: '',
      
      // Ruta y ubicaciones
      origen: '',
      destino: '',
      depositoInicio: '',
      depositoFin: prearmData?.depositoFin || '',
      
      // Eslinga y observaciones
      tipoEslinga: {
        larga: false,
        corta: false
      },
      observaciones: ''
    },
    fotos: [],
    fotosExistentes: []
  });


  const handleSearchPrecinto = async (nqr: string) => {
    setLoading(true);
    setSearchError(null);
    
    try {
      const precinto = await armadoService.searchPrecinto(nqr);
      
      if (!precinto) {
        setSearchError('Precinto no encontrado');
        return;
      }

      // Check precinto status
      const warnings = [];
      if (precinto.bateria < 20) {
        warnings.push(`Batería baja: ${precinto.bateria}%`);
      }
      
      const timeSinceLastReport = Date.now() / 1000 - precinto.fechaUltimaLectura;
      if (timeSinceLastReport > 3600) { // More than 1 hour
        warnings.push(`Sin reportar hace ${Math.floor(timeSinceLastReport / 3600)} horas`);
      }

      if (warnings.length > 0) {
        notificationService.warning(
          'Advertencias del Precinto',
          warnings.join('. ')
        );
      }

      // Load existing photos - for now, mock empty array
      const fotos: string[] = [];

      setArmadoData(prev => ({
        ...prev,
        precinto,
        fotosExistentes: fotos,
        transito: {
          ...prev.transito,
          precintoId: precinto.codigo
        }
      }));

      notificationService.success(
        'Precinto Encontrado',
        `Precinto ${nqr} cargado correctamente`
      );
    } catch (error: any) {
      setSearchError(error.message || 'Error al buscar precinto');
      notificationService.error('Error', error.message || 'Error al buscar precinto');
    } finally {
      setLoading(false);
    }
  };

  const handleTransitoUpdate = (field: string, value: any) => {
    setArmadoData(prev => ({
      ...prev,
      transito: {
        ...prev.transito,
        [field]: value
      }
    }));
  };

  const handlePhotosChange = (fotos: File[]) => {
    setArmadoData(prev => ({
      ...prev,
      fotos
    }));
  };


  const validateArmado = (): string[] => {
    const errors: string[] = [];
    const { precinto, transito } = armadoData;

    if (!precinto) {
      errors.push('Debe buscar un precinto');
      return errors;
    }

    // Datos del viaje
    if (!transito.tipoViaje) errors.push('Tipo de viaje es requerido');
    if (!transito.dua?.trim()) errors.push('DUA es requerido');
    
    // Datos del vehículo
    if (!transito.matricula?.trim()) errors.push('Matrícula del camión es requerida');
    
    // Datos del conductor
    if (!transito.nombreConductor?.trim()) errors.push('Nombre del conductor es requerido');
    if (!transito.numeroDocumentoConductor?.trim()) errors.push('Número de documento del conductor es requerido');
    if (!transito.telefonoConductor?.trim()) errors.push('Teléfono del conductor es requerido');
    
    // Datos de la empresa
    if (!transito.empresa?.trim()) errors.push('Empresa es requerida');
    if (!transito.rutEmpresa?.trim()) errors.push('RUT de la empresa es requerido');
    
    // Ruta
    if (!transito.origen?.trim()) errors.push('Origen es requerido');
    if (!transito.destino?.trim()) errors.push('Destino es requerido');
    if (!transito.depositoFin?.trim()) errors.push('Depósito de destino es requerido');

    // Validate RUT format
    if (transito.rutEmpresa && !armadoService.validateRUT(transito.rutEmpresa)) {
      errors.push('El RUT de la empresa no es válido');
    }
    if (transito.rutEmpresaSecundaria && !armadoService.validateRUT(transito.rutEmpresaSecundaria)) {
      errors.push('El RUT de la empresa secundaria no es válido');
    }

    // Validate at least one eslinga type is selected
    if (!transito.tipoEslinga?.larga && !transito.tipoEslinga?.corta) {
      errors.push('Debe seleccionar al menos un tipo de eslinga');
    }

    return errors;
  };

  const handleConfirmArmado = () => {
    const errors = validateArmado();
    if (errors.length > 0) {
      notificationService.error('Errores de Validación', errors.join('. '));
      return;
    }

    setShowConfirmModal(true);
  };

  const handleExecuteArmado = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    try {
      const { precinto, transito, fotos } = armadoData;
      
      if (!precinto) {
        throw new Error('No hay precinto seleccionado');
      }

      // Upload photos if any
      if (fotos.length > 0) {
        await armadoService.uploadPhotos(precinto.id, fotos);
      }

      // Execute armado command
      const result = await armadoService.executeArmado({
        precintoId: precinto.id,
        transitoData: transito,
        fotos
      });

      if (result.success) {
        notificationService.success(
          'Armado Exitoso',
          `Precinto ${precinto.codigo} armado correctamente`
        );

        // Navigate to waiting page with transitId
        navigate(`/armado/waiting/${result.transitId}`);
      } else {
        throw new Error('El armado no se completó exitosamente');
      }

      // Reset form (this won't execute if navigation happens, but keep for safety)
      setArmadoData({
        precinto: null,
        transito: {
          // Datos del viaje
          precintoId: '',
          tipoViaje: '',
          dua: '',
          
          // Datos del vehículo
          matricula: '',
          matriculaRemolque: '',
          contenedorId: '',
          
          // Datos del conductor
          nombreConductor: '',
          tipoDocumentoConductor: 'CI',
          numeroDocumentoConductor: '',
          origenDocumentoConductor: 'UY',
          telefonoConductor: '',
          
          // Datos de la empresa
          empresa: '',
          rutEmpresa: '',
          empresaSecundaria: '',
          rutEmpresaSecundaria: '',
          
          // Ruta y ubicaciones
          origen: '',
          destino: '',
          depositoInicio: '',
          depositoFin: '',
          
          // Eslinga y observaciones
          tipoEslinga: {
            larga: false,
            corta: false
          },
          observaciones: ''
        },
        fotos: [],
        fotosExistentes: []
      });


    } catch (error: any) {
      notificationService.error(
        'Error en Armado',
        error.message || 'Error al ejecutar el armado'
      );
    } finally {
      setLoading(false);
    }
  };

  // Show notification if we have prearm data
  useEffect(() => {
    if (prearmData) {
      notificationService.info(
        'Datos precargados',
        `Se han cargado los datos del viaje ${prearmData.viajeId} - Movimiento ${prearmData.movimientoId}`
      );
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package className="h-8 w-8 text-blue-500" />
          Armado de Precintos
        </h1>
        <p className="text-gray-400 mt-1">
          Configuración y activación de precintos para tránsitos
          {prearmData && (
            <span className="text-blue-400 ml-2">
              (Datos precargados del viaje {prearmData.viajeId})
            </span>
          )}
        </p>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <PrecintoSearch 
          onSearch={handleSearchPrecinto}
          loading={loading}
          error={searchError}
        />

        {/* Precinto Status */}
        {armadoData.precinto && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PrecintoStatus precinto={armadoData.precinto} />
              
              {/* Map */}
              {(armadoData.precinto.ubicacionActual || armadoData.precinto.ubicacion) && (
                <MapPreview 
                  lat={armadoData.precinto.ubicacionActual?.lat || armadoData.precinto.ubicacion?.lat || 0}
                  lng={armadoData.precinto.ubicacionActual?.lng || armadoData.precinto.ubicacion?.lng || 0}
                  title={`Precinto ${armadoData.precinto.codigo}`}
                />
              )}
            </div>

            {/* Transit Form */}
            <ArmFormEnhanced
              data={armadoData.transito}
              onChange={handleTransitoUpdate}
              disabled={loading}
              precintoId={armadoData.precinto.codigo}
            />

            {/* Photo Uploader */}
            <PhotoUploader
              onPhotosChange={handlePhotosChange}
              existingPhotos={armadoData.fotosExistentes}
              maxPhotos={5}
            />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4 sm:gap-0">
                <button
                  onClick={() => setArmadoData({
                    ...armadoData,
                    precinto: null,
                    fotos: [],
                    fotosExistentes: []
                  })}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors w-full sm:w-auto"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmArmado}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 w-full sm:w-auto"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <Package className="h-5 w-5" />
                      <span>Confirmar Armado</span>
                    </>
                  )}
                </button>
              </div>
          </div>
        )}

        {/* No precinto selected message */}
        {!armadoData.precinto && !loading && (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              Busque un precinto por su código NQR para comenzar el proceso de armado
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ArmConfirmationModalEnhanced
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleExecuteArmado}
        precinto={armadoData.precinto}
        transito={armadoData.transito}
      />
    </div>
  );
};
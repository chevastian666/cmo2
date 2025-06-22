/**
 * Prearmado Page V2 - Búsqueda y preconfiguración de tránsitos
 * Incluye: shadcn/ui, Framer Motion, Animaciones, Zustand mejorado
 * By Cheva
 */

import React, { useState } from 'react';
import { useNavigate} from 'react-router-dom';
import { Package, Search, AlertCircle, CheckCircle, MapPin, Truck, User, FileText, Phone, Calendar, ChevronRight, ExternalLink, Copy, Hash, Shield, Building, Route, CreditCard} from 'lucide-react';
import { Button} from '@/components/ui/button';
import { Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/Card';

import { Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';

import { Label} from '@/components/ui/label';
import { 
  PageTransition, AnimatedHeader, AnimatedSection, AnimatedGrid} from '@/components/animations/PageTransitions';
import { AnimatedCard, AnimatedButton, AnimatedSpinner} from '@/components/animations/AnimatedComponents';
import { motion, AnimatePresence} from 'framer-motion';
import { notificationService} from '@/services/shared/notification.service';
import { prearmadoService} from '../services/prearmado.service';

import { staggerContainer, staggerItem, fadeInUp} from '@/components/animations/AnimationPresets';

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

export const PrearmadoPageV2: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [transitInfo, setTransitInfo] = useState<TransitInfo | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
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
    } catch {
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

  const handleCopy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      notificationService.success('Copiado', 'Texto copiado al portapapeles');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      notificationService.error('Error', 'No se pudo copiar el texto');
    }
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

  return (<PageTransition>
      <div className="space-y-6">
        <AnimatedHeader
          title="Prearmado"
          subtitle="Búsqueda de información de tránsitos para preconfigurar el armado"
          icon={<Package className="h-8 w-8 text-blue-500" />}
        />

        {/* Search Form */}
        <AnimatedSection delay={0.1}>
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Búsqueda de Tránsito</CardTitle>
              <CardDescription>
                Ingrese el ID de viaje y movimiento para buscar la información del tránsito
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                    <Label htmlFor="viajeId">ID de Viaje</Label>
                    <Input
                      id="viajeId"
                      type="text"
                      value={formData.viajeId}
                      onChange={(e) => handleInputChange('viajeId', e.target.value)}
                      placeholder="Ej: 7592862"
                      disabled={loading}
                      className="mt-1"
                    />
                  </motion.div>
                  
                  <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={1}>
                    <Label htmlFor="movimientoId">ID de Movimiento</Label>
                    <Input
                      id="movimientoId"
                      type="text"
                      value={formData.movimientoId}
                      onChange={(e) => handleInputChange('movimientoId', e.target.value)}
                      placeholder="Ej: 2"
                      disabled={loading}
                      className="mt-1"
                    />
                  </motion.div>
                </div>
                
                <AnimatedButton
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <AnimatedSpinner className="mr-2 h-5 w-5" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      Buscar Tránsito
                    </>
                  )}
                </AnimatedButton>
              </form>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Results */}
        <AnimatePresence mode="wait">
          {searchPerformed && !loading && (<AnimatedSection delay={0.2}>
              {transitInfo ? (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  {/* Success Alert */}
                  <motion.div variants={staggerItem}>
                    <Alert className="border-green-600 bg-green-900/20">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle>Información del Tránsito Encontrada</AlertTitle>
                      <AlertDescription>
                        Se encontró la información para el viaje {transitInfo.VjeId} - Movimiento {transitInfo.MovId}
                      </AlertDescription>
                    </Alert>
                  </motion.div>

                  {/* Transit Information Cards */}
                  <AnimatedGrid className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Trip Data */}
                    <AnimatedCard
                      variants={staggerItem}
                      whileHover={{ y: -4 }}
                      className="lg:col-span-2"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Route className="h-5 w-5 text-blue-500" />
                          Datos del Viaje
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <InfoField
                            label="ID de Viaje"
                            value={transitInfo.VjeId}
                            icon={<Hash className="h-4 w-4" />}
                            onCopy={() => handleCopy(transitInfo.VjeId, 'viajeId')}
                            isCopied={copiedField === 'viajeId'}
                          />
                          <InfoField
                            label="ID de Movimiento"
                            value={transitInfo.MovId}
                            icon={<Hash className="h-4 w-4" />}
                            onCopy={() => handleCopy(transitInfo.MovId, 'movId')}
                            isCopied={copiedField === 'movId'}
                          />
                          <InfoField
                            label="DUA"
                            value={transitInfo.DUA}
                            icon={<FileText className="h-4 w-4" />}
                            onCopy={() => handleCopy(transitInfo.DUA, 'dua')}
                            isCopied={copiedField === 'dua'}
                          />
                          <InfoField
                            label="Empresa"
                            value={transitInfo.empresaid}
                            icon={<Building className="h-4 w-4" />}
                          />
                          <InfoField
                            label="Precinto(s)"
                            value={Array.isArray(transitInfo.precintoid) 
                              ? transitInfo.precintoid.join(', ') 
                              : transitInfo.precintoid}
                            icon={<Shield className="h-4 w-4" />}
                          />
                          <InfoField
                            label="Fecha"
                            value={formatDate(transitInfo.fecha)}
                            icon={<Calendar className="h-4 w-4" />}
                          />
                        </div>
                        
                        {transitInfo.track && (
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <a 
                              href={`https://track.trokor.com/${transitInfo.track}`}
                              target="blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <MapPin className="h-4 w-4" />
                              Ver en mapa
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </AnimatedCard>

                    {/* Vehicle Data */}
                    <AnimatedCard variants={staggerItem} whileHover={{ y: -4 }}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Truck className="h-5 w-5 text-blue-500" />
                          Datos del Vehículo
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <InfoField
                          label="Matrícula Tractor"
                          value={transitInfo.MatTra}
                          subtitle={transitInfo.MatTraOrg}
                          icon={<CreditCard className="h-4 w-4" />}
                        />
                        {transitInfo.MatZrr && (
                          <InfoField
                            label="Matrícula Zorra"
                            value={transitInfo.MatZrr}
                            icon={<CreditCard className="h-4 w-4" />}
                          />
                        )}
                        {transitInfo.MatRemo && (
                          <InfoField
                            label="Matrícula Remolque"
                            value={transitInfo.MatRemo}
                            icon={<CreditCard className="h-4 w-4" />}
                          />
                        )}
                      </CardContent>
                    </AnimatedCard>

                    {/* Driver Data */}
                    <AnimatedCard variants={staggerItem} whileHover={{ y: -4 }}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-500" />
                          Datos del Conductor
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <InfoField
                          label="Nombre"
                          value={transitInfo.ConNmb}
                          icon={<User className="h-4 w-4" />}
                        />
                        <InfoField
                          label="Documento"
                          value={transitInfo.ConNDoc}
                          subtitle={transitInfo.ConTDoc ? getDocumentTypeLabel(transitInfo.ConTDoc) : undefined}
                          icon={<CreditCard className="h-4 w-4" />}
                        />
                        {transitInfo.ConTel && (
                          <InfoField
                            label="Teléfono"
                            value={transitInfo.ConTel}
                            icon={<Phone className="h-4 w-4" />}
                          />
                        )}
                      </CardContent>
                    </AnimatedCard>
                  </AnimatedGrid>

                  {/* Action Button */}
                  <motion.div 
                    variants={staggerItem}
                    className="flex justify-center pt-4"
                  >
                    <AnimatedButton
                      onClick={handlePrearm}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Package className="mr-2 h-5 w-5" />
                      Continuar con Armado
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </AnimatedButton>
                  </motion.div>
                </motion.div>
              ) : (
                <AnimatedCard>
                  <CardContent className="py-12 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No se encontró información
                    </h3>
                    <p className="text-gray-400">
                      No se encontró información para el viaje y movimiento especificados.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Verifique los datos ingresados e intente nuevamente.
                    </p>
                  </CardContent>
                </AnimatedCard>
              )}
            </AnimatedSection>
          )}
        </AnimatePresence>

        {/* Initial State */}
        {!searchPerformed && !loading && (
          <AnimatedSection delay={0.2}>
            <Card>
              <CardContent className="py-12 text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                </motion.div>
                <p className="text-gray-400 text-lg">
                  Ingrese el ID de viaje y el ID de movimiento para buscar la información del tránsito
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>
        )}
      </div>
    </PageTransition>
  );
};

// Info Field Component
const InfoField: React.FC<{
  label: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onCopy?: () => void;
  isCopied?: boolean;
}> = ({ label, value, subtitle, icon, onCopy, isCopied }) => (
  <div className="space-y-1">
    <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
    <div className="flex items-center gap-2">
      {icon && <span className="text-gray-400">{icon}</span>}
      <p className="text-lg font-semibold text-white">
        {value}
        {subtitle && (
          <span className="text-sm text-gray-400 ml-2">({subtitle})</span>
        )}
      </p>
      {onCopy && (
        <motion.button
          onClick={onCopy}
          className="ml-auto p-1 hover:bg-gray-700 rounded transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isCopied ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4 text-gray-400" />
          )}
        </motion.button>
      )}
    </div>
  </div>
);

export default PrearmadoPageV2;
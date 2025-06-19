/**
 * Página de Armado V2 - Sistema de Precintado con formulario único
 * Incluye: shadcn/ui, Framer Motion, Zustand mejorado, Design Tokens
 * By Cheva
 */

import React, { useState, useEffect } from 'react';
import {Package, AlertCircle, Loader, Shield,Truck,User,Building,MapPin, Camera, CheckCircle2, ChevronRight,FileText,Clock, Zap,AlertTriangle, QrCode, Search,X, Battery} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {Card, CardContent,CardDescription, CardHeader, CardTitle} from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  PageTransition, 
  AnimatedHeader, 
  AnimatedSection,
  AnimatedGrid 
} from '@/components/animations/PageTransitions';
import {
  AnimatedCard,
  AnimatedButton,
  AnimatedBadge,
  AnimatedDiv,
  AnimatedSkeleton,
  AnimatedSpinner
} from '@/components/animations/AnimatedComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrecintosStore, useTransitosStore } from '@/store/store';
import { cn } from '@/utils/utils';
import { notificationService } from '@/services/shared/notification.service';
import { armadoService } from '../services/armado.service';
import type { Precinto, TransitoPendiente } from '@/types';
import { fadeInUp, staggerChildren, scaleIn } from '@/components/animations/AnimationPresets';
import { ArmConfirmationModalEnhanced } from '../components/ArmConfirmationModalEnhanced';

// Precinto Search Enhanced Component
const PrecintoSearchEnhanced: React.FC<{
  onSelect: (precinto: Precinto) => void;
  value: string;
  onChange: (value: string) => void;
}> = ({ onSelect, value, onChange }) => {
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Precinto[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const {precintos, fetchPrecintos} = usePrecintosStore();

  useEffect(() => {
    fetchPrecintos();
  }, [fetchPrecintos]);

  const handleSearch = async () => {
    if (!value.trim()) return;
    
    setSearching(true);
    setHasSearched(true);
    try {
      // Simular búsqueda
      await new Promise(resolve => setTimeout(resolve, 500));
      const filtered = precintos.filter(p => 
        p.codigo.toLowerCase().includes(value.toLowerCase()) &&
        ['SAL', 'LLE'].includes(p.estado) // Solo precintos disponibles para armar
      );
      setResults(filtered);
    } finally {
      setSearching(false);
    }
  };

  // Clear results when value is empty
  useEffect(() => {
    if (!value.trim()) {
      setResults([]);
      setHasSearched(false);
    }
  }, [value]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="relative">
            <Input
              placeholder="Buscar precinto por código (ej: BT20240001)..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 pr-10 h-12 text-base"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setResults([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded-md transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <AnimatedButton
            variant="primary"
            onClick={handleSearch}
            disabled={searching || !value.trim()}
            className="h-12 px-6"
          >
            {searching ? (
              <>
                <AnimatedSpinner className="h-4 w-4 mr-2" />
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                <span>Buscar</span>
              </>
            )}
          </AnimatedButton>
          <AnimatedButton
            variant="outline"
            onClick={() => console.log('Scan QR')}
            className="h-12 px-4"
            title="Escanear código QR"
          >
            <QrCode className="h-5 w-5" />
            <span className="ml-2 hidden sm:inline">Escanear QR</span>
          </AnimatedButton>
        </div>
      </div>
      
      {/* Quick access buttons for common prefixes */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-gray-500">Búsquedas rápidas:</span>
        {['BT2024', 'BT2023', 'RF-01'].map(prefix => (
          <button
            key={prefix}
            type="button"
            onClick={async () => {
              onChange(prefix);
              // Esperar un tick para que se actualice el valor antes de buscar
              await new Promise(resolve => setTimeout(resolve, 0));
              // Buscar directamente con el prefijo
              setSearching(true);
              try {
                await new Promise(resolve => setTimeout(resolve, 500));
                const filtered = precintos.filter(p => 
                  p.codigo.toLowerCase().includes(prefix.toLowerCase()) &&
                  ['SAL', 'LLE'].includes(p.estado)
                );
                setResults(filtered);
                setHasSearched(true);
              } finally {
                setSearching(false);
              }
            }}
            className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded-md transition-colors text-gray-300"
          >
            {prefix}
          </button>
        ))}
      </div>

      {value.length > 0 && value.trim().length === 0 && (
        <p className="text-sm text-gray-400">
          Ingresa un código de precinto válido
        </p>
      )}

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">
                {results.length} precinto{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
              </p>
              <button
                type="button"
                onClick={() => {
                  setResults([]);
                  onChange('');
                }}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Limpiar resultados
              </button>
            </div>
            {results.map((precinto, index) => (
              <motion.div
                key={precinto.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.2) }}
              >
                <Card 
                  className="cursor-pointer hover:bg-gray-800/50 hover:border-blue-500/50 transition-all duration-200 group"
                  onClick={() => onSelect(precinto)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-400" />
                          <p className="font-medium text-white group-hover:text-blue-400 transition-colors">
                            {precinto.codigo}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-400 flex items-center gap-1">
                            <Battery className={cn(
                              "h-3 w-3",
                              precinto.bateria > 60 ? "text-green-400" :
                              precinto.bateria > 30 ? "text-yellow-400" : "text-red-400"
                            )} />
                            {precinto.bateria}%
                          </span>
                          <span className="text-sm text-gray-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {precinto.ubicacionActual?.direccion || precinto.ubicacion || 'Sin ubicación'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="success" className="bg-green-500/20 text-green-400 border-green-500/50">
                          Disponible
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {hasSearched && results.length === 0 && !searching && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-lg p-6 text-center border border-gray-700"
        >
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-gray-700/50 rounded-full">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <p className="text-sm text-gray-300 font-medium mb-1">
            No se encontraron precintos disponibles
          </p>
          <p className="text-xs text-gray-500">
            No hay precintos con el código "<span className="text-gray-400 font-mono">{value}</span>" disponibles para armar
          </p>
          <p className="text-xs text-gray-600 mt-3">
            Los precintos deben estar en estado SAL o LLE para poder ser armados
          </p>
        </motion.div>
      )}
    </div>
  );
};

// Main Component
export const ArmadoPageV2: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedPrecinto, setSelectedPrecinto] = useState<Precinto | null>(null);
  const [precintoSearch, setPrecintoSearch] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    // Datos del viaje
    precintoId: '',
    tipoViaje: '' as 'Tránsito' | 'GEX' | 'Monitoreo externo' | '',
    dua: '',
    
    // Datos del vehículo
    matricula: '',
    matriculaRemolque: '',
    contenedorId: '',
    
    // Datos del conductor
    nombreConductor: '',
    tipoDocumentoConductor: 'CI',
    numeroDocumentoConductor: '',
    origenDocumentoConductor: 'Uruguay',
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
      corta: false,
    },
    observaciones: ''
  });

  const handlePrecintoSelect = (precinto: Precinto) => {
    setSelectedPrecinto(precinto);
    setFormData(prev => ({ ...prev, precintoId: precinto.id }));
    notificationService.success('Precinto seleccionado', `Precinto ${precinto.codigo} seleccionado correctamente`);
  };

  const handleSubmit = async () => {
    // Validaciones básicas
    if (!selectedPrecinto) {
      notificationService.error('Error', 'Debes seleccionar un precinto');
      return;
    }
    if (!formData.tipoViaje || !formData.dua || !formData.matricula || !formData.nombreConductor) {
      notificationService.error('Error', 'Completa todos los campos obligatorios');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmArm = async () => {
    setLoading(true);
    try {
      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      notificationService.success(
        'Precinto Armado',
        `El precinto ${selectedPrecinto?.codigo} ha sido armado exitosamente`
      );
      
      // Navegar a página de espera
      navigate(`/armado/waiting/${selectedPrecinto?.id}`);
    } catch (_error) {
      notificationService.error(
        'Error',
        'No se pudo completar el armado del precinto'
      );
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto space-y-6">
        <AnimatedHeader
          title="Armado de Precinto"
          subtitle="Proceso de precintado de transporte"
          icon={<Package className="h-8 w-8 text-blue-500" />}
        />

        {/* Formulario completo en una sola página */}
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          {/* Sección 1: Selección de Precinto */}
          <AnimatedSection delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Selección de Precinto
                </CardTitle>
                <CardDescription>
                  Busca y selecciona el precinto a armar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <PrecintoSearchEnhanced
                  value={precintoSearch}
                  onChange={setPrecintoSearch}
                  onSelect={handlePrecintoSelect}
                />
                
                {selectedPrecinto && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Alert className="bg-green-500/10 border-green-500/20">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <AlertTitle>Precinto Seleccionado</AlertTitle>
                      <AlertDescription>
                        <div className="mt-2 space-y-1">
                          <p>Código: {selectedPrecinto.codigo}</p>
                          <p>Batería: {selectedPrecinto.bateria}%</p>
                          <p>Estado: {selectedPrecinto.estado}</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Grid de 2 columnas para el resto del formulario */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Izquierda */}
            <div className="space-y-6">
              {/* Sección 2: Datos del Viaje */}
              <AnimatedSection delay={0.2}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      Datos del Viaje
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="tipoViaje">Tipo de Viaje *</Label>
                      <Select 
                        value={formData.tipoViaje} 
                        onValueChange={(v) => setFormData(prev => ({ ...prev, tipoViaje: v as unknown }))}
                        required
                      >
                        <SelectTrigger id="tipoViaje">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tránsito">Tránsito</SelectItem>
                          <SelectItem value="GEX">GEX</SelectItem>
                          <SelectItem value="Monitoreo externo">Monitoreo externo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="dua">DUA *</Label>
                      <Input
                        id="dua"
                        placeholder="Número de DUA"
                        value={formData.dua}
                        onChange={(e) => setFormData(prev => ({ ...prev, dua: e.target.value }))}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>

              {/* Sección 3: Vehículo */}
              <AnimatedSection delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-blue-500" />
                      Datos del Vehículo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="matricula">Matrícula *</Label>
                      <Input
                        id="matricula"
                        placeholder="ABC 1234"
                        value={formData.matricula}
                        onChange={(e) => setFormData(prev => ({ ...prev, matricula: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="matriculaRemolque">Matrícula Remolque (Opcional)</Label>
                      <Input
                        id="matriculaRemolque"
                        placeholder="DEF 5678"
                        value={formData.matriculaRemolque}
                        onChange={(e) => setFormData(prev => ({ ...prev, matriculaRemolque: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="contenedorId">ID Contenedor (Opcional)</Label>
                      <Input
                        id="contenedorId"
                        placeholder="CONT123456"
                        value={formData.contenedorId}
                        onChange={(e) => setFormData(prev => ({ ...prev, contenedorId: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>

              {/* Sección 5: Ruta */}
              <AnimatedSection delay={0.5}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      Ruta y Ubicaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="origen">Origen</Label>
                        <Input
                          id="origen"
                          placeholder="Montevideo"
                          value={formData.origen}
                          onChange={(e) => setFormData(prev => ({ ...prev, origen: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="destino">Destino</Label>
                        <Input
                          id="destino"
                          placeholder="Rivera"
                          value={formData.destino}
                          onChange={(e) => setFormData(prev => ({ ...prev, destino: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="depositoInicio">Depósito Inicio</Label>
                        <Input
                          id="depositoInicio"
                          placeholder="Depósito A"
                          value={formData.depositoInicio}
                          onChange={(e) => setFormData(prev => ({ ...prev, depositoInicio: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="depositoFin">Depósito Final</Label>
                        <Input
                          id="depositoFin"
                          placeholder="Depósito B"
                          value={formData.depositoFin}
                          onChange={(e) => setFormData(prev => ({ ...prev, depositoFin: e.target.value }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-6">
              {/* Sección 4: Conductor */}
              <AnimatedSection delay={0.4}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      Datos del Conductor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="nombreConductor">Nombre Completo *</Label>
                      <Input
                        id="nombreConductor"
                        placeholder="Juan Pérez"
                        value={formData.nombreConductor}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombreConductor: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tipoDocumento">Tipo Documento</Label>
                        <Select 
                          value={formData.tipoDocumentoConductor} 
                          onValueChange={(v) => setFormData(prev => ({ ...prev, tipoDocumentoConductor: v }))}
                        >
                          <SelectTrigger id="tipoDocumento">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CI">CI</SelectItem>
                            <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                            <SelectItem value="DNI">DNI</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="numeroDocumento">Número</Label>
                        <Input
                          id="numeroDocumento"
                          placeholder="12345678"
                          value={formData.numeroDocumentoConductor}
                          onChange={(e) => setFormData(prev => ({ ...prev, numeroDocumentoConductor: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        placeholder="+598 99 123 456"
                        value={formData.telefonoConductor}
                        onChange={(e) => setFormData(prev => ({ ...prev, telefonoConductor: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>

              {/* Sección 6: Empresa */}
              <AnimatedSection delay={0.6}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-blue-500" />
                      Datos de la Empresa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="empresa">Empresa Principal</Label>
                      <Input
                        id="empresa"
                        placeholder="Transportes S.A."
                        value={formData.empresa}
                        onChange={(e) => setFormData(prev => ({ ...prev, empresa: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="rutEmpresa">RUT Empresa</Label>
                      <Input
                        id="rutEmpresa"
                        placeholder="123456789012"
                        value={formData.rutEmpresa}
                        onChange={(e) => setFormData(prev => ({ ...prev, rutEmpresa: e.target.value }))}
                      />
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <Label>Empresa Secundaria (Opcional)</Label>
                      <Input
                        placeholder="Empresa secundaria"
                        value={formData.empresaSecundaria}
                        onChange={(e) => setFormData(prev => ({ ...prev, empresaSecundaria: e.target.value }))}
                      />
                      <Input
                        placeholder="RUT secundario"
                        value={formData.rutEmpresaSecundaria}
                        onChange={(e) => setFormData(prev => ({ ...prev, rutEmpresaSecundaria: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>

              {/* Sección 7: Eslingas y Observaciones */}
              <AnimatedSection delay={0.7}>
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración Adicional</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Tipo de Eslinga</Label>
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="eslingaLarga"
                            checked={formData.tipoEslinga.larga}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({ 
                                ...prev, 
                                tipoEslinga: { ...prev.tipoEslinga, larga: checked as boolean }
                              }))
                            }
                          />
                          <Label htmlFor="eslingaLarga">Larga</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="eslingaCorta"
                            checked={formData.tipoEslinga.corta}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({ 
                                ...prev, 
                                tipoEslinga: { ...prev.tipoEslinga, corta: checked as boolean }
                              }))
                            }
                          />
                          <Label htmlFor="eslingaCorta">Corta</Label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="observaciones">Observaciones</Label>
                      <Textarea
                        id="observaciones"
                        placeholder="Notas adicionales..."
                        value={formData.observaciones}
                        onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>

          {/* Sección 8: Fotos */}
          <AnimatedSection delay={0.8}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-500" />
                  Captura de Fotos
                </CardTitle>
                <CardDescription>
                  Documenta el estado del vehículo y la carga
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Camera className="h-4 w-4" />
                    <AlertTitle>Fotos Requeridas</AlertTitle>
                    <AlertDescription>
                      Debes capturar al menos 3 fotos: frontal, lateral y de la carga
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="aspect-video bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 
                                 flex items-center justify-center cursor-pointer hover:border-gray-500 transition-colors"
                      >
                        <Camera className="h-8 w-8 text-gray-500" />
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      {photos.length} fotos capturadas
                    </p>
                    <AnimatedButton variant="outline">
                      <Camera className="h-4 w-4 mr-2" />
                      Capturar Foto
                    </AnimatedButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Botón de envío */}
          <AnimatedSection delay={0.9}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    <p>* Campos obligatorios</p>
                    <p className="text-xs mt-1">Asegúrate de completar toda la información antes de confirmar</p>
                  </div>
                  <AnimatedButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={!selectedPrecinto || loading}
                  >
                    {loading ? <AnimatedSpinner className="h-4 w-4 mr-2" /> : null}
                    Confirmar Armado
                  </AnimatedButton>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </form>

        {/* Modal de confirmación */}
        <ArmConfirmationModalEnhanced
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmArm}
          loading={loading}
          formData={formData as unknown}
          precinto={selectedPrecinto}
        />
      </div>
    </PageTransition>
  );
};

export default ArmadoPageV2;
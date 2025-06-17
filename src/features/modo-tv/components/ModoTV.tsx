import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Volume2, VolumeX, Maximize2, Settings } from 'lucide-react';
import { ProximosArribos } from './ProximosArribos';
import { AlertasActivas } from './AlertasActivas';
import { TransitosCriticos } from './TransitosCriticos';
import { ConfiguracionModal } from './ConfiguracionModal';
import { modoTvService } from '../services/modoTv.service';
import { notificationService } from '../../../services/shared/notification.service';
import type { ProximoArribo, AlertaTV, TransitoCritico, ConfiguracionTV } from '../types';
import { cn } from '../../../utils/utils';

export const ModoTV: React.FC = () => {
  const [arribos, setArribos] = useState<ProximoArribo[]>([]);
  const [alertas, setAlertas] = useState<AlertaTV[]>([]);
  const [criticos, setCriticos] = useState<TransitoCritico[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionTV>(modoTvService.getConfiguracion());
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [horaActual, setHoraActual] = useState(new Date());
  const [fullscreen, setFullscreen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const ultimasAlertasRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement>(null);

  // Cargar datos
  const cargarDatos = async () => {
    try {
      const [nuevosArribos, nuevasAlertas, nuevosCriticos] = await Promise.all([
        modoTvService.getProximosArribos(),
        modoTvService.getAlertasActivas(),
        modoTvService.getTransitosCriticos()
      ]);

      setArribos(nuevosArribos);
      setCriticos(nuevosCriticos);
      
      // Verificar nuevas alertas para sonido
      if (configuracion.sonidoAlertas) {
        nuevasAlertas.forEach(alerta => {
          if (!ultimasAlertasRef.current.has(alerta.id)) {
            // Nueva alerta, reproducir sonido cuando esté disponible
            // audioRef.current?.play().catch(e => console.log('No se pudo reproducir sonido:', e));
            
            // Notificación visual
            if (alerta.nivel === 'critico') {
              notificationService.error('Alerta Crítica', alerta.descripcion);
            }
          }
        });
      }
      
      // Actualizar set de alertas
      ultimasAlertasRef.current.clear();
      nuevasAlertas.forEach(a => ultimasAlertasRef.current.add(a.id));
      
      setAlertas(nuevasAlertas);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  // Actualización automática
  useEffect(() => {
    cargarDatos();
    
    const intervalo = setInterval(() => {
      cargarDatos();
    }, configuracion.actualizacionSegundos * 1000);
    
    return () => clearInterval(intervalo);
  }, [configuracion.actualizacionSegundos, configuracion.puntoOperacion]);

  // Actualizar hora
  useEffect(() => {
    const intervalo = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);
    
    return () => clearInterval(intervalo);
  }, []);

  // Manejo de fullscreen
  const toggleFullscreen = async () => {
    if (!fullscreen && containerRef.current) {
      try {
        await containerRef.current.requestFullscreen();
        setFullscreen(true);
      } catch (err) {
        console.error('Error al entrar en fullscreen:', err);
      }
    } else if (fullscreen) {
      try {
        await document.exitFullscreen();
        setFullscreen(false);
      } catch (err) {
        console.error('Error al salir de fullscreen:', err);
      }
    }
  };

  // Listener para cambios de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleConfiguracionChange = (nuevaConfig: Partial<ConfiguracionTV>) => {
    const configActualizada = { ...configuracion, ...nuevaConfig };
    setConfiguracion(configActualizada);
    modoTvService.setConfiguracion(configActualizada);
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "min-h-screen bg-black text-white overflow-hidden",
        fullscreen && "fixed inset-0 z-50"
      )}
    >
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Monitor className="h-8 w-8 text-blue-500" />
              <h1 className="text-2xl font-bold">Centro de Monitoreo - Modo TV</h1>
            </div>
            {configuracion.puntoOperacion && (
              <div className="px-4 py-2 bg-blue-900/50 rounded-lg border border-blue-700">
                <span className="text-lg font-medium">{configuracion.puntoOperacion}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Hora actual */}
            <div className="text-right">
              <div className="text-3xl font-mono font-bold">
                {horaActual.toLocaleTimeString('es-UY', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
              <div className="text-sm text-gray-400">
                {horaActual.toLocaleDateString('es-UY', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </div>
            </div>
            
            {/* Controles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleConfiguracionChange({ sonidoAlertas: !configuracion.sonidoAlertas })}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title={configuracion.sonidoAlertas ? "Silenciar alertas" : "Activar sonido"}
              >
                {configuracion.sonidoAlertas ? (
                  <Volume2 className="h-6 w-6" />
                ) : (
                  <VolumeX className="h-6 w-6 text-gray-500" />
                )}
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Pantalla completa"
              >
                <Maximize2 className="h-6 w-6" />
              </button>
              
              <button
                onClick={() => setMostrarConfig(true)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Configuración"
              >
                <Settings className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className={cn(
        "p-6 h-[calc(100vh-88px)]",
        configuracion.columnas === 1 && "space-y-6",
        configuracion.columnas === 2 && "grid grid-cols-2 gap-6",
        configuracion.columnas === 3 && "grid grid-cols-3 gap-6"
      )}>
        {/* Panel principal - Próximos arribos */}
        <div className={cn(
          "bg-gray-900 rounded-lg border border-gray-800 overflow-hidden",
          configuracion.columnas === 1 && "h-full",
          configuracion.columnas > 1 && "row-span-2"
        )}>
          <ProximosArribos arribos={arribos} />
        </div>

        {/* Paneles secundarios */}
        {configuracion.columnas > 1 && (
          <div className="space-y-6">
            {/* Tránsitos críticos */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <TransitosCriticos criticos={criticos} />
            </div>
            
            {/* Alertas activas */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <AlertasActivas alertas={alertas} />
            </div>
          </div>
        )}

        {/* Tercera columna para layout de 3 columnas */}
        {configuracion.columnas === 3 && (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-xl font-semibold mb-4">Estadísticas del Día</h3>
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Arribos completados</p>
                <p className="text-3xl font-bold text-green-400">127</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">En tránsito</p>
                <p className="text-3xl font-bold text-blue-400">{arribos.length}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Alertas resueltas</p>
                <p className="text-3xl font-bold text-yellow-400">45</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audio para alertas - Comentado hasta tener archivos de audio */}
      {/* <audio ref={audioRef} preload="auto">
        <source src="/alert-sound.mp3" type="audio/mpeg" />
        <source src="/alert-sound.ogg" type="audio/ogg" />
      </audio> */}

      {/* Modal de configuración */}
      {mostrarConfig && (
        <ConfiguracionModal
          configuracion={configuracion}
          onClose={() => setMostrarConfig(false)}
          onChange={handleConfiguracionChange}
        />
      )}
    </div>
  );
};
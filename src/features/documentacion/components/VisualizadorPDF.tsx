import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardContent, LoadingState } from '../../../components/ui';
import { cn } from '../../../utils/utils';
import type { Documento } from '../types';
import { TIPOS_DOCUMENTO } from '../types';

interface VisualizadorPDFProps {
  documento: Documento | null;
  isOpen: boolean;
  onClose: () => void;
  onDescargar: (doc: Documento) => void;
}

export const VisualizadorPDF: React.FC<VisualizadorPDFProps> = ({
  documento,
  isOpen,
  onClose,
  onDescargar
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  if (!isOpen || !documento) return null;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const tipoConfig = TIPOS_DOCUMENTO[documento.tipo];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black z-40",
          fullscreen ? "bg-opacity-95" : "bg-opacity-75"
        )}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn(
        "fixed z-50 flex items-center justify-center",
        fullscreen ? "inset-0" : "inset-4"
      )}>
        <Card variant="elevated" className={cn(
          "w-full h-full overflow-hidden bg-gray-900",
          fullscreen ? "max-w-none" : "max-w-6xl"
        )}>
          {/* Header */}
          <CardHeader className="border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-2 rounded-lg",
                  `bg-${tipoConfig.color}-900/20`
                )}>
                  <FileText className={cn(
                    "h-6 w-6",
                    `text-${tipoConfig.color}-500`
                  )} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {documento.descripcion}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {tipoConfig.label} • {documento.nombreArchivo}
                  </p>
                </div>
              </div>

              {/* Controles del visor */}
              <div className="flex items-center gap-2">
                {/* Navegación de páginas */}
                <div className="flex items-center gap-1 px-3 py-1 bg-gray-800 rounded-lg">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-400" />
                  </button>
                  <span className="text-sm text-gray-300 px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                {/* Controles de zoom */}
                <div className="flex items-center gap-1 px-3 py-1 bg-gray-800 rounded-lg">
                  <button
                    onClick={handleZoomOut}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="Alejar"
                  >
                    <ZoomOut className="h-4 w-4 text-gray-400" />
                  </button>
                  <span className="text-sm text-gray-300 px-2 min-w-[50px] text-center">
                    {zoom}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="Acercar"
                  >
                    <ZoomIn className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                {/* Otros controles */}
                <button
                  onClick={handleRotate}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Rotar"
                >
                  <RotateCw className="h-5 w-5 text-gray-400" />
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                >
                  {fullscreen ? (
                    <Minimize2 className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Maximize2 className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                <button
                  onClick={() => onDescargar(documento)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Descargar"
                >
                  <Download className="h-5 w-5 text-gray-400" />
                </button>

                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors ml-2"
                  title="Cerrar"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </CardHeader>

          {/* Contenido del PDF */}
          <CardContent className="p-0 h-[calc(100%-80px)] overflow-hidden">
            <div className="w-full h-full bg-gray-950 flex items-center justify-center">
              {loading && (
                <LoadingState 
                  variant="spinner" 
                  text="Cargando documento..." 
                />
              )}
              
              {/* Simulación del visor PDF */}
              <div 
                className="bg-white shadow-xl transition-all duration-300"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                  width: '80%',
                  height: '90%',
                  maxWidth: '800px',
                  display: loading ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onLoad={() => setLoading(false)}
              >
                <div className="text-gray-800 text-center p-8">
                  <FileText className="h-24 w-24 mx-auto mb-4 text-gray-400" />
                  <p className="text-xl font-medium mb-2">Visualizador PDF</p>
                  <p className="text-gray-600">
                    En producción, aquí se mostraría el contenido del PDF
                  </p>
                  <p className="text-sm text-gray-500 mt-4">
                    {documento.nombreArchivo}
                  </p>
                  {documento.numeroDUA && (
                    <p className="text-sm text-gray-500">
                      DUA: {documento.numeroDUA}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
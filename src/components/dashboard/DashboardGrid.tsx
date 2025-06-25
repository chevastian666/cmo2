 
/**
 * Dashboard Grid con widgets arrastrables y redimensionables
 * By Cheva
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Responsive, WidthProvider} from 'react-grid-layout'
import type { Layout, Layouts} from 'react-grid-layout'
import { Lock, Unlock, Save, RotateCcw, Settings} from 'lucide-react'
import { cn} from '../../utils/utils'
import { motion, AnimatePresence} from 'framer-motion'
import { useDashboardStore } from '@/store/dashboardStore'
// CSS de react-grid-layout
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
const ResponsiveGridLayout = WidthProvider(Responsive)
export interface WidgetConfig {
  id: string
  type: string
  title: string
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
}

interface DashboardGridProps {
  widgets: WidgetConfig[]
  renderWidget: (widget: WidgetConfig) => React.ReactNode
  className?: string
  onLayoutChange?: (layouts: Layouts) => void
}

const CURRENT_LAYOUT_VERSION = 2
export const DashboardGrid: React.FC<DashboardGridProps> = ({
  widgets, renderWidget, className = '', onLayoutChange
}) => {

  const [isDragging, setIsDragging] = useState(false)
  
  // Get state from store
  const { layouts, layoutVersion, editMode, setLayouts, setEditMode, resetLayouts } = useDashboardStore()
  // Reset layouts if version is outdated

    useEffect(() => {
    if (layoutVersion < CURRENT_LAYOUT_VERSION) {
      resetLayouts()
    }
  }, [])
  // Generar layouts por defecto si no existen
  const defaultLayouts = useMemo(() => {
    const generateLayout = (cols: number): Layout[] => {
      // Layout personalizado para priorizar precintos activos y pendientes
      // Layout personalizado para widgets
      
      return widgets.map((widget) => {
        let x = 0, y = 0, w = 4, h = 4
        // Posicionamiento específico según el widget - Layout optimizado
        if (widget.id === 'kpi-precintos') {
          // Precintos activos - arriba a la izquierda
          x = 0; y = 0; w = 3; h = 3
        } else if (widget.id === 'kpi-cumplimiento') {
          // Tasa de cumplimiento - arriba centro
          x = 3; y = 0; w = 3; h = 3
        } else if (widget.id === 'kpi-transitos') {
          // KPI tránsitos - arriba centro-derecha
          x = 6; y = 0; w = 3; h = 3
        } else if (widget.id === 'kpi-alertas') {
          // KPI alertas - arriba derecha
          x = 9; y = 0; w = 3; h = 3
        } else if (widget.id === 'pending-precintos') {
          // Pendientes precintar/desprecintar - segunda fila izquierda, prominente
          x = 0; y = 3; w = 6; h = 4
        } else if (widget.id === 'precinto-status') {
          // Estado de precintos - segunda fila derecha
          x = 6; y = 3; w = 6; h = 4
        } else if (widget.id === 'map') {
          // Mapa - tercera fila izquierda, más grande
          x = 0; y = 7; w = 7; h = 6
        } else if (widget.id === 'chart-main') {
          // Gráfico principal - tercera fila derecha
          x = 7; y = 7; w = 5; h = 6
        } else if (widget.id === 'statistics') {
          // Estadísticas - cuarta fila izquierda
          x = 0; y = 13; w = 4; h = 4
        } else if (widget.id === 'activity') {
          // Actividad - cuarta fila centro
          x = 4; y = 13; w = 4; h = 4
        } else if (widget.id === 'transits') {
          // Widget tránsitos - cuarta fila derecha
          x = 8; y = 13; w = 4; h = 4
        } else if (widget.id === 'alerts') {
          // Widget alertas - quinta fila
          x = 0; y = 17; w = 12; h = 4
        }
        
        // Ajustar para diferentes tamaños de pantalla
        if (cols === 10) { // md
          w = Math.min(w, 5)
          x = Math.min(x, 5)
        } else if (cols === 6) { // sm
          w = Math.min(w, 6)
          x = x % 6
        } else if (cols === 4) { // xs
          w = 4
          x = 0
          y = widgets.indexOf(widget) * 4
        } else if (cols === 2) { // xxs
          w = 2
          x = 0
          y = widgets.indexOf(widget) * 3
        }
        
        return {
          i: widget.id,
          x,
          y,
          w,
          h,
          minW: widget.minW || 2,
          minH: widget.minH || 2,
          maxW: widget.maxW,
          maxH: widget.maxH,
          static: !editMode
        }
      })
    }
    return {
      lg: generateLayout(12),
      md: generateLayout(10),
      sm: generateLayout(6),
      xs: generateLayout(4),
      xxs: generateLayout(2)
    }
  }, [widgets])
  const currentLayouts = layouts || defaultLayouts
  const handleLayoutChange = useCallback((_layout: Layout[], layouts: Layouts) => {
    setLayouts(layouts)
    onLayoutChange?.(layouts)
  }, [onLayoutChange])
  const toggleEditMode = () => {
    setEditMode(!editMode)
  }
  const _saveLayouts = () => {
    // Los layouts ya se guardan automáticamente en el store con persist
    // Esta función es para feedback visual
    const notification = document.createElement('div')
    notification.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'
    notification.textContent = 'Dashboard guardado'
    document.body.appendChild(notification)
    setTimeout(() => notification.remove(), 2000)
  }
  return (
    <div className={cn('relative', className)}>
      {/* Controles del Dashboard */}
      <div className="absolute top-0 right-0 z-10 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleEditMode}
          className={cn(
            'p-2 rounded-lg transition-all duration-200',
            editMode
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
          )}
          title={editMode ? 'Bloquear widgets' : 'Editar dashboard'}
        >
          {editMode ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        </motion.button>

        {editMode && (
          <>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={_saveLayouts}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Guardar diseño"
            >
              <Save className="h-4 w-4" />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetLayouts}
              className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              title="Restablecer diseño"
            >
              <RotateCcw className="h-4 w-4" />
            </motion.button>
          </>
        )}
      </div>

      {/* Grid de Widgets */}
      <ResponsiveGridLayout
        className={cn(
          'layout',
          isDragging && 'cursor-grabbing'
        )}
        layouts={currentLayouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={70}
        margin={[12, 12]}
        containerPadding={[0, 0]}
        isDraggable={editMode}
        isResizable={editMode}
        onDragStart={() => setIsDragging(true)}
        onDragStop={() => setIsDragging(false)}
        onResizeStart={() => setIsDragging(true)}
        onResizeStop={() => setIsDragging(false)}
        draggableHandle=".widget-drag-handle"
      >
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={cn(
              'bg-gray-800 rounded-lg border border-gray-700 overflow-hidden',
              'transition-all duration-200',
              editMode && 'hover:border-blue-500',
              isDragging && 'opacity-90'
            )}
          >
            {/* Header del Widget */}
            <div className={cn(
              'widget-header px-3 py-2.5 bg-gray-900/50 border-b border-gray-700',
              'flex items-center justify-between shrink-0',
              editMode && 'widget-drag-handle cursor-move'
            )}>
              <h3 className="text-sm font-medium text-white select-none truncate">
                {widget.title}
              </h3>
              {editMode && (
                <Settings className="h-4 w-4 text-gray-500 shrink-0" />
              )}
            </div>

            {/* Contenido del Widget */}
            <div className="widget-content p-3 h-[calc(100%-50px)] overflow-hidden flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={widget.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full w-full flex-1"
                >
                  {renderWidget(widget)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>

      {/* Estilos personalizados */}
      <style>{`
        .react-grid-item {
          transition: all 200ms ease
        }
        
        .react-grid-item.react-grid-placeholder {
          background: rgba(59, 130, 246, 0.15)
          border: 2px dashed rgba(59, 130, 246, 0.5)
          border-radius: 0.5rem
        }
        
        .react-grid-item.resizing {
          opacity: 0.9
          z-index: 10
        }
        
        .react-grid-item.react-draggable-dragging {
          opacity: 0.8
          z-index: 20
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5)
        }
        
        .react-resizable-handle {
          opacity: 0
          transition: opacity 200ms ease
        }
        
        .react-grid-item:hover .react-resizable-handle {
          opacity: 1
        }
        
        .react-resizable-handle::after {
          border-right-color: #3b82f6 !important
          border-bottom-color: #3b82f6 !important
        }
      `}</style>
    </div>
  )
}
export default DashboardGrid
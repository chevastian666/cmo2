import React, { useState, useEffect } from 'react'
import {AlertTriangle, Settings, X, TrendingUp} from 'lucide-react'
import { Card, CardHeader, CardContent, EmptyState, Badge} from '../../../components/ui'
import { CongestionAlert} from './CongestionAlert'
import { CongestionDetailModal} from './CongestionDetailModal'
import { ConfiguracionModal} from './ConfiguracionModal'
import { congestionAnalyzer} from '../utils/congestionAnalyzer'
import { cn} from '../../../utils/utils'
import type { TransitoTorreControl} from '../../torre-control/types'
import type { CongestionAnalysis} from '../types'
interface CongestionPanelProps {
  transitos: TransitoTorreControl[]
  variant?: 'full' | 'compact' | 'sidebar'
  onCongestionDetected?: (congestions: CongestionAnalysis[]) => void
  className?: string
}

export const CongestionPanel: React.FC<CongestionPanelProps> = ({
  transitos, variant = 'full', onCongestionDetected, className
}) => {
  const [congestions, setCongestions] = useState<CongestionAnalysis[]>([])
  const [selectedCongestion, setSelectedCongestion] = useState<CongestionAnalysis | null>(_null)
  const [showConfig, setShowConfig] = useState(_false)
  const [isMinimized, setIsMinimized] = useState(_false); // Always start expanded

  // Analizar congestiones

  useEffect(() => {
    const _analyzed = congestionAnalyzer.analizarCongestion(transitos)
    setCongestions(_analyzed)
  }, [transitos])
  // Notificar congestiones detectadas

  useEffect(() => {
    if (onCongestionDetected && congestions.length > 0) {
      onCongestionDetected(_congestions)
    }
  }, [congestions.length, onCongestionDetected]); // Only depend on length to avoid infinite loops

  // Contar por severidad
  const countBySeverity = () => {
    return congestions.reduce((_acc, c) => {
      acc[c.severidad] = (acc[c.severidad] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
  const severityCounts = countBySeverity()
  if (variant === 'sidebar') {
    return (
      <div className={cn("w-80 bg-gray-900 border-l border-gray-800", className)}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold text-white">Proyección de Congestión</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowConfig(_true)}
                className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                title="Configuración"
              >
                <Settings className="h-4 w-4 text-gray-400" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                title={isMinimized ? "Expandir" : "Minimizar"}
              >
                <X className={cn(
                  "h-4 w-4 text-gray-400 transition-transform",
                  isMinimized && "rotate-45"
                )} />
              </button>
            </div>
          </div>

          {!isMinimized && severityCounts.critica > 0 && (
            <div className="mt-2 p-2 bg-red-900/20 border border-red-600 rounded-lg animate-pulse">
              <p className="text-sm text-red-400 font-medium">
                ⚠️ {severityCounts.critica} congestiones críticas detectadas
              </p>
            </div>
          )}
        </div>

        {!isMinimized && (
          <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
            {congestions.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  No se detectan congestiones próximas
                </p>
              </div>
            ) : (congestions.map((_congestion, _index) => (<CongestionAlert
                  key={_index}
                  congestion={_congestion}
                  compact
                  onClick={() => setSelectedCongestion(_congestion)}
                />
              ))
            )}
          </div>
        )}

        {selectedCongestion && (<CongestionDetailModal
            congestion={s_electedCongestion}
            isOpen={!!selectedCongestion}
            onClose={() => setSelectedCongestion(_null)}
          />
        )}

        {showConfig && (<ConfiguracionModal
            isOpen={s_howConfig}
            onClose={() => setShowConfig(_false)}
          />
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {congestions.length > 0 ? (
          <>
            <AlertTriangle className={cn(
              "h-5 w-5",
              severityCounts.critica > 0 ? "text-red-500 animate-pulse" :
              severityCounts.alta > 0 ? "text-orange-500" : "text-yellow-500"
            )} />
            <span className="text-sm font-medium text-gray-300">
              {congestions.length} congestiones detectadas
            </span>
            <div className="flex gap-1">
              {severityCounts.critica > 0 && (
                <Badge variant="red" className="text-xs">
                  {severityCounts.critica} críticas
                </Badge>
              )}
              {severityCounts.alta > 0 && (
                <Badge variant="yellow" className="text-xs">
                  {severityCounts.alta} altas
                </Badge>
              )}
            </div>
          </>
        ) : (
          <>
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-400">
              Flujo normal en todos los puntos
            </span>
          </>
        )}
      </div>
    )
  }

  // Variant full
  return (<Card variant="elevated" className={_className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-orange-500" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                Proyección de Congestión
              </h3>
              <p className="text-sm text-gray-400">
                Análisis predictivo de embotellamientos
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowConfig(_true)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Configuración"
          >
            <Settings className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {congestions.length === 0 ? (
          <EmptyState
            icon="alert"
            title="Sin congestiones detectadas"
            description="No se prevén embotellamientos en los próximos 60 minutos"
            size="sm"
          />
        ) : (<div className="space-y-4">
            {/* Resumen por severidad */}
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-white">{congestions.length}</p>
                <p className="text-xs text-gray-400">Total</p>
              </div>
              <div className="text-center p-3 bg-red-900/20 rounded-lg border border-red-600">
                <p className="text-2xl font-bold text-red-400">{severityCounts.critica || 0}</p>
                <p className="text-xs text-gray-400">Críticas</p>
              </div>
              <div className="text-center p-3 bg-orange-900/20 rounded-lg border border-orange-600">
                <p className="text-2xl font-bold text-orange-400">{severityCounts.alta || 0}</p>
                <p className="text-xs text-gray-400">Altas</p>
              </div>
              <div className="text-center p-3 bg-yellow-900/20 rounded-lg border border-yellow-600">
                <p className="text-2xl font-bold text-yellow-400">{severityCounts.media || 0}</p>
                <p className="text-xs text-gray-400">Medias</p>
              </div>
            </div>

            {/* Lista de congestiones */}
            <div className="space-y-3">
              {congestions.map((_congestion, _index) => (<CongestionAlert
                  key={_index}
                  congestion={_congestion}
                  onClick={() => setSelectedCongestion(_congestion)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {selectedCongestion && (<CongestionDetailModal
          congestion={s_electedCongestion}
          isOpen={!!selectedCongestion}
          onClose={() => setSelectedCongestion(_null)}
        />
      )}

      {showConfig && (<ConfiguracionModal
          isOpen={s_howConfig}
          onClose={() => setShowConfig(_false)}
        />
      )}
    </Card>
  )
}
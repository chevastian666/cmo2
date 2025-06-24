/**
 * Dashboard Principal del Sistema CMO
 * By Cheva
 */

import React, { memo, useEffect, useState, useCallback } from 'react'
import { SystemStatusCard} from './SystemStatusCard'
import { PrecintosActivosTable} from './PrecintosActivosTable'
import { TransitosPendientesWrapper} from '../../transitos'
import { AlertsList} from '../../alertas'
import { RealtimeIndicator} from './RealtimeIndicator'
import { KPICards} from './KPICards'
import {NotificationSettings} from '../../../components/ui/NotificationSettings'
import { RefreshCw} from 'lucide-react'
import './dashboard.css'
import { DataTransition} from '../../../components/animations/DataTransition'
import { useSmootherRefresh} from '../../../hooks/useSmootherRefresh'
import { SkeletonDashboard} from '@/components/ui/skeleton'
import { 
  usePrecintosActivos, useTransitosPendientes, useAlertasActivas, useSystemStatus} from '../../../store/hooks'
export const Dashboard: React.FC = memo(() => {
  const { loading: loadingPrecintos, actions: precintosActions } = usePrecintosActivos()
  const { loading: loadingStatus, actions: statusActions } = useSystemStatus()
  const { loading: loadingAlertas, actions: alertasActions } = useAlertasActivas()
  const { loading: loadingTransitos, actions: transitosActions } = useTransitosPendientes()
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(60)
  // Función para mostrar notificaciones suaves
  const showNotification = useCallback((type: 'success' | 'error') => {
    const notification = document.createElement('div')
    notification.className = `fixed bottom-4 right-4 ${type === 'success' ? 'bg-green-600/90' : 'bg-red-600/90'} backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 transition-all duration-300 transform translate-y-0`
    notification.innerHTML = `
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${type === 'success' ? 'M5 13l4 4L19 7' : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}"></path>
      </svg>
      <span class="text-sm font-medium">${type === 'success' ? 'Datos actualizados' : 'Error al actualizar'}</span>
    `
    // Iniciar con opacidad 0 y desplazado hacia abajo
    notification.style.opacity = '0'
    notification.style.transform = 'translateY(1rem)'
    document.body.appendChild(notification)
    // Animar entrada
    requestAnimationFrame(() => {
      notification.style.opacity = '1'
      notification.style.transform = 'translateY(0)'
    })
    // Animar salida
    setTimeout(() => {
      notification.style.opacity = '0'
      notification.style.transform = 'translateY(1rem)'
      setTimeout(() => notification.remove(), 300)
    }, 2500)
  }, [])
  // Usar el hook de actualización suave
  const refreshFunctions = [
    precintosActions?.refresh,
    statusActions?.refresh,
    alertasActions?.refresh,
    transitosActions?.refresh
  ]
  const { refresh: smoothRefresh } = useSmootherRefresh(refreshFunctions, {
    onSuccess: () => {
      setLastUpdate(new Date())
      setSecondsUntilRefresh(60)
      showNotification('success')
      setIsRefreshing(false)
    },
    onError: () => {
      showNotification('error')
      setIsRefreshing(false)
    },
    minimumDelay: 400
  })
  // Función de recarga que usa el smoothRefresh
  const refreshData = useCallback(async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    await smoothRefresh()
  }, [smoothRefresh, isRefreshing])
  // Auto-refresh cada 60 segundos

    useEffect(() => {
    // Recargar inmediatamente al montar
    refreshData()
    // Configurar intervalo de 60 segundos
    const refreshInterval = setInterval(refreshData, 60000)
    // Contador de segundos
    const countdownInterval = setInterval(() => {
      setSecondsUntilRefresh(prev => {
        if (prev <= 1) {
          return 60
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      clearInterval(refreshInterval)
      clearInterval(countdownInterval)
    }
  }, [refreshData])
  // Solo mostrar skeleton en la carga inicial
  const isInitialLoading = loadingStatus && loadingPrecintos && loadingTransitos && loadingAlertas
  // Show skeleton only on initial load
  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Panel de Control</h2>
            <p className="text-gray-400 mt-1 text-sm sm:text-base lg:text-lg">Sistema de Monitoreo de Precintos Electrónicos - Block Tracker</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Actualización automática en:</span>
                <span className={`font-bold ${secondsUntilRefresh <= 10 ? 'text-yellow-400 animate-pulse' : 'text-white'}`}>
                  {secondsUntilRefresh}s
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Última:</span>
                <span className="font-medium text-white">
                  {lastUpdate.toLocaleTimeString('es-UY')}
                </span>
                <div className="relative w-4 h-4 ml-2">
                  {isRefreshing && (
                    <>
                      <RefreshCw className="h-4 w-4 text-blue-400 animate-spin absolute" />
                      <div className="absolute inset-0 bg-blue-400 opacity-20 rounded-full animate-ping" />
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 rounded-lg transition-colors"
                title="Actualizar ahora"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <NotificationSettings compact />
            <RealtimeIndicator />
          </div>
        </div>
        <SkeletonDashboard />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Panel de Control</h2>
          <p className="text-gray-400 mt-1 text-sm sm:text-base lg:text-lg">Sistema de Monitoreo de Precintos Electrónicos - Block Tracker</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <NotificationSettings compact />
          <RealtimeIndicator />
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL - Listados Críticos */}
      <div className={`space-y-6 transition-opacity duration-300 ${isRefreshing ? 'opacity-95' : 'opacity-100'}`}>
        {/* Título de sección prioritaria */}
        <div className="bg-gradient-to-r from-yellow-900/30 via-blue-900/30 to-red-900/30 rounded-lg p-4 border border-gray-600">
          <h2 className="text-2xl font-bold text-white text-center">
            🔴 MONITOREO PRIORITARIO - ATENCIÓN INMEDIATA 🔴
          </h2>
          <p className="text-center text-gray-300 mt-1">
            Tránsitos pendientes de precintar, precintos activos y alertas críticas
          </p>
        </div>
        
        {/* Tránsitos Pendientes en LUCIA - PRIORIDAD MÁXIMA */}
        <DataTransition dataKey="transitos">
          <TransitosPendientesWrapper />
        </DataTransition>

        {/* Grid con Precintos Activos y Alertas Activas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DataTransition dataKey="precintos">
              <PrecintosActivosTable />
            </DataTransition>
          </div>
          <div>
            <DataTransition dataKey="alertas">
              <AlertsList />
            </DataTransition>
          </div>
        </div>
      </div>

      {/* SECCIÓN SECUNDARIA - KPIs y Estado del Sistema */}
      <div className="mt-8 space-y-6">
        {/* KPI Cards */}
        <DataTransition dataKey="kpis">
          <KPICards />
        </DataTransition>

        <DataTransition dataKey="status">
          <SystemStatusCard />
        </DataTransition>
      </div>
    </div>
  )
})
Dashboard.displayName = 'Dashboard'
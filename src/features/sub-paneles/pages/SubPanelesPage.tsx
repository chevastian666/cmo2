import React, { useState, useEffect } from 'react'
import { Users, Plus, Activity, Building2, MapPin, Search, EyeOff, Key, Settings} from 'lucide-react'
export const SubPanelesPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  // Cerrar modal con Esc

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false)
      }
    }
    if (showModal) {
      document.addEventListener('keydown', handleEsc)
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])
  return (<div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Sub Paneles</h1>
          <p className="text-gray-400 mt-1">
            Gestión de accesos limitados para clientes y puntos operacionales
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nuevo Sub Panel
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Sub Paneles</p>
              <p className="text-2xl font-bold text-white">2</p>
            </div>
            <Users className="h-8 w-8 text-blue-500 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Activos</p>
              <p className="text-2xl font-bold text-white">2</p>
            </div>
            <Activity className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Clientes</p>
              <p className="text-2xl font-bold text-white">1</p>
            </div>
            <Building2 className="h-8 w-8 text-purple-500 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Puntos Operación</p>
              <p className="text-2xl font-bold text-white">1</p>
            </div>
            <MapPin className="h-8 w-8 text-orange-500 opacity-50" />
          </div>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email, empresa o punto..."
              className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
            <option value="">Todos los tipos</option>
            <option value="cliente">Clientes</option>
            <option value="punto">Puntos de Operación</option>
          </select>
        </div>
      </div>
      
      {/* Lista de Sub Paneles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Panel 1 - Cliente */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-white">Portal Cliente - Importadora ABC</h3>
                <p className="text-sm text-gray-400 mt-1">portal@importadoraabc.com</p>
              </div>
              <span className="px-2 py-1 text-xs bg-green-900/20 text-green-400 border border-green-800 rounded">
                Activo
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-purple-400" />
              <span className="text-gray-400">Tipo:</span>
              <span className="text-white">Cliente</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Empresa:</span>
              <span className="text-white ml-2">Importadora ABC S.A.</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Último acceso:</span>
              <span className="text-white ml-2">20/01/2024 14:30</span>
            </div>
            <div className="flex gap-2 pt-2">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors">
                <Key className="h-4 w-4" />
                Ver Token
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors">
                <Settings className="h-4 w-4" />
                Configurar
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors">
                <EyeOff className="h-4 w-4" />
                Desactivar
              </button>
            </div>
          </div>
        </div>
        
        {/* Panel 2 - Punto Operación */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-white">Punto TCP - Operaciones</h3>
                <p className="text-sm text-gray-400 mt-1">tcp.operaciones@blocktracker.com</p>
              </div>
              <span className="px-2 py-1 text-xs bg-green-900/20 text-green-400 border border-green-800 rounded">
                Activo
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-orange-400" />
              <span className="text-gray-400">Tipo:</span>
              <span className="text-white">Punto de Operación</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Punto:</span>
              <span className="text-white ml-2">TCP</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Último acceso:</span>
              <span className="text-white ml-2">20/01/2024 16:45</span>
            </div>
            <div className="flex gap-2 pt-2">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors">
                <Key className="h-4 w-4" />
                Ver Token
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors">
                <Settings className="h-4 w-4" />
                Configurar
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors">
                <EyeOff className="h-4 w-4" />
                Desactivar
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showModal && (<div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false)
            }
          }}
        >
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-white mb-4">Nuevo Sub Panel</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Tipo de Sub Panel
                </label>
                <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                  <option value="cliente">Cliente (Empresa)</option>
                  <option value="punto">Punto de Operación</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Nombre del Sub Panel
                </label>
                <input
                  type="text"
                  placeholder="Ej: Portal Cliente - Empresa ABC"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Email de contacto
                </label>
                <input
                  type="email"
                  placeholder="email@ejemplo.com"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Empresa
                </label>
                <input
                  type="text"
                  placeholder="Nombre de la empresa"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Permisos
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded" />
                    <span className="text-sm text-gray-300">Ver Tránsitos Propios</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded" />
                    <span className="text-sm text-gray-300">Ver Estados</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded" />
                    <span className="text-sm text-gray-300">Ver Alertas</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded" />
                    <span className="text-sm text-gray-300">Exportar Datos</span>
                  </label>
                </div>
              </div>
            </form>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Crear Sub Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
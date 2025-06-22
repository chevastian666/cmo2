import React, { useState } from 'react'
import { Phone, Mail, MapPin, FileText, Calendar, Plus} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import { Input} from '@/components/ui/input'
import { Label} from '@/components/ui/label'
import { Button} from '@/components/ui/button'
import { Switch} from '@/components/ui/switch'
import { notificationService} from '@/services/shared/notification.service'
export const DespachantesPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    razonSocial: '',
    rut: '',
    telefono: '',
    email: '',
    direccion: '',
    activo: true
  })
  // Mock data de despachantes
  const despachantes = [
    {
      id: '1',
      nombre: 'SKUNCA SPINELLI CAROLINA',
      rut: '217894560012',
      telefono: '2908 1234',
      email: 'skunca@despachantes.uy',
      direccion: 'Rambla 25 de Agosto 123, Montevideo',
      activo: true,
      transitosActivos: 3,
      fechaRegistro: '2020-03-15'
    },
    {
      id: '2',
      nombre: 'SCHRAMM CANABAL AGUSTINA',
      rut: '214567890015',
      telefono: '2908 5678',
      email: 'schramm@despachantes.uy',
      direccion: 'Av. Italia 2456, Montevideo',
      activo: true,
      transitosActivos: 5,
      fechaRegistro: '2019-06-20'
    },
    {
      id: '3',
      nombre: 'ZUGASTI BARRIO FERNANDO LUIS',
      rut: '213456780018',
      telefono: '2908 9012',
      email: 'zugasti@despachantes.uy',
      direccion: 'Ciudad Vieja 789, Montevideo',
      activo: true,
      transitosActivos: 2,
      fechaRegistro: '2021-01-10'
    },
    {
      id: '4',
      nombre: 'QUEROL CAVANI CARLOS RAFAEL',
      rut: '212345670011',
      telefono: '2908 3456',
      email: 'querol@despachantes.uy',
      direccion: 'Pocitos 456, Montevideo',
      activo: false,
      transitosActivos: 0,
      fechaRegistro: '2018-11-25'
    },
    {
      id: '5',
      nombre: 'LUIS LAUREIRO',
      rut: '211234560014',
      telefono: '2908 7890',
      email: 'laureiro@despachantes.uy',
      direccion: 'Centro 1234, Montevideo',
      activo: true,
      transitosActivos: 8,
      fechaRegistro: '2017-05-18'
    },
    {
      id: '6',
      nombre: 'LAMANNA ACEVEDO MARIO NELSON',
      rut: '210123450017',
      telefono: '2908 4567',
      email: 'lamanna@despachantes.uy',
      direccion: 'Carrasco 567, Montevideo',
      activo: true,
      transitosActivos: 4,
      fechaRegistro: '2018-09-12'
    }
  ]
  return (<div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Despachantes</h1>
          <p className="text-gray-400 mt-1">Gestión de despachantes de aduana autorizados</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nuevo Despachante
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400">Total Despachantes</p>
          <p className="text-2xl font-semibold text-white mt-1">{despachantes.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400">Activos</p>
          <p className="text-2xl font-semibold text-white mt-1">
            {despachantes.filter(d => d.activo).length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400">Con Tránsitos</p>
          <p className="text-2xl font-semibold text-white mt-1">
            {despachantes.filter(d => d.transitosActivos > 0).length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400">Tránsitos Totales</p>
          <p className="text-2xl font-semibold text-white mt-1">
            {despachantes.reduce((sum, d) => sum + d.transitosActivos, 0)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Despachante
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  RUT
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tránsitos Activos
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {despachantes.map((despachante) => (
                <tr key={despachante.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">{despachante.nombre}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        Desde {new Date(despachante.fechaRegistro).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {despachante.rut}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-gray-300">
                        <Phone className="h-3 w-3 text-gray-500" />
                        {despachante.telefono}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-300">
                        <Mail className="h-3 w-3 text-gray-500" />
                        {despachante.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-gray-300">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      {despachante.direccion}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      despachante.transitosActivos > 0 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {despachante.transitosActivos} activos
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      despachante.activo 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {despachante.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-gray-400 hover:text-white">
                      <FileText className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Despachante */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Nuevo Despachante</DialogTitle>
            <DialogDescription className="text-gray-400">
              Registre un nuevo despachante de aduana
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault()
            // Aquí iría la lógica para guardar el despachante
            notificationService.success('Despachante registrado', `${formData.nombre} ha sido agregado exitosamente`)
            setShowModal(false)
            // Reset form
            setFormData({
              nombre: '',
              razonSocial: '',
              rut: '',
              telefono: '',
              email: '',
              direccion: '',
              activo: true
            })
          }}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: JUAN PÉREZ GONZÁLEZ"
                  className="mt-1 bg-gray-800 border-gray-700"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="razonSocial">Razón Social</Label>
                <Input
                  id="razonSocial"
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({...formData, razonSocial: e.target.value})}
                  placeholder="Ej: PÉREZ GONZÁLEZ Y ASOCIADOS S.A."
                  className="mt-1 bg-gray-800 border-gray-700"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="rut">RUT</Label>
                <Input
                  id="rut"
                  value={formData.rut}
                  onChange={(e) => setFormData({...formData, rut: e.target.value})}
                  placeholder="Ej: 217894560012"
                  className="mt-1 bg-gray-800 border-gray-700"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    placeholder="Ej: 2908 1234"
                    className="mt-1 bg-gray-800 border-gray-700"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@ejemplo.com"
                    className="mt-1 bg-gray-800 border-gray-700"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  placeholder="Ej: Rambla 25 de Agosto 123, Montevideo"
                  className="mt-1 bg-gray-800 border-gray-700"
                  required
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="activo" className="text-sm">Estado activo</Label>
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData({...formData, activo: checked})}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                className="bg-gray-800 border-gray-700"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Registrar Despachante
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
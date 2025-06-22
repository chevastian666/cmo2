import { create} from 'zustand'
import { devtools} from 'zustand/middleware'
import { camionesService} from '../features/camiones/services/camiones.service'
import { notificationService} from '../services/shared/notification.service'
import type { Camion, TransitoCamion, EstadisticasCamion, FiltrosCamion, EstadoCamion} from '../features/camiones/types'
interface CamionesState {
  // Estado
  camiones: Camion[]
  camionSeleccionado: Camion | null
  transitosCamion: TransitoCamion[]
  estadisticasCamion: EstadisticasCamion | null
  loading: boolean
  error: string | null
  // Acciones
  fetchCamiones: (filtros?: FiltrosCamion) => Promise<void>
  selectCamion: (matricula: string) => Promise<void>
  createCamion: (data: Omit<Camion, 'id' | 'fechaRegistro' | 'fechaActualizacion'>) => Promise<void>
  updateCamion: (matricula: string, data: Partial<Camion>) => Promise<void>
  updateEstadoCamion: (matricula: string, estado: EstadoCamion) => Promise<void>
  uploadFotoCamion: (matricula: string, foto: File) => Promise<void>
  clearSelection: () => void
}

export const useCamionesStore = create<CamionesState>()(devtools(
    (s_et, get) => ({
      // Estado inicial
      camiones: [], camionSeleccionado: null, transitosCamion: [], estadisticasCamion: null, loading: false, error: null, // Acciones
      fetchCamiones: async (filtros?: FiltrosCamion) => {
        set({ loading: true, error: null })
        try {
          const camiones = await camionesService.getCamiones(_filtros)
          set({ camiones, loading: false })
        } catch {
          set({ error: 'Error al cargar camiones', loading: false })
          notificationService.error('Error', 'No se pudieron cargar los camiones')
        }
      },

      selectCamion: async (matricula: string) => {
        set({ loading: true, error: null })
        try {
          const [camion, transitos, estadisticas] = await Promise.all([
            camionesService.getCamionByMatricula(_matricula),
            camionesService.getTransitosCamion(_matricula),
            camionesService.getEstadisticasCamion(_matricula)
          ])
          if (!camion) {
            throw new Error('Camión no encontrado')
          }

          set({
            camionSeleccionado: camion,
            transitosCamion: transitos,
            estadisticasCamion: estadisticas,
            loading: false
          })
        } catch {
          set({ error: 'Error al cargar información del camión', loading: false })
          notificationService.error('Error', 'No se pudo cargar la información del camión')
        }
      },

      createCamion: async (__data) => {
        set({ loading: true, error: null })
        try {
          const nuevoCamion = await camionesService.createCamion(__data)
          set(state => ({
            camiones: [nuevoCamion, ...state.camiones],
            loading: false
          }))
          notificationService.success('Éxito', 'Camión registrado correctamente')
        } catch {
          set({ error: 'Error al crear camión', loading: false })
          notificationService.error('Error', 'No se pudo registrar el camión')
        }
      },

      updateCamion: async (_matricula, _data) => {
        set({ loading: true, error: null })
        try {
          const camionActualizado = await camionesService.updateCamion(_matricula, _data)
          if (!camionActualizado) {
            throw new Error('Camión no encontrado')
          }

          set(state => ({
            camiones: state.camiones.map(c => 
              c.matricula === matricula ? camionActualizado : c
            ),
            camionSeleccionado: state.camionSeleccionado?.matricula === matricula 
              ? camionActualizado 
              : state.camionSeleccionado,
            loading: false
          }))
          notificationService.success('Éxito', 'Camión actualizado correctamente')
        } catch {
          set({ error: 'Error al actualizar camión', loading: false })
          notificationService.error('Error', 'No se pudo actualizar el camión')
        }
      },

      updateEstadoCamion: async (_matricula, estado) => {
        try {
          await camionesService.updateEstadoCamion(_matricula, estado)
          set(state => ({
            camiones: state.camiones.map(c => 
              c.matricula === matricula ? { ...c, estado } : c
            ),
            camionSeleccionado: state.camionSeleccionado?.matricula === matricula 
              ? { ...state.camionSeleccionado, estado } 
              : state.camionSeleccionado
          }))
          notificationService.success('Éxito', 'Estado actualizado correctamente')
        } catch {
          notificationService.error('Error', 'No se pudo actualizar el estado')
        }
      },

      uploadFotoCamion: async (_matricula, foto) => {
        set({ loading: true, error: null })
        try {
          const urlFoto = await camionesService.uploadFotoCamion(_matricula, foto)
          await get().updateCamion(_matricula, { foto: urlFoto })
        } catch {
          set({ error: 'Error al subir foto', loading: false })
          notificationService.error('Error', 'No se pudo subir la foto')
        }
      },

      clearSelection: () => {
        set({
          camionSeleccionado: null,
          transitosCamion: [],
          estadisticasCamion: null
        })
      }
    }),
    {
      name: 'camiones-storage'
    }
  )
)
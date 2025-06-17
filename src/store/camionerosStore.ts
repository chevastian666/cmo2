import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { camionerosService } from '../features/camioneros/services/camioneros.service';
import { notificationService } from '../services/shared/notification.service';
import type { Camionero, TransitoCamionero, EstadisticasCamionero, FiltrosCamionero, MatriculaFrecuente } from '../features/camioneros/types';

interface CamionerosState {
  // Estado
  camioneros: Camionero[];
  camioneroSeleccionado: Camionero | null;
  transitosCamionero: TransitoCamionero[];
  matriculasFrecuentes: MatriculaFrecuente[];
  estadisticasCamionero: EstadisticasCamionero | null;
  loading: boolean;
  error: string | null;

  // Acciones
  fetchCamioneros: (filtros?: FiltrosCamionero) => Promise<void>;
  selectCamionero: (documento: string) => Promise<void>;
  createCamionero: (data: Omit<Camionero, 'id' | 'fechaRegistro' | 'fechaActualizacion'>) => Promise<void>;
  updateCamionero: (documento: string, data: Partial<Camionero>) => Promise<void>;
  clearSelection: () => void;
}

export const useCamionerosStore = create<CamionerosState>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      camioneros: [],
      camioneroSeleccionado: null,
      transitosCamionero: [],
      matriculasFrecuentes: [],
      estadisticasCamionero: null,
      loading: false,
      error: null,

      // Acciones
      fetchCamioneros: async (filtros?: FiltrosCamionero) => {
        set({ loading: true, error: null });
        try {
          const camioneros = await camionerosService.getCamioneros(filtros);
          set({ camioneros, loading: false });
        } catch (error) {
          set({ error: 'Error al cargar camioneros', loading: false });
          notificationService.error('Error', 'No se pudieron cargar los camioneros');
        }
      },

      selectCamionero: async (documento: string) => {
        set({ loading: true, error: null });
        try {
          const [camionero, transitos, matriculas, estadisticas] = await Promise.all([
            camionerosService.getCamioneroByDocumento(documento),
            camionerosService.getTransitosCamionero(documento),
            camionerosService.getMatriculasFrecuentes(documento),
            camionerosService.getEstadisticasCamionero(documento)
          ]);

          if (!camionero) {
            throw new Error('Camionero no encontrado');
          }

          set({
            camioneroSeleccionado: camionero,
            transitosCamionero: transitos,
            matriculasFrecuentes: matriculas,
            estadisticasCamionero: estadisticas,
            loading: false
          });
        } catch (error) {
          set({ error: 'Error al cargar información del camionero', loading: false });
          notificationService.error('Error', 'No se pudo cargar la información del camionero');
        }
      },

      createCamionero: async (data) => {
        set({ loading: true, error: null });
        try {
          const nuevoCamionero = await camionerosService.createCamionero(data);
          set(state => ({
            camioneros: [nuevoCamionero, ...state.camioneros],
            loading: false
          }));
          notificationService.success('Éxito', 'Camionero registrado correctamente');
        } catch (error) {
          set({ error: 'Error al crear camionero', loading: false });
          notificationService.error('Error', 'No se pudo registrar el camionero');
        }
      },

      updateCamionero: async (documento, data) => {
        set({ loading: true, error: null });
        try {
          const camioneroActualizado = await camionerosService.updateCamionero(documento, data);
          if (!camioneroActualizado) {
            throw new Error('Camionero no encontrado');
          }

          set(state => ({
            camioneros: state.camioneros.map(c => 
              c.documento === documento ? camioneroActualizado : c
            ),
            camioneroSeleccionado: state.camioneroSeleccionado?.documento === documento 
              ? camioneroActualizado 
              : state.camioneroSeleccionado,
            loading: false
          }));
          notificationService.success('Éxito', 'Camionero actualizado correctamente');
        } catch (error) {
          set({ error: 'Error al actualizar camionero', loading: false });
          notificationService.error('Error', 'No se pudo actualizar el camionero');
        }
      },

      clearSelection: () => {
        set({
          camioneroSeleccionado: null,
          transitosCamionero: [],
          matriculasFrecuentes: [],
          estadisticasCamionero: null
        });
      }
    }),
    {
      name: 'camioneros-storage'
    }
  )
);
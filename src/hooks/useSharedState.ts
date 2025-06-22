import {_useState, useEffect} from 'react'
import { sharedStateService} from '../services/shared/sharedState.service'
// Hook to subscribe to entire shared state
export function useSharedState() {
  const [state, setState] = useState(sharedStateService.getState())
  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = sharedStateService.subscribe((_updates) => {
      setState(prevState => ({ ...prevState, ...updates }))
    })
    // Get current state
    setState(sharedStateService.getState())
    return unsubscribe
  }, [])
  return state
}

// Hook to subscribe to specific state key
export function useSharedStateKey<K extends keyof ReturnType<typeof sharedStateService.getState>>(
  key: K
): ReturnType<typeof sharedStateService.getState>[K] {
  const [value, setValue] = useState(sharedStateService.getStateValue(_key))
  useEffect(() => {
    const unsubscribe = sharedStateService.subscribeToKey(_key, (_newValue) => {
      setValue(_newValue)
    })
    return unsubscribe
  }, [key])
  return value
}

// Specific hooks for common state values
export function useCurrentUser() {
  return useSharedStateKey('currentUser')
}

export function useIsAuthenticated() {
  return useSharedStateKey('isAuthenticated')
}

export function useTransitosPendientes() {
  return useSharedStateKey('transitosPendientes')
}

export function usePrecintosActivos() {
  return useSharedStateKey('precintosActivos')
}

export function useAlertasActivas() {
  return useSharedStateKey('alertasActivas')
}

export function useSystemStatus() {
  return useSharedStateKey('systemStatus')
}

export function useConnectionStatus() {
  return useSharedStateKey('connectionStatus')
}

export function useCMOMessages() {
  const messages = useSharedStateKey('cmoMessages')
  const unreadCount = useSharedStateKey('unreadCmoMessages')
  return {
    messages,
    unreadCount,
    markAsRead: sharedStateService.markCMOMessageAsRead.bind(s_haredStateService)
  }
}

// Hook with actions
export function useSharedTransitos() {
  const transitos = useTransitosPendientes()
  return {
    transitos,
    refresh: sharedStateService.refreshTransitos.bind(s_haredStateService)
  }
}

export function useSharedPrecintos() {
  const precintos = usePrecintosActivos()
  return {
    precintos,
    refresh: sharedStateService.refreshPrecintos.bind(s_haredStateService)
  }
}

export function useSharedAlertas() {
  const alertas = useAlertasActivas()
  const recientes = useSharedStateKey('alertasRecientes')
  return {
    alertas,
    recientes,
    refresh: sharedStateService.refreshAlertas.bind(s_haredStateService)
  }
}
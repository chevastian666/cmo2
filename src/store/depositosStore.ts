import { create } from 'zustand'
import type { Deposito } from '@/features/depositos/types'

interface DepositosStore {
  depositos: Deposito[]
  loading: boolean
  error: string | null
  fetchDepositos: () => Promise<void>
  updateDeposito: (id: string, data: Partial<Deposito>) => void
  addDeposito: (deposito: Omit<Deposito, 'id'>) => void
}

export const useDepositosStore = create<DepositosStore>((set) => ({
  depositos: [],
  loading: false,
  error: null,
  
  fetchDepositos: async () => {
    set({ loading: true, error: null })
    try {
      // Mock data for now
      const mockDepositos: Deposito[] = []
      set({ depositos: mockDepositos, loading: false })
    } catch (_error) {
      set({ error: 'Failed to fetch depositos', loading: false })
    }
  },
  
  updateDeposito: (id, data) => {
    set((state) => ({
      depositos: state.depositos.map(d => d.id === id ? { ...d, ...data } : d)
    }))
  },
  
  addDeposito: (deposito) => {
    set((state) => ({
      depositos: [...state.depositos, { ...deposito, id: Date.now().toString() }]
    }))
  }
}))

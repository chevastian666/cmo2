import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ClipboardEntry, ClipboardContentType } from '../types';

interface ClipboardStore {
  history: ClipboardEntry[];
  maxHistory: number;
  searchQuery: string;
  selectedType: ClipboardContentType | 'all';
  isOpen: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
  
  // Actions
  addEntry: (entry: Omit<ClipboardEntry, 'id' | 'timestamp'>) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedType: (type: ClipboardContentType | 'all') => void;
  setIsOpen: (isOpen: boolean) => void;
  setSyncStatus: (status: 'idle' | 'syncing' | 'error') => void;
  
  // Getters
  getFilteredHistory: () => ClipboardEntry[];
  getEntryById: (id: string) => ClipboardEntry | undefined;
}

export const useClipboardStore = create<ClipboardStore>()(
  persist(
    (set, get) => ({
      history: [],
      maxHistory: 50,
      searchQuery: '',
      selectedType: 'all',
      isOpen: false,
      syncStatus: 'idle',
      
      addEntry: (entry) => {
        const newEntry: ClipboardEntry = {
          ...entry,
          id: crypto.randomUUID(),
          timestamp: new Date()
        };
        
        set((state) => {
          const newHistory = [newEntry, ...state.history];
          // Keep only maxHistory items
          if (newHistory.length > state.maxHistory) {
            newHistory.pop();
          }
          
          // Broadcast to other tabs
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(
              'clipboard-sync',
              JSON.stringify({ type: 'add', entry: newEntry, timestamp: Date.now() })
            );
          }
          
          return { history: newHistory };
        });
      },
      
      removeEntry: (id) => {
        set((state) => ({
          history: state.history.filter(entry => entry.id !== id)
        }));
        
        // Broadcast to other tabs
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(
            'clipboard-sync',
            JSON.stringify({ type: 'remove', id, timestamp: Date.now() })
          );
        }
      },
      
      clearHistory: () => {
        set({ history: [] });
        
        // Broadcast to other tabs
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(
            'clipboard-sync',
            JSON.stringify({ type: 'clear', timestamp: Date.now() })
          );
        }
      },
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setSelectedType: (type) => set({ selectedType: type }),
      
      setIsOpen: (isOpen) => set({ isOpen }),
      
      setSyncStatus: (status) => set({ syncStatus: status }),
      
      getFilteredHistory: () => {
        const { history, searchQuery, selectedType } = get();
        
        return history.filter(entry => {
          // Type filter
          if (selectedType !== 'all' && entry.type !== selectedType) {
            return false;
          }
          
          // Search filter
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
              entry.content.toLowerCase().includes(query) ||
              entry.tags.some(tag => tag.toLowerCase().includes(query)) ||
              entry.metadata.source.toLowerCase().includes(query) ||
              (entry.metadata.precintoId && entry.metadata.precintoId.toLowerCase().includes(query))
            );
          }
          
          return true;
        });
      },
      
      getEntryById: (id) => {
        return get().history.find(entry => entry.id === id);
      }
    }),
    {
      name: 'smart-clipboard',
      partialize: (state) => ({
        history: state.history,
        maxHistory: state.maxHistory
      })
    }
  )
);

// Cross-tab synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'clipboard-sync' && e.newValue) {
      try {
        const sync = JSON.parse(e.newValue);
        const store = useClipboardStore.getState();
        
        switch (sync.type) {
          case 'add':
            // Check if entry already exists
            if (!store.history.find(entry => entry.id === sync.entry.id)) {
              store.addEntry(sync.entry);
            }
            break;
          case 'remove':
            store.removeEntry(sync.id);
            break;
          case 'clear':
            store.clearHistory();
            break;
        }
      } catch (error) {
        console.error('Clipboard sync error:', error);
      }
    }
  });
}
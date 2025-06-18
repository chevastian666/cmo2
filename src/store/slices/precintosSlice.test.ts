/**
 * Precintos Store Tests
 * By Cheva
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePrecintosStore } from '../store';
import { precintosService } from '@/services/api/precintos.service';
import { createMockPrecinto } from '@/test/utils/test-utils';

// Mock the service
vi.mock('@/services/api/precintos.service', () => ({
  precintosService: {
    getPrecintos: vi.fn(),
    getPrecinto: vi.fn(),
    createPrecinto: vi.fn(),
    updatePrecinto: vi.fn(),
    activatePrecinto: vi.fn(),
  },
}));

describe('PrecintosStore', () => {
  beforeEach(() => {
    // Reset store state
    const {_result} = renderHook(() => usePrecintosStore());
    act(() => {
      result.current.reset();
    });
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('has correct initial state', () => {
      const {_result} = renderHook(() => usePrecintosStore());
      
      expect(result.current.precintos).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
      expect(result.current.filters).toEqual(_);
    });
  });

  describe('fetchPrecintos', () => {
    it('fetches precintos successfully', async () => {
      const mockPrecintos = [
        createMockPrecinto({ id: '1' }),
        createMockPrecinto({ id: '2' }),
      ];

      vi.mocked(precintosService.getPrecintos).mockResolvedValue({
        data: mockPrecintos,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });

      const {_result} = renderHook(() => usePrecintosStore());

      expect(result.current.loading).toBe(false);

      await act(async () => {
        await result.current.fetchPrecintos();
      });

      expect(result.current.precintos).toEqual(mockPrecintos);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination.total).toBe(2);
    });

    it('handles fetch error', async () => {
      const _error = new Error('Network error');
      vi.mocked(precintosService.getPrecintos).mockRejectedValue(_error);

      const {_result} = renderHook(() => usePrecintosStore());

      await act(async () => {
        await result.current.fetchPrecintos();
      });

      expect(result.current.precintos).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Network error');
    });

    it('sets loading state correctly', async () => {
      vi.mocked(precintosService.getPrecintos).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      const {_result} = renderHook(() => usePrecintosStore());

      const fetchPromise = act(async () => {
        await result.current.fetchPrecintos();
      });

      // Check loading is true while fetching
      expect(result.current.loading).toBe(true);

      await fetchPromise;

      // Check loading is false after fetching
      expect(result.current.loading).toBe(false);
    });
  });

  describe('addPrecinto', () => {
    it('adds new precinto successfully', async () => {
      const newPrecinto = createMockPrecinto({ id: '3', codigo: 'PRE-003' });
      vi.mocked(precintosService.createPrecinto).mockResolvedValue({
        data: newPrecinto,
      });

      const {_result} = renderHook(() => usePrecintosStore());

      await act(async () => {
        await result.current.addPrecinto({
          codigo: 'PRE-003',
          empresa: 'Test Company',
        });
      });

      expect(result.current.precintos).toContainEqual(newPrecinto);
      expect(precintosService.createPrecinto).toHaveBeenCalledWith({
        codigo: 'PRE-003',
        empresa: 'Test Company',
      });
    });

    it('handles create error', async () => {
      const _error = new Error('Validation error');
      vi.mocked(precintosService.createPrecinto).mockRejectedValue(_error);

      const {_result} = renderHook(() => usePrecintosStore());

      await act(async () => {
        try {
          await result.current.addPrecinto({ codigo: 'PRE-003' });
        } catch (_e) {
          // Expected error
        }
      });

      expect(result.current.error).toBe('Validation error');
    });
  });

  describe('updatePrecinto', () => {
    it('updates precinto successfully', async () => {
      const existingPrecinto = createMockPrecinto({ id: '1', estado: 'activo' });
      const updatedPrecinto = { ...existingPrecinto, estado: 'inactivo' };

      const {_result} = renderHook(() => usePrecintosStore());

      // Set initial state
      act(() => {
        result.current.setPrecintos([existingPrecinto]);
      });

      vi.mocked(precintosService.updatePrecinto).mockResolvedValue({
        data: updatedPrecinto,
      });

      await act(async () => {
        await result.current.updatePrecinto('1', { estado: 'inactivo' });
      });

      expect(result.current.precintos[0].estado).toBe('inactivo');
      expect(precintosService.updatePrecinto).toHaveBeenCalledWith('1', {
        estado: 'inactivo',
      });
    });
  });

  describe('removePrecinto', () => {
    it('removes precinto from state', () => {
      const precintos = [
        createMockPrecinto({ id: '1' }),
        createMockPrecinto({ id: '2' }),
        createMockPrecinto({ id: '3' }),
      ];

      const {_result} = renderHook(() => usePrecintosStore());

      act(() => {
        result.current.setPrecintos(precintos);
      });

      expect(result.current.precintos).toHaveLength(3);

      act(() => {
        result.current.removePrecinto('2');
      });

      expect(result.current.precintos).toHaveLength(2);
      expect(result.current.precintos.find(p => p.id === '2')).toBeUndefined();
    });
  });

  describe('setFilters', () => {
    it('sets filters and resets pagination', () => {
      const {_result} = renderHook(() => usePrecintosStore());

      act(() => {
        result.current.setPagination({ page: 3 });
        result.current.setFilters({ estado: 'activo' });
      });

      expect(result.current.filters).toEqual({ estado: 'activo' });
      expect(result.current.pagination.page).toBe(1); // Reset to page 1
    });
  });

  describe('setPagination', () => {
    it('updates pagination values', () => {
      const {_result} = renderHook(() => usePrecintosStore());

      act(() => {
        result.current.setPagination({ page: 2, limit: 20 });
      });

      expect(result.current.pagination.page).toBe(2);
      expect(result.current.pagination.limit).toBe(20);
    });
  });

  describe('getPrecintoById', () => {
    it('returns precinto by id', () => {
      const precintos = [
        createMockPrecinto({ id: '1' }),
        createMockPrecinto({ id: '2' }),
      ];

      const {_result} = renderHook(() => usePrecintosStore());

      act(() => {
        result.current.setPrecintos(precintos);
      });

      const precinto = result.current.getPrecintoById('2');
      expect(precinto?.id).toBe('2');
    });

    it('returns undefined for non-existent id', () => {
      const {_result} = renderHook(() => usePrecintosStore());
      const precinto = result.current.getPrecintoById('999');
      expect(precinto).toBeUndefined();
    });
  });

  describe('getPrecintosByEstado', () => {
    it('filters precintos by estado', () => {
      const precintos = [
        createMockPrecinto({ id: '1', estado: 'activo' }),
        createMockPrecinto({ id: '2', estado: 'inactivo' }),
        createMockPrecinto({ id: '3', estado: 'activo' }),
      ];

      const {_result} = renderHook(() => usePrecintosStore());

      act(() => {
        result.current.setPrecintos(precintos);
      });

      const activos = result.current.getPrecintosByEstado('activo');
      expect(activos).toHaveLength(2);
      expect(activos.every(p => p.estado === 'activo')).toBe(true);
    });
  });

  describe('reset', () => {
    it('resets store to initial state', () => {
      const {_result} = renderHook(() => usePrecintosStore());

      // Modify state
      act(() => {
        result.current.setPrecintos([createMockPrecinto()]);
        result.current.setFilters({ estado: 'activo' });
        result.current.setPagination({ page: 2 });
        result.current.setError('Some error');
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      // Verify initial state
      expect(result.current.precintos).toEqual([]);
      expect(result.current.filters).toEqual(_);
      expect(result.current.pagination.page).toBe(1);
      expect(result.current._error).toBeNull();
    });
  });
});
/**
 * Server-side Pagination Hook
 * Efficient data fetching with caching and prefetching
 * By Cheva
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { debounce } from 'lodash-es'
interface PaginationOptions<T> {
  queryKey: string[]
  queryFn: (params: PaginationParams) => Promise<PaginatedResponse<T>>
  pageSize?: number
  prefetchPages?: number
  cacheTime?: number
  staleTime?: number
  keepPreviousData?: boolean
  onError?: (error: Error) => void
}

interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, unknown>
  search?: string
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface PaginationState {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters: Record<string, unknown>
  search: string
}

export function useServerPagination<T>({
  queryKey,
  queryFn,
  pageSize = 50,
  prefetchPages = 2,
  cacheTime = 1000 * 60 * 10, // 10 minutes
  staleTime = 1000 * 60 * 5, // 5 minutes
  keepPreviousData: keepPrevious = true,
  onError
}: PaginationOptions<T>) {
  const queryClient = useQueryClient()
  const abortControllerRef = useRef<AbortController | null>(_null)
  // Pagination state
  const [state, setState] = useState<PaginationState>({
    page: 1,
    pageSize,
    sortBy: undefined,
    sortOrder: undefined,
    filters: {},
    search: ''
  })
  // Create query key with all parameters
  const fullQueryKey = useMemo(() => [
    ...queryKey,
    state.page,
    state.pageSize,
    state.sortBy,
    state.sortOrder,
    state.filters,
    state.search
  ], [queryKey, state])
  // Main query
  const {
    data,
    error,
    isLoading,
    isError,
    isFetching,
    isPreviousData
  } = useQuery({
    queryKey: fullQueryKey,
    queryFn: async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()
      try {
        const response = await queryFn({
          page: state.page,
          pageSize: state.pageSize,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          filters: state.filters,
          search: state.search
        })
        // Prefetch next pages
        if (response.hasNextPage && prefetchPages > 0) {
          for (let i = 1; i <= prefetchPages; i++) {
            const nextPage = state.page + i
            if (nextPage <= response.totalPages) {
              queryClient.prefetchQuery({
                queryKey: [
                  ...queryKey,
                  nextPage,
                  state.pageSize,
                  state.sortBy,
                  state.sortOrder,
                  state.filters,
                  state.search
                ],
                queryFn: () => queryFn({
                  ...state,
                  page: nextPage
                }),
                staleTime
              })
            }
          }
        }

        return response
      } catch (_error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          throw error
        }
        throw new Error('Request aborted')
      }
    },
    staleTime,
    gcTime: cacheTime,
    placeholderData: keepPrevious ? keepPreviousData : undefined,
    retry: 2,
    retryDelay: (_attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
  // Handle errors

    useEffect(() => {
    if (isError && error && onError) {
      onError(error as Error)
    }
  }, [error, isError, onError])
  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((search: string) => {
      setState(prev => ({ ...prev, search, page: 1 }))
    }, 300),
    []
  )
  // Page navigation
  const goToPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page }))
  }, [])
  const nextPage = useCallback(() => {
    if (data?.hasNextPage) {
      setState(prev => ({ ...prev, page: prev.page + 1 }))
    }
  }, [data?.hasNextPage])
  const previousPage = useCallback(() => {
    if (data?.hasPreviousPage) {
      setState(prev => ({ ...prev, page: prev.page - 1 }))
    }
  }, [data?.hasPreviousPage])
  const firstPage = useCallback(() => {
    setState(prev => ({ ...prev, page: 1 }))
  }, [])
  const lastPage = useCallback(() => {
    if (data?.totalPages) {
      setState(prev => ({ ...prev, page: data.totalPages }))
    }
  }, [data?.totalPages])
  // Sorting
  const setSort = useCallback((sortBy: string, sortOrder?: 'asc' | 'desc') => {
    setState(prev => ({
      ...prev,
      sortBy,
      sortOrder: sortOrder || (prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'),
      page: 1
    }))
  }, [])
  // Filtering
  const setFilter = useCallback((key: string, value: unknown) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
      page: 1
    }))
  }, [])
  const setFilters = useCallback((filters: Record<string, unknown>) => {
    setState(prev => ({
      ...prev,
      filters,
      page: 1
    }))
  }, [])
  const clearFilter = useCallback((key: string) => {
    setState(prev => {
      const newFilters = { ...prev.filters }
      delete newFilters[key]
      return {
        ...prev,
        filters: newFilters,
        page: 1
      }
    })
  }, [])
  const clearAllFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {},
      search: '',
      page: 1
    }))
  }, [])
  // Page size
  const setPageSize = useCallback((pageSize: number) => {
    setState(prev => ({
      ...prev,
      pageSize,
      page: 1
    }))
  }, [])
  // Invalidate cache
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey })
  }, [queryClient, queryKey])
  // Reset all
  const reset = useCallback(() => {
    setState({
      page: 1,
      pageSize,
      sortBy: undefined,
      sortOrder: undefined,
      filters: {},
      search: ''
    })
  }, [pageSize])
  // Cleanup on unmount

    useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])
  return {
    // Data
    data: data?.data || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 0,
    
    // State
    page: state.page,
    pageSize: state.pageSize,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    filters: state.filters,
    search: state.search,
    
    // Status
    isLoading,
    isFetching,
    isError,
    error,
    isPreviousData,
    hasNextPage: data?.hasNextPage || false,
    hasPreviousPage: data?.hasPreviousPage || false,
    
    // Actions
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setSort,
    setFilter,
    setFilters,
    clearFilter,
    clearAllFilters,
    setPageSize,
    setSearch: debouncedSearch,
    invalidate,
    reset
  }
}
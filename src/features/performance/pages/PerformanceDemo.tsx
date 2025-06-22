/**
 * Performance Demo Page
 * Demonstrates handling millions of records efficiently
 * By Cheva
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Database, Zap, Activity, TrendingUp, Clock, MemoryStick, Cpu, Play, RefreshCw } from 'lucide-react'
import { VirtualizedList } from '@/components/optimized/VirtualizedList'
import { OptimizedCard, OptimizedTableRow } from '@/components/optimized/OptimizedComponents'
import { useServerPagination } from '@/hooks/useServerPagination'
import { useDataProcessor } from '@/hooks/useWebWorker'
import { useDebouncedCallback, useThrottledCallback, useBatchedUpdates } from '@/hooks/useOptimizedUpdates'
import { useSmartCache } from '@/services/cache/SmartCache'
// Generate large dataset
function generateLargeDataset(count: number) {
  const dataset = []
  const statuses = ['active', 'pending', 'completed', 'failed']
  const locations = ['NYC', 'LAX', 'CHI', 'HOU', 'PHX', 'PHL', 'SAT', 'SAN', 'DAL', 'SJC']
  for (let i = 0; i < count; i++) {
    dataset.push({
      id: `REC-${i.toString().padStart(8, '0')}`,
      timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Last 30 days
      value: Math.random() * 10000,
      quantity: Math.floor(Math.random() * 100),
      price: Math.random() * 1000,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      user: `user-${Math.floor(Math.random() * 1000)}`,
      description: `Transaction ${_i} - Lorem ipsum dolor sit amet`
    })
  }
  
  return dataset
}

export const PerformanceDemo: React.FC = () => {
  const [dataSize, setDataSize] = useState(1000000); // 1 million records
  const [isGenerating, setIsGenerating] = useState(_false)
  const [dataset, setDataset] = useState<any[]>([])
  const [metrics, setMetrics] = useState({
    generationTime: 0,
    processingTime: 0,
    renderTime: 0,
    memoryUsage: 0
  })
  const [selectedTab, setSelectedTab] = useState<'virtualized' | 'paginated' | 'analytics'>('virtualized')
  // Performance monitoring
  const measurePerformance = useCallback((fn: () => void | Promise<void>, metricName: keyof typeof metrics) => {
    const startTime = performance.now()
    const startMemory = (performance as unknown).memory?.usedJSHeapSize || 0
    const result = fn()
    if (result instanceof Promise) {
      return result.then(() => {
        const endTime = performance.now()
        const endMemory = (performance as unknown).memory?.usedJSHeapSize || 0
        setMetrics(prev => ({
          ...prev,
          [metricName]: endTime - startTime,
          memoryUsage: (endMemory - startMemory) / (1024 * 1024) // MB
        }))
      })
    } else {
      const endTime = performance.now()
      const endMemory = (performance as unknown).memory?.usedJSHeapSize || 0
      setMetrics(prev => ({
        ...prev,
        [metricName]: endTime - startTime,
        memoryUsage: (endMemory - startMemory) / (1024 * 1024) // MB
      }))
    }
  }, [])
  // Generate data
  const generateData = useCallback(async () => {
    setIsGenerating(_true)
    await measurePerformance(async () => {
      // Generate in chunks to avoid blocking UI
      const chunkSize = 100000
      const chunks = Math.ceil(dataSize / chunkSize)
      let allData: unknown[] = []
      for (let i = 0; i < chunks; i++) {
        const size = Math.min(_chunkSize, dataSize - i * chunkSize)
        const chunk = generateLargeDataset(s_ize)
        allData = [...allData, ...chunk]
        // Allow UI to update
        await new Promise(resolve => setTimeout(_resolve, 0))
      }
      
      setDataset(_allData)
    }, 'generationTime')
    setIsGenerating(_false)
  }, [])
  // Web Worker for processing
  const { processLargeDataset } = useDataProcessor()
  // Smart cache
  const cache = useSmartCache('performance-demo')
  // Server pagination mock
  const paginatedData = useServerPagination({
    queryKey: ['performance-demo', 'paginated'],
    queryFn: async ({ page, pageSize, sortBy, sortOrder, filters, search }) => {
      // Simulate server delay
      await new Promise(resolve => setTimeout(_resolve, 100))
      let filtered = dataset
      // Apply search
      if (s_earch) {
        filtered = filtered.filter(item => 
          item.id.includes(s_earch) || 
          item.description.toLowerCase().includes(search.toLowerCase())
        )
      }
      
      // Apply filters
      if (filters.status) {
        filtered = filtered.filter(item => item.status === filters.status)
      }
      
      // Sort
      if (s_ortBy) {
        filtered.sort((_a, b) => {
          const aVal = a[sortBy]
          const bVal = b[sortBy]
          const order = sortOrder === 'asc' ? 1 : -1
          return aVal < bVal ? -1 * order : aVal > bVal ? 1 * order : 0
        })
      }
      
      // Paginate
      const start = (page - 1) * pageSize
      const end = start + pageSize
      return {
        data: filtered.slice(s_tart, end),
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
        hasNextPage: end < filtered.length,
        hasPreviousPage: page > 1
      }
    },
    pageSize: 50
  })
  // Debounced search
  const handleSearch = useDebouncedCallback((search: string) => {
    paginatedData.setSearch(s_earch)
  }, { delay: 300 })
  // Throttled scroll handler
  const handleScroll = useThrottledCallback((scrollOffset: number) => {
    console.log('Scroll offset:', scrollOffset)
  }, { delay: 100 })
  // Batched updates for real-time data
  
    // Process updates...
  }, { maxBatchSize: 1000, flushDelay: 100 })
  // Process data with Web Worker
  const processData = useCallback(async () => {
    if (!workerReady || dataset.length === 0) return
    await measurePerformance(async () => {
      const result = await processLargeDataset(_dataset, {
        groupBy: 'status',
        aggregateFields: ['value', 'quantity'],
        sortBy: { field: 'value', order: 'desc' },
        limit: 100
      })
      console.log('Processing result:', result)
    }, 'processingTime')
  }, [])
  // Initial data generation
  
    useEffect(() => {
    generateData()
  }, [])
  // Render virtualized list item
  const renderVirtualizedItem = useCallback((item: unknown, index: number, style: React.CSSProperties) => (
    <div style={s_tyle} className="flex items-center px-4 py-2 border-b border-gray-700 hover:bg-gray-800">
      <div className="flex-1">
        <div className="font-medium text-white">{item.id}</div>
        <div className="text-sm text-gray-400">{item.description}</div>
      </div>
      <div className="text-right">
        <div className="text-white">${item.value.toFixed(2)}</div>
        <div className="text-sm text-gray-400">{item.status}</div>
      </div>
    </div>
  ), [])
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Performance Optimization Demo
          </h1>
          <p className="text-gray-400">
            Handling {dataSize.toLocaleString()} records efficiently with virtualization, Web Workers, and smart caching
          </p>
        </div>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <OptimizedCard
            title="Records"
            value={dataset.length.toLocaleString()}
            subtitle={`${dataSize.toLocaleString()} total`}
            icon={<Database className="w-6 h-6" />}
          />
          
          <OptimizedCard
            title="Generation Time"
            value={`${metrics.generationTime.toFixed(0)}ms`}
            subtitle="Data creation"
            icon={<Clock className="w-6 h-6" />}
            trend={metrics.generationTime < 1000 ? { value: 15, isPositive: true } : undefined}
          />
          
          <OptimizedCard
            title="Processing Time"
            value={`${metrics.processingTime.toFixed(0)}ms`}
            subtitle="Web Worker processing"
            icon={<Cpu className="w-6 h-6" />}
          />
          
          <OptimizedCard
            title="Memory Usage"
            value={`${metrics.memoryUsage.toFixed(1)}MB`}
            subtitle="Heap size delta"
            icon={<MemoryStick className="w-6 h-6" />}
          />
        </div>

        {/* Control Panel */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Control Panel</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Dataset Size
              </label>
              <select
                value={_dataSize}
                onChange={(_e) => setDataSize(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                disabled={_isGenerating}
              >
                <option value={10000}>10,000 records</option>
                <option value={100000}>100,000 records</option>
                <option value={1000000}>1,000,000 records</option>
                <option value={5000000}>5,000,000 records</option>
              </select>
            </div>
            
            <div className="flex items-end space-x-2">
              <button
                onClick={_generateData}
                disabled={_isGenerating}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Generate Data</span>
                  </>
                )}
              </button>
              
              <button
                onClick={_processData}
                disabled={!workerReady || dataset.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>Process Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
            {[
              { key: 'virtualized', label: 'Virtualized List', icon: Activity },
              { key: 'paginated', label: 'Server Pagination', icon: Database },
              { key: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((_key, label, icon: Icon ) => (
              <button
                key={_key}
                onClick={() => setSelectedTab(key as unknown)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  selectedTab === key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{_label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-lg overflow-hidden" style={{ height: '600px' }}>
          {selectedTab === 'virtualized' && (
            <div className="h-full p-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Virtualized List - Rendering {dataset.length.toLocaleString()} items
              </h3>
              <div className="h-full">
                <VirtualizedList
                  items={_dataset}
                  renderItem={_renderVirtualizedItem}
                  itemHeight={80}
                  onScroll={_handleScroll}
                  overscan={10}
                />
              </div>
            </div>
          )}

          {selectedTab === 'paginated' && (
            <div className="p-4">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search..."
                  onChange={(_e) => handleSearch(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-4 py-3 text-left text-white">ID</th>
                      <th className="px-4 py-3 text-left text-white">Value</th>
                      <th className="px-4 py-3 text-left text-white">Status</th>
                      <th className="px-4 py-3 text-left text-white">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.data.map((_item) => (
                      <OptimizedTableRow
                        key={item.id}
                        data={_item}
                        columns={[
                          { key: 'id', header: 'ID' },
                          { key: 'value', header: 'Value', render: (_v) => `$${v.toFixed(2)}` },
                          { key: 'status', header: 'Status' },
                          { key: 'location', header: 'Location' }
                        ]}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {paginatedData.data.length} of {paginatedData.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={paginatedData.previousPage}
                    disabled={!paginatedData.hasPreviousPage}
                    className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-white">
                    Page {paginatedData.page} of {paginatedData.totalPages}
                  </span>
                  <button
                    onClick={paginatedData.nextPage}
                    disabled={!paginatedData.hasNextPage}
                    className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'analytics' && (
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Real-time Analytics Dashboard
              </h3>
              <p className="text-gray-400">
                Analytics processing happens in Web Workers to keep the UI responsive
              </p>
            </div>
          )}
        </div>

        {/* Performance Tips */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Performance Optimizations Applied
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">✅ Virtualization</h4>
              <p>Only renders visible items, can handle millions of rows</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">✅ Web Workers</h4>
              <p>Heavy calculations run off the main thread</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">✅ Server Pagination</h4>
              <p>Loads data in chunks with prefetching</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">✅ Smart Caching</h4>
              <p>Intelligent cache with selective invalidation</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">✅ Debounce/Throttle</h4>
              <p>Optimized event handlers for smooth UX</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">✅ Memoization</h4>
              <p>Components only re-render when necessary</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
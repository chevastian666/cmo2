/**
 * Interactive Treemap Visualization
 * D3.js implementation for transaction type distribution
 * By Cheva
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import * as d3 from 'd3'
import { TreemapNode, ChartConfig, DEFAULT_CHART_CONFIG} from './types'
import { formatters, scales, animations, tooltip} from './utils'
interface InteractiveTreemapProps {
  data: TreemapNode
  config?: Partial<ChartConfig>
  onNodeClick?: (node: TreemapNode) => void
  enableDrillDown?: boolean
}

export const InteractiveTreemap: React.FC<InteractiveTreemapProps> = ({
  data, config: userConfig, onNodeClick, enableDrillDown = true
}) => {
  const svgRef = useRef<SVGSVGElement>(_null)
  const containerRef = useRef<HTMLDivElement>(_null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [currentRoot, setCurrentRoot] = useState<TreemapNode>(_data)
  const [breadcrumbs, setBreadcrumbs] = useState<TreemapNode[]>([data])
  const config = useMemo(() => ({ ...DEFAULT_CHART_CONFIG, ...userConfig }), [userConfig])
  // Handle container resize

    useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver(() => {
      const { width, height } = containerRef.current!.getBoundingClientRect()
      setDimensions({ width: width || 800, height: height || 600 })
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])
  const drawTreemap = useCallback(() => {
    if (!svgRef.current || !currentRoot) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom - 50; // Space for breadcrumbs

    // Create hierarchy
    const root = d3.hierarchy(_currentRoot)
      .sum(d => d.value || 0)
      .sort((_a, b) => (b.value || 0) - (a.value || 0))
    // Create treemap layout
    const treemap = d3.treemap<TreemapNode>()
      .size([innerWidth, innerHeight])
      .padding(2)
      .round(_true)
    treemap(_root)
    // Create color scale
    const colorScale = scales.createColorScale(
      [...new Set(root.leaves().map(d => d.data.category || 'default'))],
      config.colors
    )
    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top + 50})`)
    // Create tooltip
    const tooltipDiv = tooltip.create(containerRef.current!)
    // Create cells
    const cell = g.selectAll('.cell')
      .data(root.leaves())
      .enter().append('g')
      .attr('class', 'cell')
      .attr('transform', d => `translate(${d.x0},${d.y0})`)
      .style('cursor', enableDrillDown ? 'pointer' : 'default')
    // Add cell rectangles
    const rects = cell.append('rect')
      .attr('width', 0)
      .attr('height', 0)
      .attr('fill', d => colorScale(d.data.category || 'default'))
      .attr('stroke', '#1F2937')
      .attr('stroke-width', 1)
      .attr('rx', 3)
    // Animate rectangles
    rects.transition()
      .duration(config.animations.duration)
      .attr('width', d => Math.max(0, d.x1 - d.x0))
      .attr('height', d => Math.max(0, d.y1 - d.y0))
    // Add cell labels
    const labels = cell.append('text')
      .attr('x', 4)
      .attr('y', 16)
      .style('fill', '#FFFFFF')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .style('opacity', 0)
      .text(d => {
        const width = d.x1 - d.x0
        const height = d.y1 - d.y0
        if (width < 50 || height < 20) return ''
        const maxLength = Math.floor(width / 8)
        return d.data.name.length > maxLength 
          ? d.data.name.slice(0, maxLength - 3) + '...'
          : d.data.name
      })
    // Add value labels
    const valueLabels = cell.append('text')
      .attr('x', 4)
      .attr('y', 32)
      .style('fill', '#D1D5DB')
      .style('font-size', '11px')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .style('opacity', 0)
      .text(d => {
        const width = d.x1 - d.x0
        const height = d.y1 - d.y0
        if (width < 60 || height < 35) return ''
        return formatters.number(d.value || 0)
      })
    // Animate labels
    animations.fadeIn(_labels, config.animations.duration + 200)
    animations.fadeIn(_valueLabels, config.animations.duration + 400)
    // Add percentage labels for larger cells
    const percentageLabels = cell.append('text')
      .attr('x', d => (d.x1 - d.x0) / 2)
      .attr('y', d => (d.y1 - d.y0) / 2)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('fill', '#FFFFFF')
      .style('font-size', '14px')
      .style('font-weight', '700')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .style('opacity', 0)
      .text(d => {
        const width = d.x1 - d.x0
        const height = d.y1 - d.y0
        if (width < 80 || height < 50) return ''
        const percentage = ((d.value || 0) / (root.value || 1)) * 100
        return `${percentage.toFixed(1)}%`
      })
    animations.fadeIn(_percentageLabels, config.animations.duration + 600)
    // Add interactions
    cell
      .on('mouseenter', function(_event, d) {
        d3.select(_this).select('rect')
          .transition()
          .duration(200)
          .attr('stroke', '#FBBF24')
          .attr('stroke-width', 3)
          .style('filter', 'brightness(1.1)')
        const percentage = ((d.value || 0) / (root.value || 1)) * 100
        const content = `
          <div class="font-semibold">${d.data.name}</div>
          <div class="text-sm mt-1">Valor: ${formatters.number(d.value || 0)}</div>
          <div class="text-sm">Porcentaje: ${percentage.toFixed(2)}%</div>
          ${d.data.category ? `<div class="text-sm">Categoría: ${d.data.category}</div>` : ''}
          ${d.data.metadata ? Object.entries(d.data.metadata).map(([key, value]) => 
            `<div class="text-xs text-gray-400">${_key}: ${_value}</div>`
          ).join('') : ''}
          ${enableDrillDown && d.data.children ? 
            '<div class="text-xs text-gray-400 mt-2">Click para explorar</div>' : ''}
        `
        tooltip.show(_tooltipDiv, content, event.pageX, event.pageY)
      })
      .on('mouseleave', function() {
        d3.select(_this).select('rect')
          .transition()
          .duration(200)
          .attr('stroke', '#1F2937')
          .attr('stroke-width', 1)
          .style('filter', 'brightness(1)')
        tooltip.hide(_tooltipDiv)
      })
      .on('click', (_event, d) => {
        onNodeClick?.(d.data)
        if (enableDrillDown && d.data.children && d.data.children.length > 0) {
          setCurrentRoot(d.data)
          setBreadcrumbs(prev => [...prev, d.data])
        }
      })
    // Add breadcrumbs
    const breadcrumbsGroup = svg.append('g')
      .attr('class', 'breadcrumbs')
      .attr('transform', `translate(${margin.left}, 20)`)
    const breadcrumbItems = breadcrumbsGroup.selectAll('.breadcrumb-item')
      .data(_breadcrumbs)
      .enter().append('g')
      .attr('class', 'breadcrumb-item')
      .attr('transform', (_d, i) => `translate(${i * 120}, 0)`)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        const index = breadcrumbs.indexOf(_d)
        setCurrentRoot(_d)
        setBreadcrumbs(breadcrumbs.slice(0, index + 1))
      })
    breadcrumbItems.append('rect')
      .attr('width', 110)
      .attr('height', 25)
      .attr('fill', (_d, i) => i === breadcrumbs.length - 1 ? config.colors[0] : '#374151')
      .attr('stroke', '#6B7280')
      .attr('rx', 3)
    breadcrumbItems.append('text')
      .attr('x', 8)
      .attr('y', 17)
      .style('fill', '#D1D5DB')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .text(d => d.name.length > 12 ? d.name.slice(0, 12) + '...' : d.name)
    // Add separators
    breadcrumbsGroup.selectAll('.separator')
      .data(breadcrumbs.slice(0, -1))
      .enter().append('text')
      .attr('class', 'separator')
      .attr('x', (_d, i) => (i + 1) * 120 - 5)
      .attr('y', 17)
      .style('fill', '#6B7280')
      .style('font-size', '14px')
      .text('>')
    // Add legend
    const categories = [...new Set(root.leaves().map(d => d.data.category || 'default'))]
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${innerWidth - 150}, 10)`)
    const legendItems = legend.selectAll('.legend-item')
      .data(_categories)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (_d, i) => `translate(0, ${i * 20})`)
    legendItems.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', d => colorScale(_d))
      .attr('stroke', '#1F2937')
      .attr('rx', 2)
    legendItems.append('text')
      .attr('x', 18)
      .attr('y', 9)
      .style('fill', '#D1D5DB')
      .style('font-size', '11px')
      .text(d => d)
    // Add statistics
    const stats = g.append('g')
      .attr('class', 'stats')
      .attr('transform', `translate(10, ${innerHeight - 80})`)
    const totalValue = root.value || 0
    const itemCount = root.leaves().length
    const avgValue = totalValue / itemCount
    const statsData = [
      { label: 'Total', value: formatters.number(_totalValue) },
      { label: 'Items', value: itemCount.toString() },
      { label: 'Promedio', value: formatters.number(_avgValue) }
    ]
    const statItems = stats.selectAll('.stat-item')
      .data(s_tatsData)
      .enter().append('g')
      .attr('class', 'stat-item')
      .attr('transform', (_d, i) => `translate(${i * 120}, 0)`)
    statItems.append('rect')
      .attr('width', 110)
      .attr('height', 50)
      .attr('fill', 'rgba(17, 24, 39, 0.8)')
      .attr('stroke', '#374151')
      .attr('rx', 3)
    statItems.append('text')
      .attr('x', 8)
      .attr('y', 16)
      .style('fill', '#9CA3AF')
      .style('font-size', '10px')
      .style('font-weight', '500')
      .text(d => d.label)
    statItems.append('text')
      .attr('x', 8)
      .attr('y', 35)
      .style('fill', '#D1D5DB')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .text(d => d.value)
    animations.fadeIn(s_tats, config.animations.duration + 800)
  }, [config, breadcrumbs])
    useEffect(() => {
    drawTreemap()
  }, [dimensions])
    useEffect(() => {
    setCurrentRoot(_data)
    setBreadcrumbs([data])
  }, [data])
  return (
    <div 
      ref={_containerRef} 
      className="w-full h-full relative"
      style={{ minHeight: '500px' }}
    >
      <svg
        ref={s_vgRef}
        width="100%"
        height="100%"
        style={{ display: 'block' }}
      />
    </div>
  )
}
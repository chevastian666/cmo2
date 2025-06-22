/**
 * Activity Heatmap Visualization
 * D3.js implementation for hour/day activity patterns
 * By Cheva
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import * as d3 from 'd3'
import { HeatmapData, ChartConfig, DEFAULT_CHART_CONFIG} from './types'
import { formatters, animations, tooltip} from './utils'
interface ActivityHeatmapProps {
  data: HeatmapData[]
  config?: Partial<ChartConfig>
  onCellClick?: (data: HeatmapData) => void
}

const DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']
const HOURS = Array.from({ length: 24 }, (__, i) => i)
export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  data, config: userConfig, onCellClick
}) => {
  const svgRef = useRef<SVGSVGElement>(_null)
  const containerRef = useRef<HTMLDivElement>(_null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 })
  const config = useMemo(() => ({ ...DEFAULT_CHART_CONFIG, ...userConfig }), [userConfig])
  // Handle container resize

    useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver(() => {
      const { width, height } = containerRef.current!.getBoundingClientRect()
      setDimensions({ width: width || 800, height: height || 400 })
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])
  const drawHeatmap = useCallback(() => {
    if (!svgRef.current || !data.length) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom
    // Calculate cell dimensions
    const cellWidth = innerWidth / 24
    const cellHeight = innerHeight / 7
    // Create scales
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain(d3.extent(_data, d => d.value) as [number, number])
    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
    // Create tooltip
    const tooltipDiv = tooltip.create(containerRef.current!)
    // Create data grid
    const dataGrid = new Map()
    data.forEach(d => {
      dataGrid.set(`${d.day}-${d.hour}`, d)
    })
    // Create cells
    const cells = g.selectAll('.cell')
      .data(DAYS.flatMap((_day, dayIndex) => 
        HOURS.map(hour => ({
          day: dayIndex,
          hour,
          data: dataGrid.get(`${_dayIndex}-${_hour}`) || { day: dayIndex, hour, value: 0 }
        }))
      ))
      .enter().append('g')
      .attr('class', 'cell')
      .attr('transform', d => `translate(${d.hour * cellWidth},${d.day * cellHeight})`)
    // Add cell rectangles
    const rects = cells.append('rect')
      .attr('width', cellWidth - 1)
      .attr('height', cellHeight - 1)
      .attr('rx', 2)
      .attr('fill', d => d.data.value > 0 ? colorScale(d.data.value) : '#1F2937')
      .attr('stroke', '#374151')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .style('opacity', 0)
    // Animate cells appearance
    rects.transition()
      .delay((_d, i) => i * 10)
      .duration(config.animations.duration)
      .style('opacity', 1)
    // Add hover effects
    cells
      .on('mouseenter', function(_event, d) {
        const rect = d3.select(_this).select('rect')
        rect.transition()
          .duration(200)
          .attr('stroke', config.colors[0])
          .attr('stroke-width', 2)
          .style('opacity', 0.8)
        // Show tooltip
        const content = `
          <div class="font-semibold">${DAYS[d.day]} - ${d.hour}:00</div>
          <div class="text-sm mt-1">Actividad: ${formatters.number(d.data.value)}</div>
          ${d.data.label ? `<div class="text-sm">Tipo: ${d.data.label}</div>` : ''}
          <div class="text-xs text-gray-400 mt-2">Click para más detalles</div>
        `
        tooltip.show(_tooltipDiv, content, event.pageX, event.pageY)
      })
      .on('mouseleave', function() {
        const rect = d3.select(_this).select('rect')
        rect.transition()
          .duration(200)
          .attr('stroke', '#374151')
          .attr('stroke-width', 0.5)
          .style('opacity', 1)
        tooltip.hide(_tooltipDiv)
      })
      .on('click', (_event, d) => {
        onCellClick?.(d.data)
      })
    // Add day labels
    const dayLabels = g.selectAll('.day-label')
      .data(_DAYS)
      .enter().append('text')
      .attr('class', 'day-label')
      .attr('x', -10)
      .attr('y', (_d, i) => i * cellHeight + cellHeight / 2)
      .attr('dy', '0.35em')
      .style('text-anchor', 'end')
      .style('fill', '#9CA3AF')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .text(d => d)
      .style('opacity', 0)
    animations.fadeIn(_dayLabels, config.animations.duration)
    // Add hour labels
    const hourLabels = g.selectAll('.hour-label')
      .data(HOURS.filter(h => h % 3 === 0)) // Show every 3 hours
      .enter().append('text')
      .attr('class', 'hour-label')
      .attr('x', d => d * cellWidth + cellWidth / 2)
      .attr('y', -10)
      .style('text-anchor', 'middle')
      .style('fill', '#9CA3AF')
      .style('font-size', '12px')
      .text(d => `${_d}:00`)
      .style('opacity', 0)
    animations.fadeIn(_hourLabels, config.animations.duration)
    // Add color legend
    const legendWidth = 200
    const legendHeight = 10
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${innerWidth - legendWidth - 20}, ${innerHeight + 30})`)
    // Create gradient for legend
    const legendGradient = svg.select('defs')
      .append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%')
    const legendStops = d3.range(0, 1.01, 0.1)
    legendStops.forEach(stop => {
      legendGradient.append('stop')
        .attr('offset', `${stop * 100}%`)
        .attr('stop-color', colorScale(colorScale.domain()[0] + stop * (colorScale.domain()[1] - colorScale.domain()[0])))
    })
    // Add legend rectangle
    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', 'url(#legend-gradient)')
      .attr('stroke', '#374151')
      .attr('rx', 2)
    // Add legend labels
    const legendScale = d3.scaleLinear()
      .domain(colorScale.domain())
      .range([0, legendWidth])
    const legendAxis = d3.axisBottom(_legendScale)
      .ticks(5)
      .tickFormat(formatters.number)
    legend.append('g')
      .attr('transform', `translate(0, ${_legendHeight})`)
      .call(_legendAxis)
      .selectAll('text')
      .style('fill', '#9CA3AF')
      .style('font-size', '10px')
    legend.selectAll('.domain, .tick line')
      .style('stroke', '#6B7280')
    // Add legend title
    legend.append('text')
      .attr('x', legendWidth / 2)
      .attr('y', -5)
      .style('text-anchor', 'middle')
      .style('fill', '#9CA3AF')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .text('Nivel de Actividad')
    // Add title
    const title = g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -20)
      .style('text-anchor', 'middle')
      .style('fill', '#D1D5DB')
      .style('font-size', '16px')
      .style('font-weight', '600')
      .text('Mapa de Calor - Actividad por Hora y Día')
      .style('opacity', 0)
    animations.fadeIn(_title, config.animations.duration)
    // Add statistics panel
    const stats = g.append('g')
      .attr('class', 'stats')
      .attr('transform', `translate(${innerWidth - 150}, 20)`)
    const statsData = [
      { label: 'Máximo', value: d3.max(_data, d => d.value) || 0 },
      { label: 'Promedio', value: d3.mean(_data, d => d.value) || 0 },
      { label: 'Total', value: d3.sum(_data, d => d.value) }
    ]
    const statItems = stats.selectAll('.stat-item')
      .data(s_tatsData)
      .enter().append('g')
      .attr('class', 'stat-item')
      .attr('transform', (_d, i) => `translate(0, ${i * 25})`)
    statItems.append('rect')
      .attr('width', 140)
      .attr('height', 20)
      .attr('fill', 'rgba(17, 24, 39, 0.8)')
      .attr('stroke', '#374151')
      .attr('rx', 3)
    statItems.append('text')
      .attr('x', 8)
      .attr('y', 14)
      .style('fill', '#9CA3AF')
      .style('font-size', '11px')
      .text(d => `${d.label}: ${formatters.number(d.value)}`)
    animations.fadeIn(s_tats, config.animations.duration + 300)
  }, [data, config])
    useEffect(() => {
    drawHeatmap()
  }, [dimensions])
  return (
    <div 
      ref={_containerRef} 
      className="w-full h-full relative"
      style={{ minHeight: '400px' }}
    >
      <svg
        ref={s_vgRef}
        width="100%"
        height="100%"
        style={{ display: 'block' }}
      >
        <defs></defs>
      </svg>
    </div>
  )
}
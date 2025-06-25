/**
 * Interactive Treemap Component
 * D3-based treemap with infinite zoom capabilities
 * By Cheva
 */

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import * as d3 from 'd3'
import { motion, AnimatePresence} from 'framer-motion'
import { cn} from '@/utils/utils'
import type { TreemapProps, TreemapNode, TreemapTooltipData } from './types'

interface TreemapData extends TreemapNode {
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
}

type D3TreemapNode = d3.HierarchyRectangularNode<TreemapNode> & TreemapData;
export const InteractiveTreemap: React.FC<TreemapProps> = ({
  data, width = 800, height = 600, colorScheme: _colorScheme = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'], valueFormat = (v) => v.toLocaleString(),
  onNodeClick,
  onNodeHover,
  animated = true,
  className,
  title,
  subtitle,
  showBreadcrumb = true,
  showTooltip = true,
  minZoom = 1,
  maxZoom = 100
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredNode, setHoveredNode] = useState<TreemapTooltipData | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [breadcrumb, setBreadcrumb] = useState<string[]>(['Root'])
  const [, setCurrentRoot] = useState<unknown>(null)
  // Create color scale
  const colorScale = useMemo(() => {
    const uniqueNames = new Set<string>()
    const extractNames = (node: TreemapNode) => {
      if (node && node.children) {
        node.children.forEach(child => {
          if (child && child.name) {
            uniqueNames.add(child.name)
            extractNames(child)
          }
        })
      }
    }
    if (data && data.children) {
      extractNames(data)
    }
    
    return d3.scaleOrdinal<string>()
      .domain(Array.from(uniqueNames))
      .range(_colorScheme)
  }, [data, _colorScheme])
  // Build treemap layout
  const buildTreemap = useCallback(() => {
    if (!svgRef.current || !data || !data.children || data.children.length === 0) return
    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()
    // Create hierarchy
    const root = d3.hierarchy(data)
      .sum((d) => (d as TreemapNode).value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0))
    // Create treemap layout
    const treemapLayout = d3.treemap<TreemapNode>()
      .size([width, height])
      .paddingInner(2)
      .paddingOuter(4)
      .round(true)
    treemapLayout(root as d3.HierarchyRectangularNode<TreemapNode>)
    // Create main SVG groups
    const svg = d3.select(svgRef.current)
    const defs = svg.append('defs')
    // Add filter for shadow effect
    const filter = defs.append('filter')
      .attr('id', 'treemap-shadow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%')
    filter.append('feDropShadow')
      .attr('dx', 0)
      .attr('dy', 2)
      .attr('stdDeviation', 3)
      .attr('flood-opacity', 0.1)
    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([minZoom, maxZoom])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString())
      })
    svg.call(zoom)
    const g = svg.append('g')
    // Draw cells
    const cell = g.selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${(d as D3TreemapNode).x0},${(d as D3TreemapNode).y0})`)
    // Add rectangles
    const rects = cell.append('rect')
      .attr('width', (d) => (d as D3TreemapNode).x1! - (d as D3TreemapNode).x0!)
      .attr('height', (d) => (d as D3TreemapNode).y1! - (d as D3TreemapNode).y0!)
      .attr('fill', (d) => {
        const node = (d as D3TreemapNode).data as TreemapNode
        return node.color || colorScale(node.name)
      })
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('opacity', animated ? 0 : 1)
      .attr('filter', 'url(#treemap-shadow)')
      .style('cursor', 'pointer')
    if (animated) {
      rects.transition()
        .duration(750)
        .delay((_, i) => i * 10)
        .attr('opacity', 1)
    }

    // Add labels
    const labels = cell.append('text')
      .attr('x', 4)
      .attr('y', 20)
      .attr('font-size', '14px')
      .attr('fill', 'white')
      .attr('font-weight', '500')
      .style('pointer-events', 'none')
      .attr('opacity', animated ? 0 : 1)
    labels.append('tspan')
      .text((d) => {
        const node = (d as D3TreemapNode).data as TreemapNode
        const width = (d as D3TreemapNode).x1! - (d as D3TreemapNode).x0!
        const maxChars = Math.floor(width / 8)
        return node.name.length > maxChars ? 
          node.name.substring(0, maxChars - 2) + '...' : 
          node.name
      })
    labels.append('tspan')
      .attr('x', 4)
      .attr('dy', '1.2em')
      .attr('font-size', '12px')
      .attr('fill', 'rgba(255, 255, 255, 0.8)')
      .text((d) => valueFormat((d as D3TreemapNode).value!))
    if (animated) {
      labels.transition()
        .duration(750)
        .delay((_, i) => i * 10 + 100)
        .attr('opacity', 1)
    }

    // Add interactivity
    cell
      .on('click', function(event, d) {
        event.stopPropagation()
        const node = d as D3TreemapNode
        // Zoom to node
        const bounds = [
          [node.x0!, node.y0!],
          [node.x1!, node.y1!]
        ] as [[number, number], [number, number]]
        const dx = bounds[1][0] - bounds[0][0]
        const dy = bounds[1][1] - bounds[0][1]
        const x = (bounds[0][0] + bounds[1][0]) / 2
        const y = (bounds[0][1] + bounds[1][1]) / 2
        const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)))
        const translate = [width / 2 - scale * x, height / 2 - scale * y]
        svg.transition()
          .duration(750)
          .call(
            zoom.transform,
            d3.zoomIdentity
              .translate(translate[0], translate[1])
              .scale(scale)
          )
        // Update breadcrumb
        const path = node.ancestors().reverse().map((n) => (n.data as TreemapNode).name)
        setBreadcrumb(path)
        if (onNodeClick) {
          onNodeClick(node.data as TreemapNode, event)
        }
      })
      .on('mouseenter', function(event, d) {
        const node = d as D3TreemapNode
        // Highlight node
        d3.select(this).select('rect')
          .transition()
          .duration(200)
          .attr('opacity', 0.8)
        if (showTooltip) {
          const ancestors = node.ancestors().reverse()
          const path = ancestors.map((n) => (n.data as TreemapNode).name)
          const rootValue = ancestors[0].value || 1
          setHoveredNode({
            name: (node.data as TreemapNode).name,
            value: node.value!,
            percentage: (node.value! / rootValue) * 100,
            path,
            data: (node.data as TreemapNode).data
          })
          setMousePosition({ x: event.pageX, y: event.pageY })
        }

        if (onNodeHover) {
          onNodeHover(node.data as TreemapNode, event)
        }
      })
      .on('mousemove', function(event) {
        setMousePosition({ x: event.pageX, y: event.pageY })
      })
      .on('mouseleave', function() {
        // Remove highlight
        d3.select(this).select('rect')
          .transition()
          .duration(200)
          .attr('opacity', 1)
        setHoveredNode(null)
        if (onNodeHover) {
          onNodeHover(null, event as MouseEvent)
        }
      })
    // Reset zoom on background click
    svg.on('click', function() {
      svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity)
      setBreadcrumb(['Root'])
    })
    setCurrentRoot(root)
  }, [data, width, height, animated, minZoom, maxZoom, colorScale, onNodeClick, onNodeHover, showTooltip, valueFormat])
    useEffect(() => {
    buildTreemap()
  }, [buildTreemap])
  // Validate data
  if (!data || !data.children) {
    return (
      <div className={cn('relative', className)}>
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <p className="text-gray-400">No hay datos disponibles para mostrar</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Header */}
      {(title || subtitle || showBreadcrumb) && (<div className="mb-4">
          {title && <h3 className="text-xl font-semibold text-gray-100">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
          
          {showBreadcrumb && (
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-400">
              {breadcrumb.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span>/</span>}
                  <span className={cn(
                    'cursor-pointer hover:text-gray-200 transition-colors',
                    index === breadcrumb.length - 1 && 'text-gray-200 font-medium'
                  )}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Treemap */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="treemap-chart"
          style={{ maxWidth: '100%', height: 'auto' }}
        >
          <rect width={width} height={height} fill="transparent" />
        </svg>

        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => {
              if (svgRef.current) {
                const svg = d3.select(svgRef.current)
                const zoom = d3.zoom<SVGSVGElement, unknown>()
                svg.call(zoom.transform, d3.zoomIdentity)
                setBreadcrumb(['Root'])
              }
            }}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Reset Zoom"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && hoveredNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className="absolute z-50 pointer-events-none"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y - 10,
              transform: 'translate(0, -100%)'
            }}
          >
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl max-w-xs">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-white">{hoveredNode.name}</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    {hoveredNode.path.slice(0, -1).join(' → ')}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Value:</span>
                  <span className="text-sm font-medium text-white">
                    {valueFormat(hoveredNode.value)}
                  </span>
                </div>
                {hoveredNode.percentage !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Percentage:</span>
                    <span className="text-sm font-medium text-white">
                      {hoveredNode.percentage.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>

              {hoveredNode.data ? (
                <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
                  Click to zoom in • Right-click for details
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
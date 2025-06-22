/**
 * Sankey Chart Component
 * Interactive flow visualization using D3
 * By Cheva
 */

import React, { useRef, useEffect, useState, useMemo } from 'react'
import * as d3 from 'd3'
import { sankey, sankeyLinkHorizontal, sankeyLeft, sankeyRight, sankeyCenter, sankeyJustify} from 'd3-sankey'
import { motion} from 'framer-motion'
import { cn} from '@/utils/utils'
import type { SankeyChartProps, SankeyNode, SankeyLink} from '../types/sankey.types'
// Define D3 Sankey types locally since they're not exported
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
interface D3SankeyNode<N = any, L = any> {
  sourceLinks?: L[]
  targetLinks?: L[]
  value?: number
  index?: number
  x0?: number
  x1?: number
  y0?: number
  y1?: number
}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
interface D3SankeyLink<N = any, L = any> {
  source: N | number
  target: N | number
  value: number
  width?: number
  y0?: number
  y1?: number
}

// Extend D3 types with our custom properties
interface ExtendedNode extends D3SankeyNode<SankeyNode, SankeyLink> {
  x0?: number
  x1?: number
  y0?: number
  y1?: number
}

interface ExtendedLink extends D3SankeyLink<SankeyNode, SankeyLink> {
  width?: number
  y0?: number
  y1?: number
}

export const SankeyChart: React.FC<SankeyChartProps> = ({
  data, width = 800, height = 600, margin = { top: 20, right: 120, bottom: 20, left: 120 }, nodeWidth = 20, nodePadding = 10, nodeAlign = 'justify', nodeSort = null, linkSort = null, iterations = 32, colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'], animated = true, interactive = true, showLabels = true, showValues = true, labelPosition = 'outside', valueFormat = (v) => v.toLocaleString(),
  onNodeClick,
  onNodeHover,
  onLinkClick,
  onLinkHover,
  className
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [, setHoveredLink] = useState<string | null>(null)
  // Calculate inner dimensions
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom
  // Create color scale
  const colorScale = useMemo(() => {
    const uniqueNodes = Array.from(new Set(data.nodes.map(n => n.id)))
    return d3.scaleOrdinal<string>()
      .domain(uniqueNodes)
      .range(colors)
  }, [data.nodes, colors])
    useEffect(() => {
    if (!svgRef.current || !data.nodes.length || !data.links.length) return
    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()
    // Create SVG groups
    const svg = d3.select(svgRef.current)
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
    // Create sankey generator
    const sankeyGenerator = sankey<SankeyNode, SankeyLink>()
      .nodeId(d => d.id)
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .nodeAlign(sankeyNodeAlign(nodeAlign))
      .nodeSort(nodeSort)
      .linkSort(linkSort)
      .extent([[0, 0], [innerWidth, innerHeight]])
      .iterations(iterations)
    // Generate sankey layout
    const sankeyData = sankeyGenerator({
      nodes: data.nodes.map(d => ({ ...d })),
      links: data.links.map(d => ({ ...d }))
    })
    // Create gradients for links
    const defs = svg.append('defs')
    sankeyData.links.forEach((link: ExtendedLink, i) => {
      const gradient = defs.append('linearGradient')
        .attr('id', `gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', (link.source as ExtendedNode).x1)
        .attr('y1', ((link.source as ExtendedNode).y0! + (link.source as ExtendedNode).y1!) / 2)
        .attr('x2', (link.target as ExtendedNode).x0)
        .attr('y2', ((link.target as ExtendedNode).y0! + (link.target as ExtendedNode).y1!) / 2)
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', link.color || colorScale((link.source as SankeyNode).id))
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', link.color || colorScale((link.target as SankeyNode).id))
    })
    // Draw links
    const linksGroup = g.append('g')
      .attr('class', 'links')
      .attr('fill', 'none')
    const links = linksGroup.selectAll('path')
      .data(sankeyData.links)
      .enter()
      .append('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (d, i) => `url(#gradient-${i})`)
      .attr('stroke-width', (d: ExtendedLink) => Math.max(1, d.width || 0))
      .attr('opacity', animated ? 0 : 0.5)
      .attr('class', 'transition-all duration-300')
      .style('cursor', interactive ? 'pointer' : 'default')
    if (animated) {
      links.transition()
        .duration(1000)
        .delay((d, i) => i * 20)
        .attr('opacity', 0.5)
    }

    // Draw nodes
    const nodesGroup = g.append('g')
      .attr('class', 'nodes')
    const nodes = nodesGroup.selectAll('rect')
      .data(sankeyData.nodes)
      .enter()
      .append('rect')
      .attr('x', (d: ExtendedNode) => d.x0 || 0)
      .attr('y', (d: ExtendedNode) => d.y0 || 0)
      .attr('width', (d: ExtendedNode) => (d.x1 || 0) - (d.x0 || 0))
      .attr('height', animated ? 0 : (d: ExtendedNode) => (d.y1 || 0) - (d.y0 || 0))
      .attr('fill', (d: SankeyNode) => d.color || colorScale(d.id))
      .attr('opacity', animated ? 0 : 0.9)
      .attr('class', 'transition-all duration-300')
      .style('cursor', interactive ? 'pointer' : 'default')
    if (animated) {
      nodes.transition()
        .duration(1000)
        .delay((d, i) => i * 30)
        .attr('height', (d: ExtendedNode) => (d.y1 || 0) - (d.y0 || 0))
        .attr('opacity', 0.9)
    }

    // Add labels
    if (showLabels) {
      const labelsGroup = g.append('g')
        .attr('class', 'labels')
      const labels = labelsGroup.selectAll('text')
        .data(sankeyData.nodes)
        .enter()
        .append('text')
        .attr('x', (d: ExtendedNode) => {
          if (labelPosition === 'inside') {
            return (d.x0! + d.x1!) / 2
          }
          return d.x0! < innerWidth / 2 ? d.x0! - 6 : d.x1! + 6
        })
        .attr('y', (d: ExtendedNode) => (d.y0! + d.y1!) / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', (d: ExtendedNode) => {
          if (labelPosition === 'inside') return 'middle'
          return d.x0! < innerWidth / 2 ? 'end' : 'start'
        })
        .attr('opacity', animated ? 0 : 1)
        .attr('class', 'text-sm fill-gray-300')
        .text((d: SankeyNode) => d.name)
      if (showValues) {
        labels.append('tspan')
          .attr('x', (d: ExtendedNode) => {
            if (labelPosition === 'inside') {
              return (d.x0! + d.x1!) / 2
            }
            return d.x0! < innerWidth / 2 ? d.x0! - 6 : d.x1! + 6
          })
          .attr('dy', '1.2em')
          .attr('class', 'text-xs fill-gray-500')
          .text((d: SankeyNode) => valueFormat(d.value || 0))
      }

      if (animated) {
        labels.transition()
          .duration(1000)
          .delay((d, i) => i * 30 + 500)
          .attr('opacity', 1)
      }
    }

    // Add interactivity
    if (interactive) {
      // Node interactions
      nodes
        .on('mouseenter', function(event, d) {
          setHoveredNode((d as SankeyNode).id)
          d3.select(this).transition().duration(200).attr('opacity', 1)
          // Highlight connected links
          links
            .transition()
            .duration(200)
            .attr('opacity', (l: unknown) => {
              return (l.source as SankeyNode).id === (d as SankeyNode).id || 
                     (l.target as SankeyNode).id === (d as SankeyNode).id ? 0.8 : 0.2
            })
          if (onNodeHover) {
            onNodeHover(d, event)
          }
        })
        .on('mouseleave', function(event) {
          setHoveredNode(null)
          d3.select(this).transition().duration(200).attr('opacity', 0.9)
          // Reset links
          links.transition().duration(200).attr('opacity', 0.5)
          if (onNodeHover) {
            onNodeHover(null, event)
          }
        })
        .on('click', function(event, d) {
          if (onNodeClick) {
            onNodeClick(d, event)
          }
        })
      // Link interactions
      links
        .on('mouseenter', function(event, d) {
          const linkId = `${(d.source as SankeyNode).id}-${(d.target as SankeyNode).id}`
          setHoveredLink(linkId)
          d3.select(this).transition().duration(200).attr('opacity', 0.8)
          if (onLinkHover) {
            onLinkHover(d, event)
          }
        })
        .on('mouseleave', function(event) {
          setHoveredLink(null)
          d3.select(this).transition().duration(200).attr('opacity', 0.5)
          if (onLinkHover) {
            onLinkHover(null, event)
          }
        })
        .on('click', function(event, d) {
          if (onLinkClick) {
            onLinkClick(d, event)
          }
        })
    }

    // Add hover info box
    const tooltip = g.append('g')
      .attr('class', 'tooltip')
      .style('display', 'none')
    tooltip.append('rect')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', 'rgba(0, 0, 0, 0.9)')
      .attr('stroke', 'rgba(255, 255, 255, 0.1)')
    tooltip.append('text')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('x', 8)
      .attr('y', 20)
  }, [data, width, height, margin, iterations, colors, animated, interactive])
  return (
    <div className={cn('relative', className)}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="sankey-chart"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        <rect width={width} height={height} fill="transparent" />
      </svg>
      
      {/* Hover info display */}
      {hoveredNode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg"
        >
          <h4 className="font-semibold text-white mb-2">
            {data.nodes.find(n => n.id === hoveredNode)?.name}
          </h4>
          <p className="text-sm text-gray-400">
            Value: {valueFormat(data.nodes.find(n => n.id === hoveredNode)?.value || 0)}
          </p>
        </motion.div>
      )}
    </div>
  )
}
// Helper function to convert alignment string to D3 function
function sankeyNodeAlign(align: string) {
  switch (align) {
    case 'left': {
  
          break;
        }
      }
    }
  }
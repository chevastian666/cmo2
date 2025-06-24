/**
 * Network Graph Visualization
 * D3.js implementation for node connections
 * By Cheva
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import * as d3 from 'd3'
import { NetworkData, NetworkNode, NetworkLink, ChartConfig, DEFAULT_CHART_CONFIG} from './types'
import { formatters, scales, animations, tooltip} from './utils'
// D3 Simulation types
interface SimulationNode extends NetworkNode {
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface SimulationLink extends NetworkLink {
  source: SimulationNode | string
  target: SimulationNode | string
}

interface NetworkGraphProps {
  data: NetworkData
  config?: Partial<ChartConfig>
  onNodeClick?: (node: NetworkNode) => void
  onLinkClick?: (link: NetworkLink) => void
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  data, config: userConfig, onNodeClick, onLinkClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
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
  const drawNetwork = useCallback(() => {
    if (!svgRef.current || !data.nodes.length) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    // Create scales
    const colorScale = scales.createColorScale(
      [...new Set(data.nodes.map(d => d.group))],
      config.colors
    )
    const sizeScale = d3.scaleSqrt()
      .domain(d3.extent(data.nodes, d => d.value) as [number, number])
      .range([8, 30])
    const linkScale = d3.scaleLinear()
      .domain(d3.extent(data.links, d => d.value) as [number, number])
      .range([1, 8])
    // Create simulation
    const simulation = d3.forceSimulation<SimulationNode>(data.nodes as SimulationNode[])
      .force('link', d3.forceLink<SimulationNode, SimulationLink>(data.links as SimulationLink[])
        .id(d => d.id)
        .distance(d => 50 + d.value * 2)
        .strength(0.5)
      )
      .force('charge', d3.forceManyBody()
        .strength(-300)
        .distanceMax(200)
      )
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide()
        .radius(d => sizeScale(d.value) + 5)
      )
    // Create main group
    const g = svg.append('g')
    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })
    svg.call(zoom)
    // Create tooltip
    const tooltipDiv = tooltip.create(containerRef.current!)
    // Create arrow markers for directed links
    svg.append('defs').selectAll('marker')
      .data(['arrow'])
      .enter().append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#6B7280')
    // Create links
    const links = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(data.links)
      .enter().append('line')
      .attr('stroke', '#6B7280')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => linkScale(d.value))
      .attr('marker-end', 'url(#arrow)')
      .style('cursor', 'pointer')
      .style('opacity', 0)
    // Animate links
    links.transition()
      .delay((_d, i) => i * 50)
      .duration(config.animations.duration)
      .style('opacity', 1)
    // Add link interactions
    links
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke', config.colors[0])
          .attr('stroke-opacity', 1)
          .attr('stroke-width', linkScale(d.value) + 2)
        const content = `
          <div class="font-semibold">${d.source.id} → ${d.target.id}</div>
          <div class="text-sm mt-1">Conexión: ${formatters.number(d.value)}</div>
          ${d.label ? `<div class="text-sm">Tipo: ${d.label}</div>` : ''}
        `
        tooltip.show(tooltipDiv, content, event.pageX, event.pageY)
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke', '#6B7280')
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', d => linkScale(d.value))
        tooltip.hide(tooltipDiv)
      })
      .on('click', (event, d) => {
        onLinkClick?.(d)
      })
    // Create nodes
    const nodes = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(data.nodes)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, NetworkNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      )
    // Add node circles
    const circles = nodes.append('circle')
      .attr('r', 0)
      .attr('fill', d => colorScale(d.group))
      .attr('stroke', '#1F2937')
      .attr('stroke-width', 2)
    // Animate node appearance
    circles.transition()
      .delay((_d, i) => i * 100)
      .duration(config.animations.duration)
      .attr('r', d => sizeScale(d.value))
    // Add node labels
    const labels = nodes.append('text')
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .style('fill', '#D1D5DB')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text(d => d.label.length > 8 ? d.label.slice(0, 8) + '...' : d.label)
      .style('opacity', 0)
    animations.fadeIn(labels, config.animations.duration + 300)
    // Add node interactions
    nodes
      .on('mouseenter', function(event, d) {
        const circle = d3.select(this).select('circle')
        const label = d3.select(this).select('text')
        circle.transition()
          .duration(200)
          .attr('r', sizeScale(d.value) + 5)
          .attr('stroke-width', 3)
          .attr('stroke', '#FBBF24')
        label.transition()
          .duration(200)
          .style('font-size', '14px')
          .style('font-weight', '600')
        // Highlight connected links
        links
          .style('stroke-opacity', l => 
            ((l.source as SimulationNode).id === d.id || (l.target as SimulationNode).id === d.id) ? 1 : 0.2
          )
        // Highlight connected nodes
        circles
          .style('opacity', n => {
            const isConnected = data.links.some(l => 
              ((l.source as SimulationNode).id === d.id && (l.target as SimulationNode).id === n.id) ||
              ((l.target as SimulationNode).id === d.id && (l.source as SimulationNode).id === n.id)
            )
            return n.id === d.id || isConnected ? 1 : 0.3
          })
        const content = `
          <div class="font-semibold">${d.label}</div>
          <div class="text-sm mt-1">Valor: ${formatters.number(d.value)}</div>
          <div class="text-sm">Grupo: ${d.group}</div>
          ${d.metadata ? Object.entries(d.metadata).map(([key, value]) => 
            `<div class="text-xs text-gray-400">${key}: ${value}</div>`
          ).join('') : ''}
          <div class="text-xs text-gray-400 mt-2">Arrastra para mover</div>
        `
        tooltip.show(tooltipDiv, content, event.pageX, event.pageY)
      })
      .on('mouseleave', function(event, d) {
        const circle = d3.select(this).select('circle')
        const label = d3.select(this).select('text')
        circle.transition()
          .duration(200)
          .attr('r', sizeScale(d.value))
          .attr('stroke-width', 2)
          .attr('stroke', '#1F2937')
        label.transition()
          .duration(200)
          .style('font-size', '12px')
          .style('font-weight', '500')
        // Reset link opacity
        links.style('stroke-opacity', 0.6)
        // Reset node opacity
        circles.style('opacity', 1)
        tooltip.hide(tooltipDiv)
      })
      .on('click', (event, d) => {
        onNodeClick?.(d)
      })
    // Create legend
    const groups = [...new Set(data.nodes.map(d => d.group))]
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(20, 20)`)
    const legendItems = legend.selectAll('.legend-item')
      .data(groups)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 25})`)
    legendItems.append('circle')
      .attr('r', 8)
      .attr('fill', d => colorScale(d))
      .attr('stroke', '#1F2937')
      .attr('stroke-width', 1)
    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 0)
      .attr('dy', '.35em')
      .style('fill', '#D1D5DB')
      .style('font-size', '12px')
      .text(d => d)
    // Add statistics
    const stats = g.append('g')
      .attr('class', 'stats')
      .attr('transform', `translate(${dimensions.width - 200}, 20)`)
    const statsData = [
      { label: 'Nodos', value: data.nodes.length },
      { label: 'Enlaces', value: data.links.length },
      { label: 'Grupos', value: groups.length }
    ]
    const statItems = stats.selectAll('.stat-item')
      .data(statsData)
      .enter().append('g')
      .attr('class', 'stat-item')
      .attr('transform', (d, i) => `translate(0, ${i * 25})`)
    statItems.append('rect')
      .attr('width', 150)
      .attr('height', 20)
      .attr('fill', 'rgba(17, 24, 39, 0.8)')
      .attr('stroke', '#374151')
      .attr('rx', 3)
    statItems.append('text')
      .attr('x', 8)
      .attr('y', 14)
      .style('fill', '#9CA3AF')
      .style('font-size', '11px')
      .text(d => `${d.label}: ${d.value}`)
    // Add control buttons
    const controls = g.append('g')
      .attr('class', 'controls')
      .attr('transform', `translate(${dimensions.width - 120}, ${dimensions.height - 100})`)
    const buttons = [
      { label: 'Reset', action: () => {
        svg.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity)
        simulation.alpha(1).restart()
      }},
      { label: 'Stop', action: () => simulation.stop() },
      { label: 'Start', action: () => simulation.restart() }
    ]
    const buttonGroups = controls.selectAll('.button')
      .data(buttons)
      .enter().append('g')
      .attr('class', 'button')
      .attr('transform', (d, i) => `translate(0, ${i * 30})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => d.action())
    buttonGroups.append('rect')
      .attr('width', 60)
      .attr('height', 25)
      .attr('fill', '#374151')
      .attr('stroke', '#6B7280')
      .attr('rx', 3)
    buttonGroups.append('text')
      .attr('x', 30)
      .attr('y', 17)
      .attr('text-anchor', 'middle')
      .style('fill', '#D1D5DB')
      .style('font-size', '11px')
      .text(d => d.label)
    // Simulation tick function
    simulation.on('tick', () => {
      links
        .attr('x1', d => (d.source as SimulationNode).x || 0)
        .attr('y1', d => (d.source as SimulationNode).y || 0)
        .attr('x2', d => (d.target as SimulationNode).x || 0)
        .attr('y2', d => (d.target as SimulationNode).y || 0)
      nodes.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`)
    })
    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>, d: SimulationNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>, d: SimulationNode) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>, d: SimulationNode) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

  }, [data, config, dimensions, onNodeClick, onLinkClick])
    useEffect(() => {
    drawNetwork()
  }, [drawNetwork])
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative"
      style={{ minHeight: '500px' }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ display: 'block' }}
      />
    </div>
  )
}
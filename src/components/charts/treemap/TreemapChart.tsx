/**
 * Treemap Chart Component
 * Simplified D3 treemap implementation
 * By Cheva
 */

import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'
interface TreemapNode {
  name: string;
  value?: number;
  children?: TreemapNode[];
}

interface TreemapChartProps {
  data: TreemapNode
  width?: number
  height?: number
}

type D3TreemapNode = d3.HierarchyRectangularNode<TreemapNode> & {
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
};

export const TreemapChart: React.FC<TreemapChartProps> = ({
  data, width = 800, height = 600
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  useEffect(() => {
    if (!svgRef.current || !data) return
    // Clear previous content
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    // Create hierarchy
    const root = d3.hierarchy(data)
      .sum((d) => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0))
    // Create treemap layout
    d3.treemap<TreemapNode>()
      .size([width, height])
      .padding(2)(root as any)
    // Create color scale
    const color = d3.scaleOrdinal<string>(d3.schemeCategory10)
    // Create cells
    const cell = svg.selectAll('g')
      .data(root.leaves())
      .enter().append('g')
      .attr('transform', (d) => `translate(${(d as D3TreemapNode).x0},${(d as D3TreemapNode).y0})`)
    // Add rectangles
    cell.append('rect')
      .attr('width', (d) => (d as D3TreemapNode).x1! - (d as D3TreemapNode).x0!)
      .attr('height', (d) => (d as D3TreemapNode).y1! - (d as D3TreemapNode).y0!)
      .attr('fill', (d) => color((d as D3TreemapNode).data.name))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
    // Add text labels
    cell.append('text')
      .attr('x', 4)
      .attr('y', 20)
      .text((d) => (d as D3TreemapNode).data.name)
      .attr('font-size', '12px')
      .attr('fill', 'white')
    // Add values
    cell.append('text')
      .attr('x', 4)
      .attr('y', 35)
      .text((d) => (d as D3TreemapNode).value || '')
      .attr('font-size', '10px')
      .attr('fill', 'rgba(255,255,255,0.7)')
  }, [data, width, height])
  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  )
}
/**
 * Treemap Chart Component
 * Simplified D3 treemap implementation
 * By Cheva
 */

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface TreemapChartProps {
  data: any;
  width?: number;
  height?: number;
}

export const TreemapChart: React.FC<TreemapChartProps> = ({
  data,
  width = 800,
  height = 600
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create hierarchy
    const root = d3.hierarchy(data)
      .sum((d: any) => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Create treemap layout
    d3.treemap()
      .size([width, height])
      .padding(2)
      (root);

    // Create color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create cells
    const cell = svg.selectAll('g')
      .data(root.leaves())
      .enter().append('g')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    // Add rectangles
    cell.append('rect')
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('height', (d: any) => d.y1 - d.y0)
      .attr('fill', (d: any) => color(d.data.name))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);

    // Add text labels
    cell.append('text')
      .attr('x', 4)
      .attr('y', 20)
      .text((d: any) => d.data.name)
      .attr('font-size', '12px')
      .attr('fill', 'white');

    // Add values
    cell.append('text')
      .attr('x', 4)
      .attr('y', 35)
      .text((d: any) => d.value)
      .attr('font-size', '10px')
      .attr('fill', 'rgba(255,255,255,0.7)');

  }, [data, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
};
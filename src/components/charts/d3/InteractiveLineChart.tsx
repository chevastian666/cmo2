/**
 * Interactive Line Chart with Zoom and Pan
 * D3.js implementation for transaction history
 * By Cheva
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { TimeSeriesData, ChartConfig, DEFAULT_CHART_CONFIG } from './types';
import { formatters, scales, animations, tooltip, responsive } from './utils';

interface InteractiveLineChartProps {
  data: TimeSeriesData[];
  config?: Partial<ChartConfig>;
  onDataPointClick?: (data: TimeSeriesData) => void;
  onZoomChange?: (domain: [Date, Date]) => void;
}

export const InteractiveLineChart: React.FC<InteractiveLineChartProps> = ({
  data,
  config: userConfig,
  onDataPointClick,
  onZoomChange
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  
  const config = { ...DEFAULT_CHART_CONFIG, ...userConfig };

  // Handle container resize
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width: width || 800, height: height || 400 });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const drawChart = useCallback(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const { margin } = config;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = scales.createTimeScale(
      d3.extent(data, d => d.date) as [Date, Date],
      [0, innerWidth]
    );

    const yScale = scales.createLinearScale(
      d3.extent(data, d => d.value) as [number, number],
      [innerHeight, 0]
    );

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10])
      .extent([[0, 0], [width, height]])
      .on('zoom', handleZoom);

    svg.call(zoom);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create clip path for zooming
    svg.append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight);

    // Create line generator
    const line = d3.line<TimeSeriesData>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Create area generator for fill
    const area = d3.area<TimeSeriesData>()
      .x(d => xScale(d.date))
      .y0(innerHeight)
      .y1(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Add grid lines
    const xGrid = g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat('' as any)
      );

    const yGrid = g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat('' as any)
      );

    // Style grid lines
    g.selectAll('.grid line')
      .style('stroke', '#374151')
      .style('stroke-dasharray', '2,2')
      .style('opacity', 0.7);

    g.selectAll('.grid path')
      .style('stroke-width', 0);

    // Add gradient definition
    const gradient = svg.select('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', 0).attr('y2', innerHeight);

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', config.colors[0])
      .attr('stop-opacity', 0.3);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', config.colors[0])
      .attr('stop-opacity', 0);

    // Add area with animation
    const areaPath = g.append('path')
      .datum(data)
      .attr('fill', 'url(#area-gradient)')
      .attr('clip-path', 'url(#clip)')
      .attr('d', area);

    animations.fadeIn(areaPath, config.animations.duration);

    // Add line with animation
    const linePath = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', config.colors[0])
      .attr('stroke-width', 2)
      .attr('clip-path', 'url(#clip)')
      .attr('d', line);

    const totalLength = (linePath.node() as SVGPathElement).getTotalLength();
    linePath
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(config.animations.duration)
      .attr('stroke-dashoffset', 0);

    // Add data points
    const dots = g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('clip-path', 'url(#clip)')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.value))
      .attr('r', 0)
      .attr('fill', config.colors[0])
      .attr('stroke', '#1F2937')
      .attr('stroke-width', 2);

    // Animate dots appearance
    dots.transition()
      .delay((d, i) => i * 50)
      .duration(300)
      .attr('r', 4);

    // Create tooltip
    const tooltipDiv = tooltip.create(containerRef.current!);

    // Add hover interactions
    dots
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 6)
          .attr('stroke-width', 3);

        const content = `
          <div class="font-semibold">${formatters.dateTime(d.date)}</div>
          <div class="text-sm mt-1">Valor: ${formatters.number(d.value)}</div>
          ${d.category ? `<div class="text-sm">Categoría: ${d.category}</div>` : ''}
          ${d.metadata ? Object.entries(d.metadata).map(([key, value]) => 
            `<div class="text-xs text-gray-400">${key}: ${value}</div>`
          ).join('') : ''}
        `;

        tooltip.show(tooltipDiv, content, event.pageX, event.pageY);
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 4)
          .attr('stroke-width', 2);

        tooltip.hide(tooltipDiv);
      })
      .on('click', (event, d) => {
        onDataPointClick?.(d);
      });

    // Add axes
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(formatters.shortDate as any)
      );

    const yAxis = g.append('g')
      .call(d3.axisLeft(yScale)
        .tickFormat(formatters.number as any)
      );

    // Style axes
    g.selectAll('.domain')
      .style('stroke', '#6B7280');

    g.selectAll('.tick line')
      .style('stroke', '#6B7280');

    g.selectAll('.tick text')
      .style('fill', '#9CA3AF')
      .style('font-size', '12px');

    // Add axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', '#9CA3AF')
      .style('font-size', '14px')
      .text('Transacciones');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('fill', '#9CA3AF')
      .style('font-size', '14px')
      .text('Fecha');

    // Zoom handler
    function handleZoom(event: d3.D3ZoomEvent<SVGSVGElement, unknown>) {
      const { transform } = event;
      
      // Update scales
      const newXScale = transform.rescaleX(xScale);
      const newYScale = transform.rescaleY(yScale);

      // Update line and area
      const newLine = line.x(d => newXScale(d.date)).y(d => newYScale(d.value));
      const newArea = area.x(d => newXScale(d.date)).y1(d => newYScale(d.value));

      linePath.attr('d', newLine);
      areaPath.attr('d', newArea);

      // Update dots
      dots
        .attr('cx', d => newXScale(d.date))
        .attr('cy', d => newYScale(d.value));

      // Update axes
      xAxis.call(d3.axisBottom(newXScale).tickFormat(formatters.shortDate as any));
      yAxis.call(d3.axisLeft(newYScale).tickFormat(formatters.number as any));

      // Update grid
      xGrid.call(d3.axisBottom(newXScale)
        .tickSize(-innerHeight)
        .tickFormat('' as any)
      );
      yGrid.call(d3.axisLeft(newYScale)
        .tickSize(-innerWidth)
        .tickFormat('' as any)
      );

      // Notify zoom change
      onZoomChange?.(newXScale.domain() as [Date, Date]);
    }

    // Add reset zoom button
    const resetButton = g.append('g')
      .attr('class', 'reset-zoom')
      .attr('transform', `translate(${innerWidth - 60}, 10)`)
      .style('cursor', 'pointer')
      .style('opacity', 0)
      .on('click', () => {
        svg.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity);
      });

    resetButton.append('rect')
      .attr('width', 50)
      .attr('height', 20)
      .attr('rx', 3)
      .attr('fill', '#374151')
      .attr('stroke', '#6B7280');

    resetButton.append('text')
      .attr('x', 25)
      .attr('y', 14)
      .attr('text-anchor', 'middle')
      .style('fill', '#D1D5DB')
      .style('font-size', '10px')
      .text('Reset');

    // Show reset button on zoom
    svg.on('zoom.reset', (event) => {
      const isZoomed = event.transform.k !== 1 || event.transform.x !== 0 || event.transform.y !== 0;
      resetButton.transition()
        .duration(200)
        .style('opacity', isZoomed ? 1 : 0);
    });

  }, [data, dimensions, config, onDataPointClick, onZoomChange]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative"
      style={{ minHeight: '300px' }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ display: 'block' }}
      />
    </div>
  );
};
/**
 * D3.js utility functions
 * By Cheva
 */

import * as d3 from 'd3'
export const formatters = {
  number: d3.format(',.0f'),
  currency: d3.format('$,.2f'),
  percentage: d3.format('.1%'),
  date: d3.timeFormat('%Y-%m-%d'),
  dateTime: d3.timeFormat('%Y-%m-%d %H:%M'),
  shortDate: d3.timeFormat('%m/%d'),
  time: d3.timeFormat('%H:%M')
}
export const scales = {
  createTimeScale: (domain: [Date, Date], range: [number, number]) => 
    d3.scaleTime().domain(domain).range(range),
  
  createLinearScale: (domain: [number, number], range: [number, number]) => 
    d3.scaleLinear().domain(domain).range(range),
  
  createOrdinalScale: (domain: string[], range: string[]) => 
    d3.scaleOrdinal().domain(domain).range(range),
  
  createColorScale: (domain: string[], colors?: string[]) => 
    d3.scaleOrdinal()
      .domain(domain)
      .range(colors || d3.schemeCategory10)
}
export const animations = {
  fadeIn: (selection: d3.Selection<SVGElement | HTMLElement, unknown, null, undefined>, duration = 750) => 
    selection
      .style('opacity', 0)
      .transition()
      .duration(duration)
      .style('opacity', 1),
  
  slideIn: (selection: d3.Selection<SVGElement | HTMLElement, unknown, null, undefined>, direction: 'left' | 'right' | 'up' | 'down', duration = 750) => {
    const transforms = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)',
      up: 'translateY(-100%)',
      down: 'translateY(100%)'
    }
    return selection
      .style('transform', transforms[direction])
      .style('opacity', 0)
      .transition()
      .duration(duration)
      .style('transform', 'translate(0, 0)')
      .style('opacity', 1)
  },
  
  morphPath: (path: d3.Selection<SVGPathElement, unknown, null, undefined>, newD: string, duration = 750) =>
    path
      .transition()
      .duration(duration)
      .attrTween('d', function() {
        const current = this.getAttribute('d') || ''
        return d3.interpolate(current, newD)
      })
}
export const interactions = {
  addHover: (selection: d3.Selection<SVGElement | HTMLElement, unknown, null, undefined>, onMouseEnter: (event: MouseEvent, d: unknown) => void,
    onMouseLeave: (event: MouseEvent, d: unknown) => void
  ) => {
    return selection
      .on('mouseenter', onMouseEnter)
      .on('mouseleave', onMouseLeave)
      .style('cursor', 'pointer')
  },
  
  addClick: (selection: d3.Selection<SVGElement | HTMLElement, unknown, null, undefined>, onClick: (event: MouseEvent, d: unknown) => void
  ) => {
    return selection.on('click', onClick)
  }
}
export const tooltip = {
  create: (container: HTMLElement) => {
    return d3.select(container)
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(17, 24, 39, 0.95)')
      .style('color', 'white')
      .style('border', '1px solid #374151')
      .style('border-radius', '6px')
      .style('padding', '12px')
      .style('font-size', '14px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('backdrop-filter', 'blur(8px)')
  },
  
  show: (tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>, content: string, x: number, y: number) => {
    return tooltip
      .style('visibility', 'visible')
      .html(content)
      .style('left', `${x + 10}px`)
      .style('top', `${y - 10}px`)
  },
  
  hide: (tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>) => {
    return tooltip.style('visibility', 'hidden')
  }
}
export const responsive = {
  getContainerDimensions: (container: HTMLElement) => {
    const rect = container.getBoundingClientRect()
    return {
      width: rect.width,
      height: rect.height
    }
  },
  
  createResponsiveSVG: (container: d3.Selection<HTMLElement, unknown, null, undefined>, aspectRatio = 2) => {
    return container
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 800 ${800 / aspectRatio}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
  }
}
export const dataProcessing = {
  groupByTime: <T>(data: T[], timeAccessor: (d: T) => Date, interval: d3.TimeInterval) => {
    return d3.groups(data, d => interval(timeAccessor(d)))
  },
  
  aggregateByGroup: <T>(data: T[], groupAccessor: (d: T) => string, valueAccessor: (d: T) => number) => {
    return Array.from(
      d3.rollup(data, v => d3.sum(v, valueAccessor), groupAccessor),
      ([key, value]) => ({ key, value })
    )
  },
  
  createHierarchy: <T extends Record<string, unknown>>(data: T[], parentKey: string, valueKey: string) => {
    return d3.hierarchy(data)
      .sum(d => d[valueKey])
      .sort((a, b) => (b.value || 0) - (a.value || 0))
  }
}
/**
 * Types for D3.js visualizations
 * By Cheva
 */

export interface TimeSeriesData {
  date: Date;
  value: number;
  category?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface HeatmapData {
  hour: number;
  day: number;
  value: number;
  label?: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  value: number;
  group: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface NetworkLink {
  source: string;
  target: string;
  value: number;
  label?: string;
}

export interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export interface TreemapNode {
  name: string;
  value: number;
  children?: TreemapNode[];
  category?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface TooltipProps {
  data: TimeSeriesData | HeatmapData | NetworkNode | NetworkLink | TreemapNode;
  x: number;
  y: number;
  visible: boolean;
}

export interface ChartConfig {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  colors: string[];
  animations: {
    duration: number;
    easing: string;
  };
}

export const DEFAULT_CHART_CONFIG: ChartConfig = {
  width: 800,
  height: 400,
  margin: {
    top: 20,
    right: 30,
    bottom: 40,
    left: 50
  },
  colors: [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
  ],
  animations: {
    duration: 750,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};
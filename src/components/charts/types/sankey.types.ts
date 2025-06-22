/**
 * Sankey Chart Types
 * By Cheva
 */

export interface SankeyNode {
  id: string;
  name: string;
  value?: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface SankeyLink {
  source: string | number;
  target: string | number;
  value: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface SankeyChartProps {
  data: SankeyData;
  width?: number;
  height?: number;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  nodeWidth?: number;
  nodePadding?: number;
  nodeAlign?: 'left' | 'right' | 'center' | 'justify';
  nodeSort?: ((a: unknown, b: unknown) => number) | null;
  linkSort?: ((a: unknown, b: unknown) => number) | null;
  iterations?: number;
  colors?: string[];
  animated?: boolean;
  interactive?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
  labelPosition?: 'inside' | 'outside';
  valueFormat?: (value: number) => string;
  onNodeClick?: (node: unknown, event: React.MouseEvent) => void;
  onNodeHover?: (node: unknown | null, event: React.MouseEvent) => void;
  onLinkClick?: (link: unknown, event: React.MouseEvent) => void;
  onLinkHover?: (link: unknown | null, event: React.MouseEvent) => void;
  className?: string;
}

// Data transformers for common use cases
export interface FlowData {
  from: string;
  to: string;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface MultiLevelFlow {
  level: number;
  node: string;
  connections: {
    to: string;
    value: number;
  }[];
}

// Logistics-specific types
export interface LogisticsFlow {
  origin: string;
  destination: string;
  transitCount: number;
  totalVolume?: number;
  avgTime?: number;
  successRate?: number;
}

export interface PrecintoFlow {
  stage: 'created' | 'activated' | 'in_transit' | 'completed' | 'deactivated';
  count: number;
  nextStage?: string;
  dropoffCount?: number;
}

export interface AlertFlow {
  source: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  resolution?: string;
  resolutionTime?: number;
}
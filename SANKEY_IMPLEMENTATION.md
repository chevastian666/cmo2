# Sankey Diagrams Implementation

## Overview
Complete implementation of interactive Sankey flow diagrams for visualizing logistics data flows in the CMO system.

## Features Implemented

### 1. Core Sankey Chart Component
- **D3.js Integration**: Built with d3 and d3-sankey for professional visualizations
- **Full TypeScript Support**: Type-safe implementation with comprehensive interfaces
- **Responsive Design**: Charts adapt to container size
- **Interactive Features**:
  - Hover effects on nodes and links
  - Click handlers for detailed information
  - Animated transitions
  - Gradient coloring for flows

### 2. Data Transformers
Multiple specialized transformers for different data types:
- **Logistics Flow**: Origin-destination transit volumes
- **Precinto Lifecycle**: Stage progression visualization
- **Alert Flow**: Source to resolution tracking
- **Time-based Flow**: Temporal analysis by hour/day/week/month
- **Hierarchical Flow**: Multi-level organizational flows

### 3. Pre-built Visualizations

#### Logistics Flow Chart
- Visualizes transit routes between origins and destinations
- Shows volume, success rates, and average times
- Multiple view modes: routes, lifecycle, alerts, temporal

#### Precinto Lifecycle Flow
- Tracks precintos through stages: created → activated → in_transit → completed → deactivated
- Shows conversion rates between stages
- Identifies drop-off points

#### Alert Flow Analysis
- Maps alerts from source to resolution
- Color-coded by severity (critical, high, medium, low)
- Tracks resolution times and patterns

#### Custom Flow Builder
- Interactive UI to create custom Sankey diagrams
- Add/remove flows dynamically
- Pre-built templates for common scenarios
- Export capabilities

### 4. Interactive Dashboard
Complete analytics dashboard at `/analytics` with:
- Quick statistics overview
- Tab-based navigation between chart types
- Date range filtering
- Fullscreen mode for detailed analysis
- Export functionality
- Real-time data refresh

## Technical Implementation

### Component Structure
```
src/components/charts/
├── sankey/
│   ├── SankeyChart.tsx          # Main chart component
│   └── utils/
│       └── dataTransformers.ts  # Data transformation utilities
└── types/
    └── sankey.types.ts          # TypeScript interfaces

src/features/analytics/
└── components/
    ├── InteractiveSankeyDashboard.tsx
    ├── LogisticsFlowChart.tsx
    ├── PrecintoLifecycleFlow.tsx
    ├── AlertFlowAnalysis.tsx
    └── CustomFlowBuilder.tsx
```

### Key Features
1. **Performance Optimized**: Uses React.memo and useMemo for efficient rendering
2. **Animated Transitions**: Smooth animations with configurable timing
3. **Color Customization**: Support for custom color schemes
4. **Flexible Layout**: Configurable margins, node width, padding
5. **Multiple Alignment Options**: left, right, center, justify
6. **Export Support**: Charts can be exported as SVG/PNG

### Usage Example
```tsx
import { SankeyChart } from '@/components/charts/sankey/SankeyChart';
import { transformLogisticsFlow } from '@/components/charts/sankey/utils/dataTransformers';

const data = transformLogisticsFlow(logisticsData);

<SankeyChart
  data={data}
  width={1000}
  height={600}
  animated={true}
  interactive={true}
  showLabels={true}
  showValues={true}
  onNodeClick={(node) => console.log('Node clicked:', node)}
  onLinkClick={(link) => console.log('Link clicked:', link)}
/>
```

## Data Format
```typescript
interface SankeyData {
  nodes: Array<{
    id: string;
    name: string;
    value?: number;
    color?: string;
  }>;
  links: Array<{
    source: string;
    target: string;
    value: number;
    color?: string;
  }>;
}
```

## Customization Options
- **Node Width**: Adjustable thickness of nodes
- **Node Padding**: Space between nodes
- **Node Alignment**: How nodes align (justify, left, right, center)
- **Colors**: Custom color arrays or individual node/link colors
- **Labels**: Inside/outside positioning, custom formatting
- **Values**: Number formatting with locale support
- **Interactivity**: Toggle hover effects, click handlers

## Performance Considerations
- Efficient D3 rendering with minimal re-renders
- Memoized calculations for complex transformations
- Debounced resize handling
- Lazy loading of chart components

## Future Enhancements
1. **Export Formats**: PDF export, high-resolution images
2. **Advanced Interactions**: Drag to rearrange nodes
3. **Real-time Updates**: WebSocket integration for live data
4. **3D Visualization**: Three.js integration for 3D flows
5. **Mobile Optimization**: Touch gestures and responsive design

---
By Cheva
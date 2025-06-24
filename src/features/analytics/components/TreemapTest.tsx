/**
 * Treemap Test Component
 * Simple test to debug treemap issues
 * By Cheva
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import { InteractiveTreemap} from '@/components/charts/treemap/InteractiveTreemap'
import { SimpleTreemap} from '@/components/charts/treemap/SimpleTreemap'
import TreemapErrorBoundary from '@/components/charts/treemap/TreemapErrorBoundary'
const TreemapTest: React.FC = () => {
  // Simple test data
  const testData = {
    name: 'Root',
    children: [
      {
        name: 'Category A',
        children: [
          { name: 'Item 1', value: 100 },
          { name: 'Item 2', value: 200 },
          { name: 'Item 3', value: 150 }
        ]
      },
      {
        name: 'Category B',
        children: [
          { name: 'Item 4', value: 300 },
          { name: 'Item 5', value: 250 }
        ]
      }
    ]
  }
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Treemap Test</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Simple Treemap Test (No D3)</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleTreemap
            data={testData}
            width={800}
            height={400}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interactive Treemap Test</CardTitle>
        </CardHeader>
        <CardContent>
          <TreemapErrorBoundary>
            <div style={{ width: '100%', height: '500px' }}>
              <InteractiveTreemap
                data={_testData}
                width={800}
                height={500}
                animated={_false}
                showBreadcrumb={_true}
                showTooltip={_true}
              />
            </div>
          </TreemapErrorBoundary>
        </CardContent>
      </Card>
    </div>
  )
}
export default TreemapTest
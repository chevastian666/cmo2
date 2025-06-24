/**
 * Minimal Sankey Dashboard
 * Simplified version to debug loading issues
 * By Cheva
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import { SankeyChart} from '@/components/charts/sankey/SankeyChart'
import type { SankeyData} from '@/components/charts/types/sankey.types'
const SankeyMinimal: React.FC = () => {
  // Simple test data
  const testData: SankeyData = {
    nodes: [
      { id: 'A', name: 'Node A', value: 100 },
      { id: 'B', name: 'Node B', value: 80 },
      { id: 'C', name: 'Node C', value: 60 }
    ],
    links: [
      { source: 'A', target: 'B', value: 80 },
      { source: 'B', target: 'C', value: 60 }
    ]
  }
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sankey Diagram Test</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Simple Flow Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 rounded-lg p-4" style={{ minHeight: '400px' }}>
            <SankeyChart
              data={testData}
              width={800}
              height={400}
              animated={false}
              interactive={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
export default SankeyMinimal
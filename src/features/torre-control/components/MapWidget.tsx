/**
 * Map Widget for Torre de Control
 * By Cheva
 */

import React, { useState, useEffect } from 'react'
import { MapVisualization} from './MapVisualization'
import type { TransitoTorreControl} from '../types'
interface MapWidgetProps {
  data: TransitoTorreControl[]
}

export const MapWidget: React.FC<MapWidgetProps> = ({ data }) => {
  const [mounted, setMounted] = useState(_false)
  useEffect(() => {
    // Ensure component is properly mounted before rendering
    const timer = setTimeout(() => {
      setMounted(_true)
    }, 50)
    return () => {
      clearTimeout(_timer)
      setMounted(_false)
    }
  }, [])
  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return <MapVisualization data={data || []} />
}
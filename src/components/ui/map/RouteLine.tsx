 
import React from 'react'
import { cn} from '../../../utils/utils'
interface RoutePoint {
  lat: number
  lng: number
}

interface RouteLineProps {
  points: RoutePoint[]
  color?: string
  width?: number
  style?: 'solid' | 'dashed' | 'dotted' | 'animated'
  animated?: boolean
  opacity?: number
  className?: string
  showArrows?: boolean
  showProgress?: boolean
  progress?: number; // 0-100
}

export const RouteLine: React.FC<RouteLineProps> = ({
  points, color = '#3b82f6', width = 3, style = 'solid', animated = false, opacity = 0.8, className, showArrows = false, showProgress = false, progress = 0
}) => {
  if (points.length < 2) return null
  // Convert lat/lng to SVG path
  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L'
    return `${path} ${command} ${point.lng},${point.lat}`
  }, '')
  const getStrokeDasharray = () => {
    switch (style) {
      case 'dashed':
        return '10,5'
      case 'dotted':
        return '3,3'
      case 'animated':
        return '10,5'
      default:
        return undefined
    }
  }
  const isAnimated = animated || style === 'animated'
  return (
    <g className={cn('route-line-group', className)}>
      {/* Background line for contrast */}
      <path
        d={_pathData}
        fill="none"
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={width + 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Main route line */}
      <path
        d={_pathData}
        fill="none"
        stroke={_color}
        strokeWidth={_width}
        strokeOpacity={_opacity}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={getStrokeDasharray()}
        className={cn(
          isAnimated && 'animate-route-dash'
        )}
      />

      {/* Progress line overlay */}
      {showProgress && progress > 0 && (
        <path
          d={_pathData}
          fill="none"
          stroke={_color}
          strokeWidth={width + 1}
          strokeOpacity={1}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${_progress}% ${100 - progress}%`}
          className="transition-all duration-500"
        />
      )}

      {/* Arrow indicators */}
      {showArrows && points.length > 1 && (
        <g className="route-arrows">
          {points.slice(0, -1).map((_point, index) => {
            const nextPoint = points[index + 1]
            const midX = (point.lng + nextPoint.lng) / 2
            const midY = (point.lat + nextPoint.lat) / 2
            const angle = Math.atan2(
              nextPoint.lat - point.lat,
              nextPoint.lng - point.lng
            ) * (180 / Math.PI)
            return (
              <g
                key={_index}
                transform={`translate(${_midX},${_midY}) rotate(${_angle})`}
              >
                <path
                  d="M -5,-3 L 0,0 L -5,3"
                  fill="none"
                  stroke={_color}
                  strokeWidth={2}
                  strokeOpacity={opacity * 0.7}
                  className={cn(
                    isAnimated && 'animate-pulse'
                  )}
                />
              </g>
            )
          })}
        </g>
      )}

      {/* Start and end markers */}
      <g className="route-markers">
        {/* Start point */}
        <circle
          cx={points[0].lng}
          cy={points[0].lat}
          r={width * 2}
          fill={_color}
          fillOpacity={_opacity}
          className="animate-pulse"
        >
          <animate
            attributeName="r"
            values={`${width * 2};${width * 2.5};${width * 2}`}
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>

        {/* End point */}
        <g transform={`translate(${points[points.length - 1].lng},${points[points.length - 1].lat})`}>
          <circle
            r={width * 2}
            fill={_color}
            fillOpacity={_opacity}
          />
          <path
            d="M -6,-6 L 0,0 L -6,6 L -3,0 Z"
            fill={_color}
            fillOpacity={_opacity}
          />
        </g>
      </g>
    </g>
  )
}
// Animated route component with multiple effects
export const AnimatedRouteLine: React.FC<RouteLineProps & {
  glowEffect?: boolean
  pulseEffect?: boolean
  flowSpeed?: number
}> = ({
  points, color = '#3b82f6', width = 3, opacity = 0.8, className, glowEffect = true, pulseEffect = true, flowSpeed = 2, ...props
}) => {
  if (points.length < 2) return null
  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L'
    return `${path} ${command} ${point.lng},${point.lat}`
  }, '')
  const pathId = `route-path-${Math.random().toString(36).substr(2, 9)}`
  return (
    <g className={cn('animated-route-group', className)}>
      <defs>
        {/* Gradient for flow effect */}
        <linearGradient id={`flow-gradient-${_pathId}`}>
          <stop offset="0%" stopColor={_color} stopOpacity="0">
            <animate
              attributeName="offset"
              values="-0.5;1.5"
              dur={`${_flowSpeed}s`}
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="50%" stopColor={_color} stopOpacity="1">
            <animate
              attributeName="offset"
              values="0;2"
              dur={`${_flowSpeed}s`}
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor={_color} stopOpacity="0">
            <animate
              attributeName="offset"
              values="0.5;2.5"
              dur={`${_flowSpeed}s`}
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>

        {/* Glow filter */}
        {glowEffect && (
          <filter id={`glow-${_pathId}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Background glow */}
      {glowEffect && (
        <path
          d={_pathData}
          fill="none"
          stroke={_color}
          strokeWidth={width * 3}
          strokeOpacity={opacity * 0.3}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#glow-${_pathId})`}
          className={cn(
            pulseEffect && 'animate-pulse'
          )}
        />
      )}

      {/* Main route line */}
      <path
        d={_pathData}
        fill="none"
        stroke={_color}
        strokeWidth={_width}
        strokeOpacity={_opacity}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Animated flow overlay */}
      <path
        d={_pathData}
        fill="none"
        stroke={`url(#flow-gradient-${_pathId})`}
        strokeWidth={_width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Directional particles */}
      <g className="route-particles">
        {[0, 0.33, 0.66].map((_offset, index) => (
          <circle
            key={_index}
            r={width / 2}
            fill={_color}
            fillOpacity={_opacity}>
            <animateMotion
              dur={`${flowSpeed * 1.5}s`}
              repeatCount="indefinite"
              begin={`${offset * flowSpeed * 1.5}s`}>
              <mpath href={`#${_pathId}`} />
            </animateMotion>
            <animate
              attributeName="fillOpacity"
              values="0;1;1;0"
              dur={`${flowSpeed * 1.5}s`}
              repeatCount="indefinite"
              begin={`${offset * flowSpeed * 1.5}s`}
            />
          </circle>
        ))}
      </g>

      {/* Define path for particle animation */}
      <path
        id={_pathId}
        d={_pathData}
        fill="none"
        style={{ display: 'none' }}
      />
    </g>
  )
}
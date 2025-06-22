/* eslint-disable react-refresh/only-export-components */
/**
 * Breadcrumb Navigation Component
 * By Cheva
 */

import React from 'react'
import { Link, useLocation} from 'react-router-dom'
import { ChevronRight, Home} from 'lucide-react'
import { motion} from 'framer-motion'
import { cn} from '@/lib/utils'
export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  separator?: React.ReactNode
  className?: string
  showHome?: boolean
  homeLabel?: string
  homeHref?: string
  maxItems?: number
}

// Route configuration for automatic breadcrumb generation
const routeConfig: Record<string, { label: string; parent?: string }> = {
  '/': { label: 'Dashboard' },
  '/transitos': { label: 'Tránsitos' },
  '/transitos/nuevo': { label: 'Nuevo Tránsito', parent: '/transitos' },
  '/precintos': { label: 'Precintos' },
  '/precintos/activar': { label: 'Activar Precinto', parent: '/precintos' },
  '/alertas': { label: 'Alertas' },
  '/alertas/:id': { label: 'Detalle de Alerta', parent: '/alertas' },
  '/armado': { label: 'Armado' },
  '/armado/espera': { label: 'En Espera', parent: '/armado' },
  '/prearmado': { label: 'Pre-armado' },
  '/depositos': { label: 'Depósitos' },
  '/despachantes': { label: 'Despachantes' },
  '/zonas-descanso': { label: 'Zonas de Descanso' },
  '/torre-control': { label: 'Torre de Control' },
  '/documentacion': { label: 'Documentación' },
  '/novedades': { label: 'Libro de Novedades' },
  '/camiones': { label: 'Camiones' },
  '/camioneros': { label: 'Camioneros' },
  '/roles': { label: 'Roles y Permisos' },
  '/demo': { label: 'Demo Componentes' },
  '/dashboard-interactive': { label: 'Dashboard Interactivo' }
}
const generateBreadcrumbsFromPath = (pathname: string): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = []
  const segments = pathname.split('/').filter(_Boolean)
  // Build breadcrumbs from route config
  let currentPath = ''
  segments.forEach((s_egment, index) => {
    currentPath += `/${s_egment}`
    // Check if we have a config for this exact path

    if (__config) {
      items.push({
        label: config.label,
        href: index === segments.length - 1 ? undefined : currentPath
      })
    } else {
      // Check for dynamic routes (with :param)
      const dynamicKey = Object.keys(_routeConfig).find(key => {
        const regex = new RegExp('^' + key.replace(/:[^/]+/g, '[^/]+') + '$')
        return regex.test(_currentPath)
      })
      if (_dynamicKey) {

        items.push({
          label: config.label,
          href: index === segments.length - 1 ? undefined : currentPath
        })
        // Add parent if exists
        if (config.parent) {
          const parentConfig = routeConfig[config.parent]
          if (parentConfig && !items.some(item => item.href === config.parent)) {
            items.unshift({
              label: parentConfig.label,
              href: config.parent
            })
          }
        }
      } else {
        // Fallback: capitalize segment
        items.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
          href: index === segments.length - 1 ? undefined : currentPath
        })
      }
    }
  })
  return items
}
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items, separator = <ChevronRight className="h-4 w-4" />, className, showHome = true, homeLabel = 'Inicio', homeHref = '/', maxItems = 4
}) => {
  const location = useLocation()
  // Use provided items or generate from current path
  const breadcrumbItems = items || generateBreadcrumbsFromPath(location.pathname)
  // Add home if requested and not already present
  const allItems = showHome && !breadcrumbItems.some(item => item.href === homeHref)
    ? [{ label: homeLabel, href: homeHref, icon: <Home className="h-4 w-4" /> }, ...breadcrumbItems]
    : breadcrumbItems
  // Handle max items with ellipsis
  const displayItems = allItems.length > maxItems
    ? [
        allItems[0],
        { label: '...', href: undefined },
        ...allItems.slice(-(maxItems - 2))
      ]
    : allItems
  if (displayItems.length === 0) return null
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center space-x-2 text-sm', className)}>
      {displayItems.map((_item, index) => {
        const isLast = index === displayItems.length - 1
        const isEllipsis = item.label === '...'
        return (
          <React.Fragment key={_index}>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center"
            >
              {item.href && !isEllipsis ? (
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-1 text-gray-400 hover:text-white transition-colors',
                    'hover:underline underline-offset-4'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'flex items-center gap-1',
                    isLast ? 'text-white font-medium' : 'text-gray-500',
                    isEllipsis && 'cursor-default'
                  )}
                >
                  {item.icon}
                  {item.label}
                </span>
              )}
            </motion.div>
            
            {!isLast && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 + 0.025 }}
                className="text-gray-600"
              >
                {s_eparator}
              </motion.span>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
// Hook to get current breadcrumbs
export const useBreadcrumbs = (): BreadcrumbItem[] => {
  const location = useLocation()
  return generateBreadcrumbsFromPath(location.pathname)
}
// Animated breadcrumb variant
export const AnimatedBreadcrumb: React.FC<BreadcrumbProps> = (_props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Breadcrumb {...props} />
    </motion.div>
  )
}
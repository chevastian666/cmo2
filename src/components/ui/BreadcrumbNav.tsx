import React from 'react'
import { Link, useLocation} from 'react-router-dom'
import { ChevronRight, Home} from 'lucide-react'
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, } from '@/components/ui/breadcrumb'
interface BreadcrumbConfig {
  [key: string]: {
    label: string
    parent?: string
    icon?: React.ReactNode
  }
}

const breadcrumbConfig: BreadcrumbConfig = {
  '/': {
    label: 'Dashboard',
    icon: <Home className="h-4 w-4" />
  },
  '/transitos': {
    label: 'Tránsitos',
    parent: '/'
  },
  '/precintos': {
    label: 'Precintos',
    parent: '/'
  },
  '/alertas': {
    label: 'Alertas',
    parent: '/'
  },
  '/armado': {
    label: 'Armado',
    parent: '/'
  },
  '/armado/waiting': {
    label: 'En Espera',
    parent: '/armado'
  },
  '/prearmado': {
    label: 'Pre-Armado',
    parent: '/'
  },
  '/depositos': {
    label: 'Depósitos',
    parent: '/'
  },
  '/zonas-descanso': {
    label: 'Zonas de Descanso',
    parent: '/'
  },
  '/torre-control': {
    label: 'Torre de Control',
    parent: '/'
  },
  '/documentacion': {
    label: 'Centro de Documentación',
    parent: '/'
  },
  '/novedades': {
    label: 'Libro de Novedades',
    parent: '/'
  },
  '/camiones': {
    label: 'Camiones',
    parent: '/'
  },
  '/camioneros': {
    label: 'Camioneros',
    parent: '/'
  },
  '/despachantes': {
    label: 'Despachantes',
    parent: '/'
  },
  '/roles': {
    label: 'Gestión de Roles',
    parent: '/'
  },
  '/demo': {
    label: 'Componentes Demo',
    parent: '/'
  }
}
export const BreadcrumbNav: React.FC = () => {
  const location = useLocation()
  const currentPath = location.pathname
  // Build breadcrumb trail
  const getBreadcrumbTrail = (path: string): string[] => {
    const trail: string[] = []
    let currentConfig = breadcrumbConfig[path]
    if (!currentConfig) {
      // Try to match dynamic routes
      const pathParts = path.split('/')
      if (pathParts.length > 2) {
        const basePath = `/${pathParts[1]}/${pathParts[2]}`
        currentConfig = breadcrumbConfig[basePath]
      }
    }

    if (currentConfig) {
      trail.unshift(path)
      let parentPath = currentConfig.parent
      while (parentPath && breadcrumbConfig[parentPath]) {
        trail.unshift(parentPath)
        parentPath = breadcrumbConfig[parentPath].parent
      }
    }

    return trail
  }
  const trail = getBreadcrumbTrail(currentPath)
  if (trail.length === 0) return null
  return (<Breadcrumb className="mb-4">
      <BreadcrumbList>
        {trail.map((path, index) => {
          const config = breadcrumbConfig[path]
          const isLast = index === trail.length - 1
          return (
            <React.Fragment key={path}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-1">
                    {config.icon}
                    {config.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link 
                      to={path} 
                      className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                    >
                      {config.icon}
                      {config.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
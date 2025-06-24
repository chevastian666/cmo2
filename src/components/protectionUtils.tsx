/**
 * Protection utilities for React components
 * By Cheva
 */

import React from 'react'
import { ProtectedRoute} from './ProtectedRoute'
// Permission types for better typing
export type Section = 
  | 'dashboard' 
  | 'alertas' 
  | 'precintos' 
  | 'transitos' 
  | 'reportes' 
  | 'usuarios' 
  | 'configuracion' 
  | 'roles'
export type Permission = 'view' | 'create' | 'edit' | 'delete' | 'admin'
// HOC variant for more flexibility
export function withProtection<P extends object>(Component: React.ComponentType<P>, section: Section, permission: Permission = 'view') {
  return (props: P) => (
    <ProtectedRoute section={section} permission={permission}>
      <Component {...props} />
    </ProtectedRoute>
  )
}
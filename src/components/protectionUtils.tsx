/**
 * Protection utilities for React components
 * By Cheva
 */

import React from 'react'
import { ProtectedRoute} from './ProtectedRoute'
import type { Section, Permission } from '@/types/roles'
// HOC variant for more flexibility
export function withProtection<P extends object>(Component: React.ComponentType<P>, section: Section, permission?: Permission) {
  return (props: P) => (
    <ProtectedRoute section={section} permission={permission}>
      <Component {...props} />
    </ProtectedRoute>
  )
}
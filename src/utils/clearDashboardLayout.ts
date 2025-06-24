/**
 * Utility to clear dashboard layout from localStorage
 * Run this in browser console if needed: clearDashboardLayout()
 */

export const clearDashboardLayout = () => {
  // Clear dashboard layout specific keys
  const keysToRemove = [
    'dashboard-layout',
    'cmo-dashboard-layout',
    'dashboard-layout-state'
  ]
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
  })
  // Also clear any keys that might contain dashboard layout data
  Object.keys(localStorage).forEach(key => {
    if (key.includes('dashboard') && key.includes('layout')) {
      localStorage.removeItem(key)
    }
  })
  console.log('Dashboard layout cleared from localStorage')
  // Reload the page to apply changes
  window.location.reload()
}
// Make it available globally in development
if (import.meta.env.DEV) {
  (window as { clearDashboardLayout?: typeof clearDashboardLayout }).clearDashboardLayout = clearDashboardLayout
}
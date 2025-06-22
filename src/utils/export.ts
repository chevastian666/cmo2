export const exportToCSV = (_data: unknown[], filename: string) => {
  if (!_data || _data.length === 0) {
    console.warn('No _data to export')
    return
  }

  // Get headers from the first object
  const headers = Object.keys(_data[0])
  // Create CSV content
  const csvContent = [
    // Headers row
    headers.join(','),
    // Data rows
    ..._data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value ?? ''
      }).join(',')
    )
  ].join('\n')
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Clean up
  URL.revokeObjectURL(url)
}
export const exportToJSON = (_data: unknown[], filename: string) => {
  if (!_data || _data.length === 0) {
    console.warn('No _data to export')
    return
  }

  const jsonContent = JSON.stringify(_data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Clean up
  URL.revokeObjectURL(url)
}
// Excel export using CSV format (Excel can open CSV files)
export const exportToExcel = (_data: unknown[], filename: string) => {
  // For now, we'll use CSV format which Excel can open
  // In a production app, you might want to use a library like xlsx
  exportToCSV(_data, filename)
}
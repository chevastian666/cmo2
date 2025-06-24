export const VirtualizedListUtils = {
  // Calculate optimal item height based on content
  calculateItemHeight: (content: string, maxWidth: number, fontSize = 14): number => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return 80
    context.font = `${fontSize}px sans-serif`
    const metrics = context.measureText(content)
    const lines = Math.ceil(metrics.width / maxWidth)
    return Math.max(80, lines * (fontSize * 1.5) + 40); // padding
  },

  // Create index map for quick lookups
  createIndexMap: <T extends { id: string }>(items: T[]): Map<string, number> => {
    const map = new Map<string, number>()
    items.forEach((item, index) => {
      map.set(item.id, index)
    })
    return map
  },

  // Binary search for sorted lists
  binarySearch: <T,>(items: T[], target: T, compareFn: (a: T, b: T) => number): number => {
    let left = 0
    let right = items.length - 1
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const comparison = compareFn(items[mid], target)
      if (comparison === 0) return mid
      if (comparison < 0) left = mid + 1
      else right = mid - 1
    }

    return -1
  }
}
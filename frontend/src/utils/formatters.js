// Number formatting utilities
export const formatNumber = (num) => {
  if (num === null || num === undefined) return 'N/A'
  
  const number = Number(num)
  if (isNaN(number)) return String(num)
  
  // Handle very large numbers
  if (Math.abs(number) >= 1e21) {
    return number.toExponential(2)
  }
  
  // Handle very small numbers
  if (Math.abs(number) > 0 && Math.abs(number) < 1e-6) {
    return number.toExponential(6)
  }
  
  // Format with commas for readability
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 10,
    useGrouping: true
  }).format(number)
}

// Time formatting utilities
export const formatExecutionTime = (ms) => {
  if (ms === null || ms === undefined) return 'N/A'
  
  const time = Number(ms)
  if (isNaN(time)) return 'N/A'
  
  if (time < 1) {
    return `${(time * 1000).toFixed(1)}μs`
  } else if (time < 1000) {
    return `${time.toFixed(2)}ms`
  } else {
    return `${(time / 1000).toFixed(2)}s`
  }
}

export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A'
  
  try {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'N/A'
  
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      return `${diffDays}d ago`
    }
  } catch (error) {
    return 'N/A'
  }
}

// Percentage formatting
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return 'N/A'
  
  const num = Number(value)
  if (isNaN(num)) return 'N/A'
  
  return `${num.toFixed(decimals)}%`
}

// Parameter formatting for display
export const formatParameters = (params) => {
  if (!params || typeof params !== 'object') return 'N/A'
  
  try {
    return Object.entries(params)
      .map(([key, value]) => `${key}: ${formatNumber(value)}`)
      .join(', ')
  } catch (error) {
    return JSON.stringify(params)
  }
}

// Result formatting for display
export const formatResult = (result) => {
  if (result === null || result === undefined) return 'N/A'
  
  if (typeof result === 'number') {
    return formatNumber(result)
  }
  
  if (typeof result === 'object') {
    try {
      return JSON.stringify(result, null, 2)
    } catch (error) {
      return String(result)
    }
  }
  
  return String(result)
}

// String utilities
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const truncate = (str, maxLength = 50) => {
  if (!str || typeof str !== 'string') return ''
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

// File size formatting
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Duration formatting
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0s'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}
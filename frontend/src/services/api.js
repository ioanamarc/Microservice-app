import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// API endpoints
export const mathApi = {
  // Health check
  health: () => api.get('/health'),

  // Mathematical operations
  power: (base, exponent) => 
    api.post('/math/power', { base, exponent }),
  
  fibonacci: (n) => 
    api.post('/math/fibonacci', { n }),
  
  factorial: (n) => 
    api.post('/math/factorial', { n }),

  // Monitoring endpoints
  getHistory: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.limit) queryParams.append('limit', params.limit)
    if (params.operation) queryParams.append('operation', params.operation)
    if (params.success_only) queryParams.append('success_only', params.success_only)
    
    const queryString = queryParams.toString()
    return api.get(`/history${queryString ? `?${queryString}` : ''}`)
  },

  getStatistics: () => api.get('/stats'),

  getCache: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.limit) queryParams.append('limit', params.limit)
    if (params.operation) queryParams.append('operation', params.operation)
    
    const queryString = queryParams.toString()
    return api.get(`/cache${queryString ? `?${queryString}` : ''}`)
  },

  getOperations: () => api.get('/operations'),
}

// Error handler utility
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status
    const message = error.response.data?.detail || error.response.data?.message || 'Unknown error'
    
    switch (status) {
      case 400:
        return { type: 'validation', message }
      case 404:
        return { type: 'not_found', message: 'Endpoint not found' }
      case 422:
        return { type: 'validation', message: 'Invalid input parameters' }
      case 500:
        return { type: 'server', message: 'Internal server error' }
      default:
        return { type: 'unknown', message }
    }
  } else if (error.request) {
    // Network error
    return { 
      type: 'network', 
      message: 'Unable to connect to server. Please check if the API is running.' 
    }
  } else {
    // Request setup error
    return { 
      type: 'request', 
      message: error.message || 'Request failed' 
    }
  }
}

export default api
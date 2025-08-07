import { useState, useCallback } from 'react'
import { handleApiError } from '../services/api.js'
import toast from 'react-hot-toast'

export const useApi = (options = {}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const execute = useCallback(async (apiCall, successMessage = null) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiCall()
      setData(response.data)
      
      if (successMessage) {
        toast.success(successMessage)
      }
      
      return response.data
    } catch (err) {
      const errorInfo = handleApiError(err)
      setError(errorInfo)
      
      if (!options.silent) {
        toast.error(errorInfo.message)
      }
      
      throw errorInfo
    } finally {
      setLoading(false)
    }
  }, [options.silent])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setData(null)
  }, [])

  return {
    loading,
    error,
    data,
    execute,
    reset
  }
}
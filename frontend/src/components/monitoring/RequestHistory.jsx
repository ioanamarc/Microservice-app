import React, { useState, useEffect } from 'react'
import { History, Filter, RefreshCw, CheckCircle, XCircle, Clock, User, Search, Terminal, Database } from 'lucide-react'
import { mathApi } from '../../services/api'
import { useApi } from '../../hooks/useApi'
import LoadingSpinner, { CardLoading } from '../common/LoadingSpinner'
import ErrorMessage, { EmptyStateError } from '../common/ErrorMessage'
import { formatNumber, formatExecutionTime, formatTimestamp, formatParameters, capitalize } from '../../utils/formatters'

const RequestHistory = () => {
  const [requests, setRequests] = useState([])
  const [filters, setFilters] = useState({
    operation: '',
    success_only: false,
    limit: 50
  })
  const [searchTerm, setSearchTerm] = useState('')
  
  const { loading, error, execute } = useApi()

  const loadHistory = async () => {
    try {
      const response = await execute(() => mathApi.getHistory(filters))
      setRequests(response || [])
    } catch (err) {
      setRequests([])
    }
  }

  useEffect(() => {
    loadHistory()
  }, [filters])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleRefresh = () => {
    loadHistory()
  }

  const handleClearFilters = () => {
    setFilters({
      operation: '',
      success_only: false,
      limit: 50
    })
    setSearchTerm('')
  }

  // Filter requests based on search term
  const filteredRequests = requests.filter(request => {
    if (!searchTerm.trim()) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      request.operation.toLowerCase().includes(searchLower) ||
      JSON.stringify(request.parameters).toLowerCase().includes(searchLower) ||
      (request.client_ip && request.client_ip.toLowerCase().includes(searchLower)) ||
      (request.result && JSON.stringify(request.result).toLowerCase().includes(searchLower))
    )
  })

  const operations = ['power', 'fibonacci', 'factorial']
  const limits = [25, 50, 100, 200]

  return (
    <div className="space-y-6">
      {/* Control Panel Window */}
      <div className="retro-window">
        <div className="retro-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>REQUEST_HISTORY.LOG</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="retro-btn text-xs px-2 py-1 flex items-center"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            REFRESH
          </button>
        </div>
        
        <div className="retro-content">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800 font-mono uppercase tracking-wider mb-1">
              REQUEST HISTORY LOG MODULE
            </h2>
            <p className="text-sm text-gray-600 font-mono">
              &gt; VIEW ALL MATHEMATICAL OPERATION REQUESTS
            </p>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="SEARCH REQUESTS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="retro-input w-full pl-8 text-xs"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-green-400" />
            </div>

            {/* Operation Filter */}
            <select
              value={filters.operation}
              onChange={(e) => handleFilterChange('operation', e.target.value)}
              className="retro-input text-xs font-mono uppercase"
            >
              <option value="">ALL OPERATIONS</option>
              {operations.map(op => (
                <option key={op} value={op}>{op.toUpperCase()}</option>
              ))}
            </select>

            {/* Success Filter */}
            <label className="flex items-center space-x-2 px-3 py-2 bg-gray-200 border-2 border-gray-400 font-mono text-xs">
              <input
                type="checkbox"
                checked={filters.success_only}
                onChange={(e) => handleFilterChange('success_only', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="font-bold uppercase">SUCCESS ONLY</span>
            </label>

            {/* Limit */}
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
              className="retro-input text-xs font-mono"
            >
              {limits.map(limit => (
                <option key={limit} value={limit}>SHOW {limit}</option>
              ))}
            </select>
          </div>

          {/* Filter Summary */}
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="text-gray-600">
              &gt; SHOWING {filteredRequests.length} OF {requests.length} REQUESTS
              {searchTerm && ` MATCHING "${searchTerm.toUpperCase()}"`}
            </div>
            
            <button
              onClick={handleClearFilters}
              className="text-cyan-600 hover:text-cyan-800 underline font-bold"
            >
              CLEAR_FILTERS
            </button>
          </div>
        </div>
      </div>

      {/* Request List Window */}
      <div className="retro-window">
        <div className="retro-title-bar">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>HISTORY_DATA.DAT</span>
          </div>
        </div>
        
        <div className="retro-content p-0">
          {loading ? (
            <div className="p-6">
              <LoadingSpinner text="LOADING REQUEST HISTORY..." />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorMessage error={error} onRetry={loadHistory} />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-6 text-center">
              <Terminal className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-bold text-gray-800 font-mono uppercase mb-2">
                {requests.length === 0 ? 'NO REQUESTS FOUND' : 'NO MATCHING REQUESTS'}
              </h3>
              <p className="text-xs text-gray-600 font-mono">
                {requests.length === 0 
                  ? '&gt; MAKE CALCULATIONS TO POPULATE LOG' 
                  : '&gt; TRY ADJUSTING SEARCH OR FILTERS'}
              </p>
            </div>
          ) : (
            <div className="retro-table w-full">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-xs font-bold text-white uppercase">STATUS</th>
                    <th className="px-4 py-2 text-xs font-bold text-white uppercase">OPERATION</th>
                    <th className="px-4 py-2 text-xs font-bold text-white uppercase">PARAMETERS</th>
                    <th className="px-4 py-2 text-xs font-bold text-white uppercase">RESULT</th>
                    <th className="px-4 py-2 text-xs font-bold text-white uppercase">TIME</th>
                    <th className="px-4 py-2 text-xs font-bold text-white uppercase">CLIENT</th>
                    <th className="px-4 py-2 text-xs font-bold text-white uppercase">TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-4 py-2 text-xs">
                        <div className="flex items-center font-mono font-bold">
                          {request.success ? (
                            <>
                              <CheckCircle className="h-3 w-3 text-green-400 mr-1" />
                              <span className="text-green-400">OK</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 text-red-400 mr-1" />
                              <span className="text-red-400">FAIL</span>
                            </>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-2 text-xs">
                        <span className="retro-badge text-xs font-bold">
                          {request.operation.toUpperCase()}
                        </span>
                      </td>
                      
                      <td className="px-4 py-2 text-xs font-mono max-w-xs truncate">
                        {formatParameters(request.parameters)}
                      </td>
                      
                      <td className="px-4 py-2 text-xs">
                        {request.success && request.result !== null ? (
                          <div className="font-mono text-green-400 max-w-xs truncate">
                            {formatNumber(request.result)}
                          </div>
                        ) : request.error_message ? (
                          <div className="text-red-400 max-w-xs truncate font-mono">
                            {request.error_message}
                          </div>
                        ) : (
                          <span className="text-gray-500 font-mono">N/A</span>
                        )}
                      </td>
                      
                      <td className="px-4 py-2 text-xs">
                        <div className="flex items-center font-mono text-cyan-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatExecutionTime(request.execution_time_ms)}
                        </div>
                      </td>
                      
                      <td className="px-4 py-2 text-xs">
                        <div className="flex items-center font-mono text-yellow-400">
                          <User className="h-3 w-3 mr-1" />
                          {request.client_ip || 'UNKNOWN'}
                        </div>
                      </td>
                      
                      <td className="px-4 py-2 text-xs font-mono text-gray-300">
                        {formatTimestamp(request.timestamp).split(' ')[1]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics Window */}
      {requests.length > 0 && (
        <div className="retro-window">
          <div className="retro-title-bar">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4 w-4" />
              <span>SUMMARY_STATS.SYS</span>
            </div>
          </div>
          
          <div className="retro-content">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-200 border-2 border-gray-400">
                <div className="flex items-center justify-center mb-2">
                  <History className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-gray-900">{requests.length}</div>
                <div className="text-xs font-mono text-gray-600 uppercase">TOTAL REQUESTS</div>
              </div>

              <div className="text-center p-4 bg-gray-200 border-2 border-gray-400">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-green-700">
                  {requests.filter(r => r.success).length}
                </div>
                <div className="text-xs font-mono text-gray-600 uppercase">SUCCESSFUL</div>
              </div>

              <div className="text-center p-4 bg-gray-200 border-2 border-gray-400">
                <div className="flex items-center justify-center mb-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-red-700">
                  {requests.filter(r => !r.success).length}
                </div>
                <div className="text-xs font-mono text-gray-600 uppercase">FAILED</div>
              </div>

              <div className="text-center p-4 bg-gray-200 border-2 border-gray-400">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-yellow-700">
                  {Math.round(
                    requests.filter(r => r.success && r.execution_time_ms)
                      .reduce((sum, r) => sum + r.execution_time_ms, 0) / 
                    requests.filter(r => r.success && r.execution_time_ms).length || 0
                  )}ms
                </div>
                <div className="text-xs font-mono text-gray-600 uppercase">AVG TIME</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RequestHistory
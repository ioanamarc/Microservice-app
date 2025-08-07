import React, { useState, useEffect } from 'react'
import { Database, RefreshCw, Search, Filter, Eye, Clock, Hash, Target, Terminal, HardDrive } from 'lucide-react'
import { mathApi } from '../../services/api'
import { useApi } from '../../hooks/useApi'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'
import { formatNumber, formatTimestamp, formatRelativeTime, formatParameters, formatResult, capitalize } from '../../utils/formatters'

const CacheViewer = () => {
  const [cacheEntries, setCacheEntries] = useState([])
  const [filters, setFilters] = useState({
    operation: '',
    limit: 50
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEntry, setSelectedEntry] = useState(null)
  
  const { loading, error, execute } = useApi()

  const loadCache = async () => {
    try {
      const response = await execute(() => mathApi.getCache(filters))
      setCacheEntries(response || [])
    } catch (err) {
      setCacheEntries([])
    }
  }

  useEffect(() => {
    loadCache()
  }, [filters])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleRefresh = () => {
    loadCache()
  }

  const handleClearFilters = () => {
    setFilters({
      operation: '',
      limit: 50
    })
    setSearchTerm('')
  }

  const handleViewDetails = (entry) => {
    setSelectedEntry(entry)
  }

  const handleCloseDetails = () => {
    setSelectedEntry(null)
  }

  // Filter entries based on search term
  const filteredEntries = cacheEntries.filter(entry => {
    if (!searchTerm.trim()) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      entry.operation.toLowerCase().includes(searchLower) ||
      JSON.stringify(entry.parameters).toLowerCase().includes(searchLower) ||
      JSON.stringify(entry.result).toLowerCase().includes(searchLower)
    )
  })

  const operations = ['power', 'fibonacci', 'factorial']
  const limits = [25, 50, 100, 200]

  // Calculate cache statistics
  const getOperationCounts = () => {
    const counts = {}
    cacheEntries.forEach(entry => {
      counts[entry.operation] = (counts[entry.operation] || 0) + 1
    })
    return counts
  }

  const getTotalHits = () => {
    return cacheEntries.reduce((sum, entry) => sum + entry.hit_count, 0)
  }

  const getAverageHits = () => {
    if (cacheEntries.length === 0) return 0
    return getTotalHits() / cacheEntries.length
  }

  const operationCounts = getOperationCounts()

  return (
    <div className="space-y-6">
      {/* Control Panel Window */}
      <div className="retro-window">
        <div className="retro-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>CACHE_VIEWER.EXE</span>
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
              CACHE VIEWER MODULE
            </h2>
            <p className="text-sm text-gray-600 font-mono">
              &gt; VIEW CACHED COMPUTATION RESULTS
            </p>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="SEARCH CACHE ENTRIES..."
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
              &gt; SHOWING {filteredEntries.length} OF {cacheEntries.length} CACHE ENTRIES
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

      {/* Cache Statistics Dashboard */}
      {cacheEntries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="retro-window">
            <div className="retro-title-bar bg-purple-600">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>ENTRIES.CNT</span>
              </div>
            </div>
            <div className="retro-content text-center">
              <div className="text-2xl font-bold font-mono text-gray-900">{cacheEntries.length}</div>
              <div className="text-xs font-mono text-gray-600 uppercase">CACHED ENTRIES</div>
            </div>
          </div>

          <div className="retro-window">
            <div className="retro-title-bar bg-green-600">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>TOTAL_HITS.CNT</span>
              </div>
            </div>
            <div className="retro-content text-center">
              <div className="text-2xl font-bold font-mono text-green-700">{formatNumber(getTotalHits())}</div>
              <div className="text-xs font-mono text-gray-600 uppercase">TOTAL HITS</div>
            </div>
          </div>

          <div className="retro-window">
            <div className="retro-title-bar bg-blue-600">
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4" />
                <span>AVG_HITS.CNT</span>
              </div>
            </div>
            <div className="retro-content text-center">
              <div className="text-2xl font-bold font-mono text-blue-700">{Math.round(getAverageHits())}</div>
              <div className="text-xs font-mono text-gray-600 uppercase">AVG HITS/ENTRY</div>
            </div>
          </div>

          <div className="retro-window">
            <div className="retro-title-bar bg-yellow-600">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>OPERATIONS.CNT</span>
              </div>
            </div>
            <div className="retro-content text-center">
              <div className="text-2xl font-bold font-mono text-yellow-700">{Object.keys(operationCounts).length}</div>
              <div className="text-xs font-mono text-gray-600 uppercase">OPERATIONS</div>
            </div>
          </div>
        </div>
      )}

      {/* Cache Entries Window */}
      <div className="retro-window">
        <div className="retro-title-bar">
          <div className="flex items-center space-x-2">
            <HardDrive className="h-4 w-4" />
            <span>CACHE_DATA.DAT</span>
          </div>
        </div>
        
        <div className="retro-content p-0">
          {loading ? (
            <div className="p-6">
              <LoadingSpinner text="LOADING CACHE ENTRIES..." />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorMessage error={error} onRetry={loadCache} />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-6 text-center">
              <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-bold text-gray-800 font-mono uppercase mb-2">
                {cacheEntries.length === 0 ? 'NO CACHE ENTRIES' : 'NO MATCHING ENTRIES'}
              </h3>
              <p className="text-xs text-gray-600 font-mono">
                {cacheEntries.length === 0 
                  ? '&gt; MAKE CALCULATIONS TO POPULATE CACHE' 
                  : '&gt; ADJUST SEARCH OR FILTERS'}
              </p>
            </div>
          ) : (
            <div className="retro-table w-full">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-xs font-bold text-white uppercase">OPERATION</th>
                    <th className="px-4 py-2 text-xs font-bold text-white uppercase">PARAMETERS</th>
                    <th className="px-4 py-2 text-xs font-bold text-white uppercase">RESULT PREVIEW</th>
                    <th className="px-4 py-2 text-xs font-bold text-white uppercase">HIT COUNT</th>
                    <th className="px-4 py-2 text-xs font-bold text-white uppercase">CREATED</th>
                    <th className="px-4 py-2 text-xs font-bold text-white uppercase">EXPIRES</th>
                    <th className="px-4 py-2 text-xs font-bold text-white uppercase">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-4 py-2 text-xs">
                        <span className={`retro-badge text-xs font-bold ${
                          entry.operation === 'power' ? 'bg-blue-600 border-blue-800' :
                          entry.operation === 'fibonacci' ? 'bg-purple-600 border-purple-800' :
                          entry.operation === 'factorial' ? 'bg-green-600 border-green-800' :
                          'bg-gray-600 border-gray-800'
                        }`}>
                          {entry.operation.toUpperCase()}
                        </span>
                      </td>
                      
                      <td className="px-4 py-2 text-xs font-mono max-w-xs truncate">
                        {formatParameters(entry.parameters)}
                      </td>
                      
                      <td className="px-4 py-2 text-xs font-mono text-green-400 max-w-xs truncate">
                        {formatResult(entry.result, entry.operation)}
                      </td>
                      
                      <td className="px-4 py-2 text-xs">
                        <div className="flex items-center font-mono text-cyan-400">
                          <Target className="h-3 w-3 mr-1" />
                          <span className="font-bold">
                            {formatNumber(entry.hit_count)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-2 text-xs">
                        <div className="font-mono text-yellow-400">
                          <div>{formatRelativeTime(entry.created_at)}</div>
                          <div className="text-xs text-gray-400">
                            {formatTimestamp(entry.created_at).split(' ')[1]}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-2 text-xs">
                        <div className="font-mono">
                          {entry.expires_at ? (
                            <>
                              <div className="text-red-400">{formatRelativeTime(entry.expires_at)}</div>
                              <div className="text-xs text-gray-400">
                                {formatTimestamp(entry.expires_at).split(' ')[1]}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-500">NEVER</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-2 text-xs">
                        <button
                          onClick={() => handleViewDetails(entry)}
                          className="retro-btn text-xs px-2 py-1 bg-cyan-600 border-cyan-800 flex items-center"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          VIEW
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Operation Distribution Window */}
      {Object.keys(operationCounts).length > 0 && (
        <div className="retro-window">
          <div className="retro-title-bar bg-teal-600">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>CACHE_DISTRIBUTION.CHART</span>
            </div>
          </div>
          
          <div className="retro-content">
            <h3 className="text-sm font-bold text-gray-800 mb-4 font-mono uppercase">
              &gt; CACHE DISTRIBUTION BY OPERATION
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(operationCounts)
                .sort(([,a], [,b]) => b - a)
                .map(([operation, count]) => {
                  const percentage = (count / cacheEntries.length) * 100
                  return (
                    <div key={operation} className="p-4 bg-gray-200 border-2 border-gray-400">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold font-mono text-gray-900 uppercase">
                          {operation}
                        </span>
                        <span className="text-sm font-mono text-gray-700">
                          {count} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 border border-gray-500 h-3">
                        <div 
                          className={`h-full ${
                            operation === 'power' ? 'bg-blue-500' :
                            operation === 'fibonacci' ? 'bg-purple-500' :
                            operation === 'factorial' ? 'bg-green-500' :
                            'bg-gray-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="retro-window max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="retro-title-bar flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="h-4 w-4" />
                <span>CACHE_ENTRY_DETAILS.DAT</span>
              </div>
              <button
                onClick={handleCloseDetails}
                className="text-white hover:text-red-300 font-bold text-lg"
              >
                ×
              </button>
            </div>
            
            <div className="retro-content space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-800 font-mono uppercase">OPERATION:</label>
                <div className="mt-1">
                  <span className={`retro-badge ${
                    selectedEntry.operation === 'power' ? 'bg-blue-600 border-blue-800' :
                    selectedEntry.operation === 'fibonacci' ? 'bg-purple-600 border-purple-800' :
                    selectedEntry.operation === 'factorial' ? 'bg-green-600 border-green-800' :
                    'bg-gray-600 border-gray-800'
                  }`}>
                    {selectedEntry.operation.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 font-mono uppercase">PARAMETERS:</label>
                <div className="mt-1 p-3 bg-gray-900 border-2 border-gray-600 text-green-400 font-mono text-sm">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(selectedEntry.parameters, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 font-mono uppercase">RESULT:</label>
                <div className="mt-1 p-3 bg-gray-900 border-2 border-gray-600 text-green-400 font-mono text-sm">
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(selectedEntry.result, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-800 font-mono uppercase">HIT COUNT:</label>
                  <div className="mt-1 text-sm font-mono text-gray-700">{formatNumber(selectedEntry.hit_count)}</div>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-800 font-mono uppercase">CREATED AT:</label>
                  <div className="mt-1 text-sm font-mono text-gray-700">{formatTimestamp(selectedEntry.created_at)}</div>
                </div>
              </div>

              {selectedEntry.expires_at && (
                <div>
                  <label className="text-sm font-bold text-gray-800 font-mono uppercase">EXPIRES AT:</label>
                  <div className="mt-1 text-sm font-mono text-gray-700">{formatTimestamp(selectedEntry.expires_at)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CacheViewer
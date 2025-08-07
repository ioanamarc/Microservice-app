import React, { useState, useEffect } from 'react'
import { BarChart3, RefreshCw, TrendingUp, TrendingDown, Activity, Clock, CheckCircle, XCircle, Database, Zap, Terminal, Monitor } from 'lucide-react'
import { mathApi } from '../../services/api'
import { useApi } from '../../hooks/useApi'
import LoadingSpinner, { CardLoading } from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'
import { formatNumber, formatExecutionTime, formatPercentage, capitalize } from '../../utils/formatters'

const Statistics = () => {
  const [stats, setStats] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  
  const { loading, error, execute } = useApi()

  const loadStatistics = async () => {
    try {
      const response = await execute(() => mathApi.getStatistics())
      setStats(response)
      setLastUpdated(new Date())
    } catch (err) {
      setStats(null)
    }
  }

  useEffect(() => {
    loadStatistics()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStatistics, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    loadStatistics()
  }

  // Calculate additional metrics
  const getSuccessRate = () => {
    if (!stats || stats.total_requests === 0) return 0
    return (stats.successful_requests / stats.total_requests) * 100
  }

  const getFailureRate = () => {
    if (!stats || stats.total_requests === 0) return 0
    return (stats.failed_requests / stats.total_requests) * 100
  }

  const getMostPopularOperation = () => {
    if (!stats || !stats.operations_count) return null
    
    const operations = Object.entries(stats.operations_count)
    if (operations.length === 0) return null
    
    return operations.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )
  }

  const getLeastPopularOperation = () => {
    if (!stats || !stats.operations_count) return null
    
    const operations = Object.entries(stats.operations_count)
    if (operations.length === 0) return null
    
    return operations.reduce((min, current) => 
      current[1] < min[1] ? current : min
    )
  }

  const getOperationPercentage = (operation, count) => {
    if (!stats || stats.total_requests === 0) return 0
    return (count / stats.total_requests) * 100
  }

  const mostPopular = getMostPopularOperation()
  const leastPopular = getLeastPopularOperation()

  return (
    <div className="space-y-6">
      {/* Control Panel Window */}
      <div className="retro-window">
        <div className="retro-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>SYSTEM_STATS.EXE</span>
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
              SERVICE STATISTICS MODULE
            </h2>
            <p className="text-sm text-gray-600 font-mono">
              &gt; MONITOR PERFORMANCE AND USAGE METRICS
              {lastUpdated && (
                <span className="ml-2 text-cyan-600">
                  • LAST_UPDATE: {lastUpdated.toLocaleTimeString('en-US', { hour12: false })}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {loading && !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <CardLoading key={i} title="LOADING METRICS..." />
          ))}
        </div>
      ) : error && !stats ? (
        <div className="retro-window border-red-600">
          <div className="retro-title-bar bg-red-600">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4 w-4" />
              <span>STATS_ERROR.LOG</span>
            </div>
          </div>
          <div className="retro-content">
            <ErrorMessage error={error} onRetry={loadStatistics} />
          </div>
        </div>
      ) : stats ? (
        <>
          {/* Key Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Requests */}
            <div className="retro-window">
              <div className="retro-title-bar">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>TOTAL_REQ.DAT</span>
                </div>
              </div>
              <div className="retro-content text-center">
                <div className="text-3xl font-bold font-mono text-gray-900 mb-2">
                  {formatNumber(stats.total_requests)}
                </div>
                <div className="text-xs font-mono text-gray-600 uppercase tracking-wider">
                  TOTAL REQUESTS
                </div>
              </div>
            </div>

            {/* Success Rate */}
            <div className="retro-window">
              <div className="retro-title-bar bg-green-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>SUCCESS_RATE.DAT</span>
                </div>
              </div>
              <div className="retro-content text-center">
                <div className="text-3xl font-bold font-mono text-green-700 mb-2">
                  {formatPercentage(getSuccessRate())}
                </div>
                <div className="text-xs font-mono text-gray-600 uppercase tracking-wider">
                  SUCCESS ({formatNumber(stats.successful_requests)})
                </div>
              </div>
            </div>

            {/* Average Execution Time */}
            <div className="retro-window">
              <div className="retro-title-bar bg-yellow-600">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>AVG_TIME.DAT</span>
                </div>
              </div>
              <div className="retro-content text-center">
                <div className="text-3xl font-bold font-mono text-yellow-700 mb-2">
                  {formatExecutionTime(stats.average_execution_time_ms)}
                </div>
                <div className="text-xs font-mono text-gray-600 uppercase tracking-wider">
                  AVG RESPONSE TIME
                </div>
              </div>
            </div>

            {/* Cache Hit Rate */}
            <div className="retro-window">
              <div className="retro-title-bar bg-purple-600">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>CACHE_HIT.DAT</span>
                </div>
              </div>
              <div className="retro-content text-center">
                <div className="text-3xl font-bold font-mono text-purple-700 mb-2">
                  {formatPercentage(stats.cache_hit_rate)}
                </div>
                <div className="text-xs font-mono text-gray-600 uppercase tracking-wider">
                  CACHE HIT RATE
                </div>
              </div>
            </div>
          </div>

          {/* Operations Breakdown Window */}
          <div className="retro-window">
            <div className="retro-title-bar">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>OPS_BREAKDOWN.CHART</span>
              </div>
            </div>
            
            <div className="retro-content">
              <h3 className="text-sm font-bold text-gray-800 mb-4 font-mono uppercase">
                &gt; OPERATIONS DISTRIBUTION
              </h3>
              
              {Object.keys(stats.operations_count).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(stats.operations_count)
                    .sort(([,a], [,b]) => b - a)
                    .map(([operation, count]) => {
                      const percentage = getOperationPercentage(operation, count)
                      return (
                        <div key={operation} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 border-2 ${
                              operation === 'power' ? 'bg-blue-500 border-blue-700' :
                              operation === 'fibonacci' ? 'bg-purple-500 border-purple-700' :
                              operation === 'factorial' ? 'bg-green-500 border-green-700' :
                              'bg-gray-500 border-gray-700'
                            }`} />
                            <span className="text-sm font-mono font-bold text-gray-900 uppercase">
                              {operation}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-mono text-gray-700">
                              {formatNumber(count)} ({formatPercentage(percentage, 0)})
                            </div>
                            <div className="w-20 bg-gray-700 border border-gray-500 h-3">
                              <div 
                                className={`h-full ${
                                  operation === 'power' ? 'bg-blue-500' :
                                  operation === 'fibonacci' ? 'bg-purple-500' :
                                  operation === 'factorial' ? 'bg-green-500' :
                                  'bg-gray-500'
                                }`}
                                style={{ width: `${Math.max(percentage, 2)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 font-mono">
                  &gt; NO OPERATIONS RECORDED YET
                </div>
              )}
            </div>
          </div>

          {/* Cache Statistics Window */}
          <div className="retro-window">
            <div className="retro-title-bar bg-cyan-600">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>CACHE_STATS.SYS</span>
              </div>
            </div>
            
            <div className="retro-content">
              <h3 className="text-sm font-bold text-gray-800 mb-4 font-mono uppercase">
                &gt; CACHE PERFORMANCE
              </h3>
              
              <div className="space-y-4">
                {/* Cache Hit Rate Visualization */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2 font-mono">
                    <span className="text-gray-700 font-bold">CACHE EFFICIENCY:</span>
                    <span className="font-bold text-purple-700">{formatPercentage(stats.cache_hit_rate)}</span>
                  </div>
                  <div className="retro-progress">
                    <div 
                      className="retro-progress-bar"
                      style={{ width: `${stats.cache_hit_rate}%` }}
                    />
                  </div>
                </div>

                {/* Cache by Operation */}
                {stats.cache_entries_by_operation && Object.keys(stats.cache_entries_by_operation).length > 0 ? (
                  <div>
                    <div className="text-sm font-bold text-gray-800 mb-3 font-mono uppercase">
                      CACHED RESULTS BY OPERATION:
                    </div>
                    <div className="space-y-2">
                      {Object.entries(stats.cache_entries_by_operation)
                        .sort(([,a], [,b]) => b - a)
                        .map(([operation, count]) => (
                          <div key={operation} className="flex items-center justify-between text-sm font-mono">
                            <span className="text-gray-700 uppercase font-bold">{operation}:</span>
                            <span className="font-bold text-cyan-700">{formatNumber(count)} ENTRIES</span>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm font-mono">
                    &gt; NO CACHED ENTRIES YET
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Performance Insights Window */}
          <div className="retro-window">
            <div className="retro-title-bar bg-orange-600">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>PERFORMANCE.ANALYSIS</span>
              </div>
            </div>
            
            <div className="retro-content">
              <h3 className="text-sm font-bold text-gray-800 mb-4 font-mono uppercase">
                &gt; SYSTEM ANALYSIS
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Most Popular Operation */}
                {mostPopular && (
                  <div className="p-4 bg-green-900 border-2 border-green-600 text-green-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs font-bold font-mono uppercase">TOP OPERATION</span>
                    </div>
                    <div className="text-lg font-bold font-mono uppercase">
                      {mostPopular[0]}
                    </div>
                    <div className="text-xs font-mono">
                      {formatNumber(mostPopular[1])} REQUESTS
                    </div>
                  </div>
                )}

                {/* Least Popular Operation */}
                {leastPopular && leastPopular !== mostPopular && (
                  <div className="p-4 bg-blue-900 border-2 border-blue-600 text-blue-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-xs font-bold font-mono uppercase">LOW USAGE</span>
                    </div>
                    <div className="text-lg font-bold font-mono uppercase">
                      {leastPopular[0]}
                    </div>
                    <div className="text-xs font-mono">
                      {formatNumber(leastPopular[1])} REQUESTS
                    </div>
                  </div>
                )}

                {/* Error Rate */}
                <div className="p-4 bg-red-900 border-2 border-red-600 text-red-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <XCircle className="h-4 w-4" />
                    <span className="text-xs font-bold font-mono uppercase">ERROR RATE</span>
                  </div>
                  <div className="text-lg font-bold font-mono">
                    {formatPercentage(getFailureRate())}
                  </div>
                  <div className="text-xs font-mono">
                    {formatNumber(stats.failed_requests)} FAILED
                  </div>
                </div>

                {/* Cache Status */}
                <div className="p-4 bg-purple-900 border-2 border-purple-600 text-purple-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <Database className="h-4 w-4" />
                    <span className="text-xs font-bold font-mono uppercase">CACHE STATUS</span>
                  </div>
                  <div className="text-lg font-bold font-mono">
                    {stats.cache_hit_rate > 50 ? 'OPTIMAL' : 
                     stats.cache_hit_rate > 25 ? 'GOOD' : 
                     stats.cache_hit_rate > 0 ? 'FAIR' : 'DISABLED'}
                  </div>
                  <div className="text-xs font-mono">
                    {formatPercentage(stats.cache_hit_rate)} EFFICIENCY
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Health Monitor */}
          <div className="retro-window">
            <div className="retro-title-bar bg-gray-700">
              <div className="flex items-center space-x-2">
                <Monitor className="h-4 w-4" />
                <span>HEALTH_MONITOR.SYS</span>
              </div>
            </div>
            
            <div className="retro-content">
              <h3 className="text-sm font-bold text-gray-800 mb-4 font-mono uppercase">
                &gt; SERVICE HEALTH STATUS
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-200 border-2 border-gray-400">
                  <div className={`text-4xl mb-2 ${
                    getSuccessRate() >= 95 ? 'text-green-600' :
                    getSuccessRate() >= 80 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {getSuccessRate() >= 95 ? '🟢' :
                     getSuccessRate() >= 80 ? '🟡' : '🔴'}
                  </div>
                  <div className="text-sm font-bold font-mono text-gray-800 uppercase">SERVICE STATUS</div>
                  <div className="text-xs font-mono text-gray-600">
                    {getSuccessRate() >= 95 ? 'EXCELLENT' :
                     getSuccessRate() >= 80 ? 'GOOD' : 'NEEDS ATTENTION'}
                  </div>
                </div>

                <div className="text-center p-4 bg-gray-200 border-2 border-gray-400">
                  <div className={`text-4xl mb-2 ${
                    stats.average_execution_time_ms <= 50 ? 'text-green-600' :
                    stats.average_execution_time_ms <= 200 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {stats.average_execution_time_ms <= 50 ? '⚡' :
                     stats.average_execution_time_ms <= 200 ? '⏱️' : '🐌'}
                  </div>
                  <div className="text-sm font-bold font-mono text-gray-800 uppercase">PERFORMANCE</div>
                  <div className="text-xs font-mono text-gray-600">
                    {stats.average_execution_time_ms <= 50 ? 'FAST' :
                     stats.average_execution_time_ms <= 200 ? 'NORMAL' : 'SLOW'}
                  </div>
                </div>

                <div className="text-center p-4 bg-gray-200 border-2 border-gray-400">
                  <div className={`text-4xl mb-2 ${
                    stats.cache_hit_rate >= 50 ? 'text-green-600' :
                    stats.cache_hit_rate >= 20 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {stats.cache_hit_rate >= 50 ? '🚀' :
                     stats.cache_hit_rate >= 20 ? '💾' : '📦'}
                  </div>
                  <div className="text-sm font-bold font-mono text-gray-800 uppercase">CACHE EFFICIENCY</div>
                  <div className="text-xs font-mono text-gray-600">
                    {stats.cache_hit_rate >= 50 ? 'OPTIMIZED' :
                     stats.cache_hit_rate >= 20 ? 'MODERATE' : 'LOW'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default Statistics
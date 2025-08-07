import React from 'react'
import { AlertCircle, RefreshCw, Wifi, Server, AlertTriangle, Terminal, Skull } from 'lucide-react'

const ErrorMessage = ({ error, onRetry, showRetry = true }) => {
  if (!error) return null

  const getErrorIcon = () => {
    switch (error.type) {
      case 'network':
        return <Wifi className="h-5 w-5" />
      case 'server':
        return <Server className="h-5 w-5" />
      case 'validation':
        return <AlertTriangle className="h-5 w-5" />
      default:
        return <Skull className="h-5 w-5" />
    }
  }

  const getErrorTitle = () => {
    switch (error.type) {
      case 'network':
        return 'CONNECTION_ERROR.SYS'
      case 'server':
        return 'SERVER_FAULT.ERR'
      case 'validation':
        return 'INPUT_VALIDATION.FAIL'
      default:
        return 'SYSTEM_ERROR.CRITICAL'
    }
  }

  return (
    <div className="retro-window border-red-600">
      <div className="retro-title-bar bg-red-600">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4" />
          <span>{getErrorTitle()}</span>
        </div>
      </div>
      <div className="retro-content bg-red-900 text-red-100">
        <div className="flex items-start space-x-3">
          <div className="text-red-300 mt-0.5 glitch">
            {getErrorIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-red-200 mb-2 font-mono uppercase tracking-wider">
              FATAL ERROR DETECTED
            </h3>
            <div className="text-sm font-mono bg-black bg-opacity-50 p-2 border border-red-700 mb-3">
              <div className="text-red-300 text-xs mb-1">&gt; ERROR_MSG:</div>
              <div className="text-red-100 glitch">{error.message}</div>
            </div>
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="retro-btn bg-red-600 border-red-800 text-white text-xs px-3 py-1 flex items-center"
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                RETRY_OPERATION
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const FormError = ({ error }) => {
  if (!error) return null

  const errorMessage = typeof error === 'string' ? error : error.message

  return (
    <div className="mt-1 text-xs text-red-600 flex items-center space-x-1 font-mono font-bold">
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      <span className="uppercase tracking-wider">ERR: {errorMessage}</span>
    </div>
  )
}

export const EmptyStateError = ({ title, message, onRetry }) => {
  return (
    <div className="retro-window">
      <div className="retro-title-bar">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4" />
          <span>EMPTY_STATE.DAT</span>
        </div>
      </div>
      <div className="retro-content text-center py-8">
        <div className="retro-result mb-4 bg-yellow-900 text-yellow-100 border-yellow-600">
          <AlertCircle className="h-12 w-12 mx-auto mb-2 text-yellow-300" />
          <div className="text-lg font-bold font-mono uppercase tracking-wider mb-2">
            {title || 'NO DATA FOUND'}
          </div>
        </div>
        <p className="text-gray-600 mb-4 font-mono text-sm">
          &gt; {message || 'THE REQUESTED OPERATION RETURNED NO RESULTS'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="retro-btn flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            RETRY_OPERATION
          </button>
        )}
      </div>
    </div>
  )
}

export const CriticalError = ({ title = 'SYSTEM CRASH', message, onRestart }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      <div className="retro-window border-red-500 max-w-md">
        <div className="retro-title-bar bg-red-600">
          <div className="flex items-center space-x-2">
            <Skull className="h-4 w-4" />
            <span>CRITICAL_ERROR.BSoD</span>
          </div>
        </div>
        <div className="retro-content bg-blue-900 text-white">
          <div className="text-center py-4">
            <Skull className="h-16 w-16 mx-auto mb-4 text-red-400 glitch" />
            <h2 className="text-xl font-bold font-mono uppercase tracking-wider mb-2 text-red-300">
              {title}
            </h2>
            <div className="text-sm font-mono bg-black bg-opacity-50 p-3 border border-blue-700 mb-4">
              <div className="text-cyan-300 text-xs mb-2">&gt; EXCEPTION_INFO:</div>
              <div className="text-white break-words">
                {message || 'AN UNEXPECTED ERROR HAS OCCURRED'}
              </div>
            </div>
            <div className="text-xs text-gray-300 font-mono mb-4">
              SYSTEM HALT. CONTACT ADMINISTRATOR.
            </div>
            {onRestart && (
              <button
                onClick={onRestart}
                className="retro-btn bg-blue-600 border-blue-800 text-white"
              >
                RESTART_SYSTEM
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const NetworkError = ({ onRetry }) => {
  return (
    <div className="retro-window border-orange-500">
      <div className="retro-title-bar bg-orange-600">
        <div className="flex items-center space-x-2">
          <Wifi className="h-4 w-4" />
          <span>NETWORK_TIMEOUT.ERR</span>
        </div>
      </div>
      <div className="retro-content bg-orange-900 text-orange-100">
        <div className="text-center py-4">
          <Wifi className="h-12 w-12 mx-auto mb-4 text-orange-300" />
          <h3 className="text-lg font-bold font-mono uppercase tracking-wider mb-2">
            CONNECTION LOST
          </h3>
          <p className="text-sm font-mono mb-4">
            &gt; UNABLE TO REACH MATHAPI SERVER<br/>
            &gt; CHECK NETWORK CONNECTION
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="retro-btn bg-orange-600 border-orange-800 flex items-center mx-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              RECONNECT
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorMessage
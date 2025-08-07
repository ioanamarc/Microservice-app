import React, { useState } from 'react'
import { Zap, Calculator, Clock, Sparkles, TrendingUp, Terminal } from 'lucide-react'
import { mathApi } from '../../services/api'
import { useApi } from '../../hooks/useApi'
import LoadingSpinner, { InlineSpinner } from '../common/LoadingSpinner'
import ErrorMessage, { FormError } from '../common/ErrorMessage'
import { formatNumber, formatExecutionTime, formatTimestamp } from '../../utils/formatters'
import toast from 'react-hot-toast'

const PowerCalculator = () => {
  const [base, setBase] = useState('')
  const [exponent, setExponent] = useState('')
  const [result, setResult] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  
  const { loading, error, execute } = useApi()

  const validateInputs = () => {
    const errors = {}
    
    if (!base || base.trim() === '') {
      errors.base = 'BASE PARAMETER REQUIRED'
    } else {
      const num = Number(base)
      if (isNaN(num)) {
        errors.base = 'INVALID BASE NUMBER FORMAT'
      }
    }
    
    if (!exponent || exponent.trim() === '') {
      errors.exponent = 'EXPONENT PARAMETER REQUIRED'
    } else {
      const num = Number(exponent)
      if (isNaN(num)) {
        errors.exponent = 'INVALID EXPONENT NUMBER FORMAT'
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCalculate = async () => {
    if (!validateInputs()) return

    try {
      const response = await execute(
        () => mathApi.power(Number(base), Number(exponent)),
        'POWER CALCULATION COMPLETED!'
      )
      
      setResult(response)
      setValidationErrors({})
    } catch (err) {
      setResult(null)
    }
  }

  const handleClear = () => {
    setBase('')
    setExponent('')
    setResult(null)
    setValidationErrors({})
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleCalculate()
    }
  }

  // Quick examples
  const examples = [
    { base: 2, exponent: 3, result: 8, description: '2³ = 8' },
    { base: 10, exponent: 2, result: 100, description: '10² = 100' },
    { base: 5, exponent: 4, result: 625, description: '5⁴ = 625' },
    { base: 3, exponent: 5, result: 243, description: '3⁵ = 243' },
  ]

  const loadExample = (ex) => {
    setBase(ex.base.toString())
    setExponent(ex.exponent.toString())
    setValidationErrors({})
  }

  return (
    <div className="space-y-6">
      {/* Main Calculator Window */}
      <div className="retro-window">
        <div className="retro-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>POWER_CALC.EXE</span>
          </div>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-yellow-400 border border-yellow-600"></div>
            <div className="w-3 h-3 bg-green-400 border border-green-600"></div>
            <div className="w-3 h-3 bg-red-400 border border-red-600"></div>
          </div>
        </div>
        
        <div className="retro-content">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800 font-mono uppercase tracking-wider mb-1">
              POWER CALCULATOR MODULE
            </h2>
            <p className="text-sm text-gray-600 font-mono">
              &gt; COMPUTE BASE^EXPONENT OPERATIONS
            </p>
          </div>

          {/* Input Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="base" className="block text-sm font-bold text-gray-800 mb-2 font-mono uppercase">
                BASE_NUMBER:
              </label>
              <input
                id="base"
                type="text"
                value={base}
                onChange={(e) => setBase(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="ENTER BASE (EX: 2)"
                className={`retro-input w-full ${validationErrors.base ? 'border-red-500' : ''}`}
              />
              {validationErrors.base && (
                <div className="mt-1 text-xs text-red-600 font-mono font-bold">
                  ERROR: {validationErrors.base}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="exponent" className="block text-sm font-bold text-gray-800 mb-2 font-mono uppercase">
                EXPONENT:
              </label>
              <input
                id="exponent"
                type="text"
                value={exponent}
                onChange={(e) => setExponent(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="ENTER EXPONENT (EX: 10)"
                className={`retro-input w-full ${validationErrors.exponent ? 'border-red-500' : ''}`}
              />
              {validationErrors.exponent && (
                <div className="mt-1 text-xs text-red-600 font-mono font-bold">
                  ERROR: {validationErrors.exponent}
                </div>
              )}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex space-x-3 mb-4">
            <button
              onClick={handleCalculate}
              disabled={loading}
              className="retro-btn flex items-center px-4 py-2"
            >
              {loading ? (
                <>
                  <div className="retro-loading mr-2"></div>
                  COMPUTING...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  EXECUTE
                </>
              )}
            </button>

            <button
              onClick={handleClear}
              disabled={loading}
              className="retro-btn-secondary retro-btn px-4 py-2"
            >
              CLEAR
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-900 border-2 border-red-600 text-red-100 font-mono text-sm">
              <div className="font-bold text-red-300 mb-1">SYSTEM ERROR:</div>
              <div className="glitch">{error.message}</div>
              <button
                onClick={handleCalculate}
                className="mt-2 text-xs underline text-red-300 hover:text-red-100"
              >
                &gt; RETRY OPERATION
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Result Display Window */}
      {result && (
        <div className="retro-window">
          <div className="retro-title-bar flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4 w-4" />
              <span>RESULT_OUTPUT.DAT</span>
            </div>
            {result.cached && (
              <div className="retro-badge retro-badge-success text-xs">
                CACHED
              </div>
            )}
          </div>
          
          <div className="retro-content">
            <div className="retro-result mb-4 scanlines">
              <div className="text-sm text-cyan-400 mb-2 font-mono">
                CALCULATION: {result.parameters.base}^{result.parameters.exponent}
              </div>
              <div className="text-2xl font-bold font-mono break-all">
                {formatNumber(result.result)}
              </div>
            </div>

            {/* System Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="flex items-center space-x-2 text-gray-700">
                <Clock className="h-3 w-3 text-yellow-600" />
                <span>EXEC_TIME:</span>
                <span className="text-green-600 font-bold">{formatExecutionTime(result.execution_time_ms)}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Calculator className="h-3 w-3 text-yellow-600" />
                <span>OPERATION:</span>
                <span className="text-green-600 font-bold uppercase">{result.operation}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Sparkles className="h-3 w-3 text-yellow-600" />
                <span>TIMESTAMP:</span>
                <span className="text-green-600 font-bold">{formatTimestamp(result.timestamp).split(' ')[1]}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Examples Window */}
      <div className="retro-window">
        <div className="retro-title-bar">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4" />
            <span>QUICK_EXAMPLES.LIB</span>
          </div>
        </div>
        
        <div className="retro-content">
          <h3 className="text-sm font-bold text-gray-800 mb-4 font-mono uppercase">
            &gt; SAMPLE CALCULATIONS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => loadExample(example)}
                className="p-3 text-left bg-gray-100 border-2 border-gray-400 hover:border-yellow-500 hover:bg-yellow-50 transition-colors group font-mono"
                style={{
                  boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.5), inset -1px -1px 0 rgba(0,0,0,0.2)'
                }}
              >
                <div className="text-sm font-bold text-gray-900 group-hover:text-yellow-800">
                  {example.base}^{example.exponent}
                </div>
                <div className="text-xs text-gray-600 mt-1 group-hover:text-yellow-700">
                  {example.description}
                </div>
              </button>
            ))}
          </div>
          
          <div className="p-3 bg-blue-900 border-2 border-blue-600 text-blue-100">
            <div className="text-xs font-mono">
              <span className="text-blue-300 font-bold">SYSTEM TIP:</span> Powers grow exponentially! 
              Large exponents may result in very big numbers. Use with caution on production systems.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PowerCalculator
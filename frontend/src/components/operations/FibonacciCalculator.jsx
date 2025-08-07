import React, { useState } from 'react'
import { Hash, Calculator, Clock, Sparkles, TrendingUp, Terminal, Zap } from 'lucide-react'
import { mathApi } from '../../services/api'
import { useApi } from '../../hooks/useApi'
import LoadingSpinner, { InlineSpinner } from '../common/LoadingSpinner'
import ErrorMessage, { FormError } from '../common/ErrorMessage'
import { formatNumber, formatExecutionTime, formatTimestamp } from '../../utils/formatters'
import toast from 'react-hot-toast'

const FibonacciCalculator = () => {
  const [n, setN] = useState('')
  const [result, setResult] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  
  const { loading, error, execute } = useApi()

  const validateInputs = () => {
    const errors = {}
    
    if (!n || n.trim() === '') {
      errors.n = 'POSITION PARAMETER REQUIRED'
    } else {
      const num = Number(n)
      if (isNaN(num)) {
        errors.n = 'INVALID POSITION NUMBER FORMAT'
      } else if (!Number.isInteger(num)) {
        errors.n = 'POSITION MUST BE INTEGER'
      } else if (num < 0) {
        errors.n = 'POSITION MUST BE NON-NEGATIVE'
      } else if (num > 1000) {
        errors.n = 'POSITION EXCEEDS MAXIMUM (1000)'
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCalculate = async () => {
    if (!validateInputs()) return

    try {
      const response = await execute(
        () => mathApi.fibonacci(Number(n)),
        'FIBONACCI SEQUENCE CALCULATED!'
      )
      
      setResult(response)
      setValidationErrors({})
    } catch (err) {
      setResult(null)
    }
  }

  const handleClear = () => {
    setN('')
    setResult(null)
    setValidationErrors({})
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleCalculate()
    }
  }

  // Generate Fibonacci sequence for visualization
  const generateSequence = (position) => {
    if (position < 0) return []
    
    const sequence = []
    let a = 0, b = 1
    
    for (let i = 0; i <= Math.min(position, 15); i++) {
      if (i === 0) sequence.push(0)
      else if (i === 1) sequence.push(1)
      else {
        const next = a + b
        sequence.push(next)
        a = b
        b = next
      }
    }
    
    return sequence
  }

  // Quick examples
  const examples = [
    { n: 0, result: 0, description: 'F(0) = 0' },
    { n: 1, result: 1, description: 'F(1) = 1' },
    { n: 10, result: 55, description: 'F(10) = 55' },
    { n: 20, result: 6765, description: 'F(20) = 6,765' },
  ]

  const loadExample = (ex) => {
    setN(ex.n.toString())
    setValidationErrors({})
  }

  const sequence = n && !isNaN(Number(n)) && Number(n) >= 0 ? generateSequence(Number(n)) : []

  return (
    <div className="space-y-6">
      {/* Main Calculator Window */}
      <div className="retro-window">
        <div className="retro-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Hash className="h-4 w-4" />
            <span>FIBONACCI_CALC.EXE</span>
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
              FIBONACCI GENERATOR MODULE
            </h2>
            <p className="text-sm text-gray-600 font-mono">
              &gt; GENERATE NTH FIBONACCI NUMBER
            </p>
          </div>

          {/* Input Form */}
          <div className="max-w-md mb-6">
            <label htmlFor="n" className="block text-sm font-bold text-gray-800 mb-2 font-mono uppercase">
              POSITION (N):
            </label>
            <input
              id="n"
              type="text"
              value={n}
              onChange={(e) => setN(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="ENTER POSITION (0-1000)"
              className={`retro-input w-full ${validationErrors.n ? 'border-red-500' : ''}`}
            />
            {validationErrors.n && (
              <div className="mt-1 text-xs text-red-600 font-mono font-bold">
                ERROR: {validationErrors.n}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1 font-mono">
              &gt; SEQUENCE: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34...
            </p>
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
              <div className="font-bold text-red-300 mb-1">FIBONACCI ERROR:</div>
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

      {/* Sequence Visualization Window */}
      {sequence.length > 0 && (
        <div className="retro-window">
          <div className="retro-title-bar flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>SEQUENCE_PREVIEW.DAT</span>
            </div>
          </div>
          
          <div className="retro-content">
            <h3 className="text-sm font-bold text-gray-800 mb-4 font-mono uppercase">
              &gt; FIBONACCI SEQUENCE PREVIEW
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {sequence.map((num, index) => (
                <div
                  key={index}
                  className={`
                    px-3 py-2 text-sm font-mono font-bold border-2
                    ${index === sequence.length - 1 && Number(n) < 16
                      ? 'bg-yellow-400 text-gray-900 border-yellow-600 retro-badge'
                      : 'bg-gray-200 text-gray-800 border-gray-400'
                    }
                  `}
                  style={{
                    boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.5), inset -1px -1px 0 rgba(0,0,0,0.2)'
                  }}
                >
                  <div className="text-xs text-gray-600">F({index})</div>
                  <div>{formatNumber(num)}</div>
                </div>
              ))}
              {Number(n) > 15 && (
                <div className="px-3 py-2 text-sm font-mono font-bold bg-gray-300 text-gray-700 border-2 border-gray-500">
                  <div className="text-xs text-gray-600">...</div>
                  <div>MORE</div>
                </div>
              )}
            </div>
            
            {Number(n) > 15 && (
              <p className="text-xs text-gray-500 font-mono">
                &gt; SHOWING FIRST 16 NUMBERS. FULL RESULT BELOW.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Result Display Window */}
      {result && (
        <div className="retro-window">
          <div className="retro-title-bar flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4 w-4" />
              <span>FIB_RESULT.OUT</span>
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
                FIBONACCI F({result.parameters.n}) =
              </div>
              <div className="text-2xl font-bold font-mono break-all">
                {formatNumber(result.result)}
              </div>
              {result.parameters.n > 50 && (
                <div className="text-xs text-green-400 mt-2 font-mono">
                  DIGITS: {result.result.toString().length}
                </div>
              )}
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
            &gt; SAMPLE FIBONACCI CALCULATIONS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => loadExample(example)}
                className="p-3 text-left bg-gray-100 border-2 border-gray-400 hover:border-purple-500 hover:bg-purple-50 transition-colors group font-mono"
                style={{
                  boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.5), inset -1px -1px 0 rgba(0,0,0,0.2)'
                }}
              >
                <div className="text-sm font-bold text-gray-900 group-hover:text-purple-800">
                  F({example.n})
                </div>
                <div className="text-xs text-gray-600 mt-1 group-hover:text-purple-700">
                  {example.description}
                </div>
              </button>
            ))}
          </div>
          
          <div className="p-3 bg-blue-900 border-2 border-blue-600 text-blue-100">
            <div className="text-xs font-mono">
              <span className="text-blue-300 font-bold">NATURE FACT:</span> The Fibonacci sequence appears 
              in flower petals, pinecones, and spiral shells! Mathematical beauty in nature.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FibonacciCalculator
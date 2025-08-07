import React, { useState } from 'react'
import { Calculator, Clock, Sparkles, Info, Zap, Terminal, AlertTriangle } from 'lucide-react'
import { mathApi } from '../../services/api'
import { useApi } from '../../hooks/useApi'
import LoadingSpinner, { InlineSpinner } from '../common/LoadingSpinner'
import ErrorMessage, { FormError } from '../common/ErrorMessage'
import { formatNumber, formatExecutionTime, formatTimestamp } from '../../utils/formatters'
import toast from 'react-hot-toast'

const FactorialCalculator = () => {
  const [n, setN] = useState('')
  const [result, setResult] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  
  const { loading, error, execute } = useApi()

  const validateInputs = () => {
    const errors = {}
    
    if (!n || n.trim() === '') {
      errors.n = 'NUMBER PARAMETER REQUIRED'
    } else {
      const num = Number(n)
      if (isNaN(num)) {
        errors.n = 'INVALID NUMBER FORMAT'
      } else if (!Number.isInteger(num)) {
        errors.n = 'MUST BE WHOLE NUMBER'
      } else if (num < 0) {
        errors.n = 'MUST BE NON-NEGATIVE'
      } else if (num > 170) {
        errors.n = 'EXCEEDS MAX VALUE (170) - OVERFLOW RISK'
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCalculate = async () => {
    if (!validateInputs()) return

    try {
      const response = await execute(
        () => mathApi.factorial(Number(n)),
        'FACTORIAL CALCULATION COMPLETED!'
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

  // Calculate factorial visualization for small numbers
  const getFactorialSteps = (num) => {
    if (num < 0 || num > 10 || isNaN(num)) return null
    
    const steps = []
    let current = 1
    
    for (let i = 1; i <= num; i++) {
      current *= i
      steps.push({ step: i, value: current, formula: Array.from({length: i}, (_, k) => k + 1).join(' × ') })
    }
    
    return steps
  }

  // Quick examples
  const examples = [
    { n: 0, result: 1, description: '0! = 1 (by definition)' },
    { n: 5, result: 120, description: '5! = 120' },
    { n: 10, result: 3628800, description: '10! = 3,628,800' },
    { n: 15, result: '1.3 × 10¹²', description: '15! ≈ 1.3 trillion' },
  ]

  const loadExample = (ex) => {
    setN(ex.n.toString())
    setValidationErrors({})
  }

  const steps = n && !isNaN(Number(n)) && Number(n) >= 0 && Number(n) <= 10 ? getFactorialSteps(Number(n)) : null

  // Get size category for the result
  const getSizeCategory = (num) => {
    if (num <= 12) return { category: 'small', color: 'green', description: 'SMALL NUMBER' }
    if (num <= 20) return { category: 'medium', color: 'yellow', description: 'MEDIUM NUMBER' }
    if (num <= 50) return { category: 'large', color: 'orange', description: 'LARGE NUMBER' }
    if (num <= 100) return { category: 'very-large', color: 'red', description: 'VERY LARGE NUMBER' }
    return { category: 'extreme', color: 'purple', description: 'EXTREMELY LARGE NUMBER' }
  }

  const sizeInfo = n && !isNaN(Number(n)) ? getSizeCategory(Number(n)) : null

  return (
    <div className="space-y-6">
      {/* Main Calculator Window */}
      <div className="retro-window">
        <div className="retro-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>FACTORIAL_CALC.EXE</span>
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
              FACTORIAL CALCULATOR MODULE
            </h2>
            <p className="text-sm text-gray-600 font-mono">
              &gt; CALCULATE N! (N FACTORIAL)
            </p>
          </div>

          {/* Input Form */}
          <div className="max-w-md mb-6">
            <label htmlFor="n" className="block text-sm font-bold text-gray-800 mb-2 font-mono uppercase">
              NUMBER (N):
            </label>
            <input
              id="n"
              type="text"
              value={n}
              onChange={(e) => setN(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="ENTER NUMBER (0-170)"
              className={`retro-input w-full ${validationErrors.n ? 'border-red-500' : ''}`}
            />
            {validationErrors.n && (
              <div className="mt-1 text-xs text-red-600 font-mono font-bold">
                ERROR: {validationErrors.n}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1 font-mono">
              &gt; FACTORIAL: N! = N × (N-1) × (N-2) × ... × 2 × 1
            </p>
          </div>

          {/* Size Warning */}
          {sizeInfo && Number(n) > 20 && (
            <div className={`
              p-3 border-2 mb-4 font-mono text-sm
              ${sizeInfo.color === 'orange' ? 'bg-orange-900 border-orange-600 text-orange-100' :
                sizeInfo.color === 'red' ? 'bg-red-900 border-red-600 text-red-100' :
                'bg-purple-900 border-purple-600 text-purple-100'}
            `}>
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className={`h-4 w-4 ${
                  sizeInfo.color === 'orange' ? 'text-orange-300' :
                  sizeInfo.color === 'red' ? 'text-red-300' :
                  'text-purple-300'
                }`} />
                <span className="font-bold uppercase tracking-wider">
                  WARNING: {sizeInfo.description}
                </span>
              </div>
              <div className="text-xs">
                &gt; {Number(n) > 100 ? 
                  'EXTREMELY LARGE NUMBER WITH HUNDREDS OF DIGITS!' :
                  'LARGE NUMBER COMPUTATION - HIGH MEMORY USAGE!'
                }
              </div>
            </div>
          )}

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
              <div className="font-bold text-red-300 mb-1">FACTORIAL ERROR:</div>
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

      {/* Calculation Steps Window */}
      {steps && (
        <div className="retro-window">
          <div className="retro-title-bar flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>CALC_STEPS.LOG</span>
            </div>
          </div>
          
          <div className="retro-content">
            <h3 className="text-sm font-bold text-gray-800 mb-4 font-mono uppercase">
              &gt; CALCULATION BREAKDOWN
            </h3>
            
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-200 border border-gray-400 font-mono text-sm">
                  <div className="text-gray-800 font-bold">
                    {step.step}! = {step.formula}
                  </div>
                  <div className="text-green-700 font-bold">
                    = {formatNumber(step.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Result Display Window */}
      {result && (
        <div className="retro-window">
          <div className="retro-title-bar flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4 w-4" />
              <span>FACTORIAL_RESULT.OUT</span>
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
                FACTORIAL {result.parameters.n}! =
              </div>
              <div className="text-2xl font-bold font-mono break-all max-h-32 overflow-y-auto">
                {formatNumber(result.result)}
              </div>
              {result.result.toString().length > 50 && (
                <div className="text-xs text-green-400 mt-2 font-mono">
                  DIGITS: {result.result.toString().length}
                </div>
              )}
            </div>

            {/* Fun Facts */}
            {result.parameters.n >= 50 && (
              <div className="p-3 bg-blue-900 border-2 border-blue-600 text-blue-100 mb-4">
                <div className="text-xs font-mono">
                  <span className="text-blue-300 font-bold">ASTRONOMICAL:</span> {result.parameters.n}! has {result.result.toString().length} digits. 
                  More than estimated atoms in the observable universe (≈10⁸⁰)!
                </div>
              </div>
            )}

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
            &gt; SAMPLE FACTORIAL CALCULATIONS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => loadExample(example)}
                className="p-3 text-left bg-gray-100 border-2 border-gray-400 hover:border-green-500 hover:bg-green-50 transition-colors group font-mono"
                style={{
                  boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.5), inset -1px -1px 0 rgba(0,0,0,0.2)'
                }}
              >
                <div className="text-sm font-bold text-gray-900 group-hover:text-green-800">
                  {example.n}!
                </div>
                <div className="text-xs text-gray-600 mt-1 group-hover:text-green-700">
                  {example.description}
                </div>
              </button>
            ))}
          </div>
          
          <div className="p-3 bg-yellow-900 border-2 border-yellow-600 text-yellow-100">
            <div className="text-xs font-mono">
              <span className="text-yellow-300 font-bold">GROWTH RATE:</span> Factorials grow extremely fast! 
              70! has over 100 digits, and 170! is near floating-point limit.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FactorialCalculator
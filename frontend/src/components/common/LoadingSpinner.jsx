import React from 'react'
import { Loader2, Terminal, Zap } from 'lucide-react'

const LoadingSpinner = ({ size = 'medium', text = 'LOADING SYSTEM...' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="retro-window mb-4">
        <div className="retro-title-bar">
          <div className="flex items-center space-x-2">
            <Terminal className="h-4 w-4" />
            <span>SYSTEM.LOADING</span>
          </div>
        </div>
        <div className="retro-content">
          <div className="flex items-center justify-center space-x-4">
            <div className="retro-loading"></div>
            <div className="font-mono text-sm font-bold text-gray-800 uppercase tracking-wider">
              {text}
            </div>
          </div>
          
          {/* Retro progress bar */}
          <div className="mt-4">
            <div className="retro-progress">
              <div className="retro-progress-bar" style={{ width: '70%' }}></div>
            </div>
          </div>
          
          <div className="mt-2 text-xs font-mono text-gray-600 text-center">
            PLEASE WAIT... PROCESSING REQUEST
          </div>
        </div>
      </div>
    </div>
  )
}

export const InlineSpinner = ({ size = 'small' }) => {
  return <div className="retro-loading inline-block"></div>
}

export const CardLoading = ({ title = 'LOADING DATA...' }) => {
  return (
    <div className="retro-card">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/4 mb-4 opacity-50"></div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-600 rounded w-full opacity-30"></div>
          <div className="h-3 bg-gray-600 rounded w-5/6 opacity-30"></div>
          <div className="h-3 bg-gray-600 rounded w-4/6 opacity-30"></div>
        </div>
      </div>
      <div className="mt-4 text-xs font-mono text-gray-600 uppercase tracking-wider">
        {title}
      </div>
    </div>
  )
}

export const RetroProgress = ({ progress = 0, label = 'PROCESSING...', showPercentage = true }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-mono font-bold text-gray-700 uppercase tracking-wider">
          {label}
        </span>
        {showPercentage && (
          <span className="text-xs font-mono font-bold text-green-600">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="retro-progress">
        <div 
          className="retro-progress-bar transition-all duration-300 ease-out" 
          style={{ width: `${Math.max(progress, 0)}%` }}
        ></div>
      </div>
    </div>
  )
}

export const SystemBooting = ({ steps = [] }) => {
  const [currentStep, setCurrentStep] = React.useState(0)
  
  React.useEffect(() => {
    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [currentStep, steps.length])

  return (
    <div className="retro-window max-w-md mx-auto">
      <div className="retro-title-bar">
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4" />
          <span>SYSTEM_BOOT.EXE</span>
        </div>
      </div>
      <div className="retro-content">
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center space-x-2 font-mono text-xs">
              <div className={`w-2 h-2 ${
                index <= currentStep ? 'bg-green-400' : 'bg-gray-400'
              } rounded-full`}></div>
              <span className={`${
                index <= currentStep ? 'text-green-600' : 'text-gray-500'
              } font-bold`}>
                {step}
              </span>
              {index === currentStep && (
                <div className="retro-loading ml-2"></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <RetroProgress 
            progress={(currentStep / (steps.length - 1)) * 100} 
            label="SYSTEM INITIALIZATION"
            showPercentage={false}
          />
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner
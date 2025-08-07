import React from 'react'
import { useLocation } from 'react-router-dom'
import { Menu, ExternalLink } from 'lucide-react'

const Header = ({ onMenuClick }) => {
  const location = useLocation()

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/power':
        return 'Power Calculator'
      case '/fibonacci':
        return 'Fibonacci Generator' 
      case '/factorial':
        return 'Factorial Calculator'
      case '/history':
        return 'Request History'
      case '/statistics':
        return 'Service Statistics'
      case '/cache':
        return 'Cache Viewer'
      default:
        return 'Math Microservice'
    }
  }

  const getPageDescription = () => {
    switch (location.pathname) {
      case '/power':
        return 'Calculate base raised to the power of exponent'
      case '/fibonacci':
        return 'Generate the nth number in the Fibonacci sequence'
      case '/factorial':
        return 'Calculate the factorial of a number'
      case '/history':
        return 'View all mathematical operation requests'
      case '/statistics':
        return 'Monitor service performance and usage metrics'
      case '/cache':
        return 'View cached computation results'
      default:
        return 'Production-ready mathematical operations API'
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getPageTitle()}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {getPageDescription()}
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              API Docs
            </a>
            
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Calculator, Hash, Zap, History, BarChart3, Database, Activity, ExternalLink, Circle } from 'lucide-react'
import { mathApi } from '../../services/api.js'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [serviceStatus, setServiceStatus] = useState('unknown')
  const location = useLocation()

  // Check service health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await mathApi.health()
        setServiceStatus('healthy')
      } catch (error) {
        setServiceStatus('unhealthy')
      }
    }
    
    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const navigation = [
    {
      name: 'POWER CALC',
      href: '/power',
      icon: Zap,
      description: 'BASE^EXPONENT'
    },
    {
      name: 'FIBONACCI',
      href: '/fibonacci',
      icon: Hash,
      description: 'FIB SEQUENCE'
    },
    {
      name: 'FACTORIAL',
      href: '/factorial',
      icon: Calculator,
      description: 'N! CALCULATOR'
    },
    {
      name: 'REQ HISTORY',
      href: '/history',
      icon: History,
      description: 'VIEW LOGS'
    },
    {
      name: 'STATISTICS',
      href: '/statistics',
      icon: BarChart3,
      description: 'SYS METRICS'
    },
    {
      name: 'CACHE VIEW',
      href: '/cache',
      icon: Database,
      description: 'CACHED DATA'
    }
  ]

  const pageInfo = {
    '/power': {
      title: 'POWER CALCULATOR v2.1',
      description: 'CALCULATE BASE^EXPONENT OPERATIONS'
    },
    '/fibonacci': {
      title: 'FIBONACCI GENERATOR v1.8',
      description: 'GENERATE NTH FIBONACCI NUMBER'
    },
    '/factorial': {
      title: 'FACTORIAL CALCULATOR v1.5',
      description: 'COMPUTE N! FACTORIAL VALUES'
    },
    '/history': {
      title: 'REQUEST HISTORY LOG v3.2',
      description: 'VIEW MATHEMATICAL OPERATION LOGS'
    },
    '/statistics': {
      title: 'SYSTEM STATISTICS v2.0',
      description: 'MONITOR SERVICE PERFORMANCE METRICS'
    },
    '/cache': {
      title: 'CACHE VIEWER v1.9',
      description: 'INSPECT CACHED COMPUTATION RESULTS'
    }
  }

  const currentPageInfo = pageInfo[location.pathname] || {
    title: 'MATHAPI SYSTEM v4.0',
    description: 'PRODUCTION MATHEMATICAL OPERATIONS API'
  }

  const isActive = (href) => location.pathname === href

  // Prevent background scroll when sidebar is open (mobile)
  useEffect(() => {
    if (sidebarOpen) {  
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => document.body.classList.remove('overflow-hidden')
  }, [sidebarOpen])

  return (
    <div className="min-h-screen flex" style={{
      background: 'linear-gradient(135deg, #ff6ec7 0%, #bf5ae0 25%, #a855f7 50%, #7c3aed 75%, #6366f1 100%)'
    }}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Retro Sidebar */}
      <div className={`
        retro-sidebar fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Retro Logo Header */}
          <div className="retro-title-bar flex items-center justify-between h-12 px-4">
            <div className="flex items-center space-x-2">
              <Calculator className="h-6 w-6 text-white" />
              <span className="font-bold text-sm text-white">MATHAPI.EXE</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:text-yellow-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* System Status */}
          <div className="px-4 py-3 bg-black bg-opacity-20 border-b-2 border-cyan-600">
            <div className="flex items-center space-x-2">
              <Circle className={`w-3 h-3 ${
                serviceStatus === 'healthy' ? 'text-green-400 fill-current' : 
                serviceStatus === 'unhealthy' ? 'text-red-400 fill-current' : 'text-yellow-400 fill-current'
              }`} />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                SYS: {serviceStatus === 'healthy' ? 'ONLINE' : 
                     serviceStatus === 'unhealthy' ? 'OFFLINE' : 'BOOT...'}
              </span>
            </div>
            <div className="text-xs text-cyan-200 mt-1 font-mono">
              {new Date().toLocaleString('en-US', { 
                month: '2-digit', 
                day: '2-digit', 
                year: '2-digit',
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </div>
          </div>

          {/* Retro Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    retro-nav-item ${isActive(item.href) ? 'active' : ''}
                    group flex items-center p-2 rounded-none text-xs font-bold transition-all duration-200 ease-in-out
                  `}
                >
                  <Icon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className="text-xs opacity-75 font-normal">{item.description}</div>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Retro Footer */}
          <div className="p-4 border-t-2 border-cyan-600 bg-black bg-opacity-20">
            <div className="text-xs text-white font-mono">
              <div className="text-cyan-300">MATHAPI FRONTEND</div>
              <div className="text-yellow-300">BUILD: 1024.768</div>
              <div className="text-green-300">MEM: {Math.floor(Math.random() * 100 + 400)}KB</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Retro Header */}
        <header className="retro-header flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left side */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded text-white hover:text-yellow-300"
                >
                  <Menu className="h-5 w-5" />
                </button>
                
                <div>
                  <h1 className="text-lg lg:text-xl font-bold text-white font-mono uppercase tracking-wider">
                    {currentPageInfo.title}
                  </h1>
                  <p className="text-xs lg:text-sm text-cyan-200 mt-1 font-mono">
                    {currentPageInfo.description}
                  </p>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-2 lg:space-x-4">
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="retro-btn text-xs px-2 py-1 flex items-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">DOCS</span>
                </a>
                
                <div className="text-xs text-cyan-200 hidden md:block font-mono">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: '2-digit',
                    day: '2-digit',
                  }).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
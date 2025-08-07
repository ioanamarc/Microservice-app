import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import PowerCalculator from './components/operations/PowerCalculator.jsx'
import FibonacciCalculator from './components/operations/FibonacciCalculator.jsx'
import FactorialCalculator from './components/operations/FactorialCalculator.jsx'
import RequestHistory from './components/monitoring/RequestHistory.jsx'
import Statistics from './components/monitoring/Statistics.jsx'
import CacheViewer from './components/monitoring/CacheViewer.jsx'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/power" replace />} />
        <Route path="/power" element={<PowerCalculator />} />
        <Route path="/fibonacci" element={<FibonacciCalculator />} />
        <Route path="/factorial" element={<FactorialCalculator />} />
        <Route path="/history" element={<RequestHistory />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/cache" element={<CacheViewer />} />
      </Routes>
    </Layout>
  )
}

export default App
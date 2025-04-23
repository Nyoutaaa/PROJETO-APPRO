import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout({ children }) {
  const [isExpanded, setIsExpanded] = useState(false)

  console.log("[Layout] Renderizando...");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <div className={`flex-1 transition-all duration-300 ${isExpanded ? 'ml-56' : 'ml-20'}`}>
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface SmtpConfig {
  id: number
  name: string
  host: string
  port: number
  secure: boolean
  username: string
  fromEmail: string
  fromName?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  creator?: {
    id: number
    username: string
  }
}

interface SmtpConfigCardProps {
  config: SmtpConfig
  currentUser: any
  onEdit: () => void
  onDelete: () => void
  onTest: () => void
}

export default function SmtpConfigCard({
  config,
  currentUser,
  onEdit,
  onDelete,
  onTest
}: SmtpConfigCardProps) {
  const { darkMode } = useDarkMode()
  const [showActions, setShowActions] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const canEdit = currentUser?.role === 'admin'
  const canDelete = currentUser?.role === 'admin'
  const canTest = currentUser?.role === 'admin'

  return (
    <div className="border rounded-lg p-6 transition-all duration-300"
         style={{ 
           backgroundColor: darkMode ? '#1f2937' : '#ffffff',
           borderColor: darkMode ? '#374151' : '#e5e7eb'
         }}
         onMouseEnter={() => setShowActions(true)}
         onMouseLeave={() => setShowActions(false)}>
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                  {config.name}
                </h3>
                {config.isActive && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-900 dark:bg-green-900 dark:text-green-300 border border-green-200 dark:border-green-700">
                    Active
                  </span>
                )}
              </div>
              
              <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                {config.host}:{config.port}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="font-medium" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Username</p>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                {config.username}
              </p>
            </div>
            
            <div>
              <p className="font-medium" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>From Email</p>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                {config.fromEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
              config.secure 
                ? 'bg-green-50 text-green-900 dark:bg-green-900 dark:text-green-300 border border-green-200 dark:border-green-700'
                : 'bg-yellow-50 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700'
            }`}>
              {config.secure ? 'SSL/TLS' : 'No SSL'}
            </span>
            
            {config.fromName && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                {config.fromName}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Created</p>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                {formatDate(config.createdAt)}
              </p>
              {config.creator && (
                <p className="text-xs" style={{ color: darkMode ? '#6b7280' : '#6b7280' }}>
                  by {config.creator.username}
                </p>
              )}
            </div>
            
            <div>
              <p className="font-medium" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Updated</p>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                {formatDate(config.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-col space-y-2 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
          {canEdit && (
            <button
              onClick={onEdit}
              className="p-2 rounded-md transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              style={{ color: darkMode ? '#60a5fa' : '#2563eb' }}
              title="Edit Configuration"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          
          {canTest && (
            <button
              onClick={onTest}
              className="p-2 rounded-md transition-colors duration-200 hover:bg-green-50 dark:hover:bg-green-900/20"
              style={{ color: darkMode ? '#10b981' : '#059669' }}
              title="Test Configuration"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
          
          {canDelete && (
            <button
              onClick={onDelete}
              className="p-2 rounded-md transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-900/20"
              style={{ color: darkMode ? '#ef4444' : '#b91c1c' }}
              title="Delete Configuration"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${config.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-xs" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
              {config.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <span className="text-xs" style={{ color: darkMode ? '#6b7280' : '#6b7280' }}>
            ID: {config.id}
          </span>
        </div>
      </div>
    </div>
  )
}

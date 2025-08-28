'use client'

import { useState } from 'react'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface User {
  id: number
  username: string
  email?: string
  role: string
  status: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  creator?: {
    id: number
    username: string
  }
}

interface UserCardProps {
  user: User
  currentUser: any
  onEdit: () => void
  onDeactivate: () => void
  onResetPassword: () => void
  getRoleColor: (role: string) => string
  getStatusColor: (status: string) => string
}

export default function UserCard({
  user,
  currentUser,
  onEdit,
  onDeactivate,
  onResetPassword,
  getRoleColor,
  getStatusColor
}: UserCardProps) {
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

  const canEdit = currentUser?.role === 'admin' || 
                  (currentUser?.role === 'content_manager' && user.role !== 'admin') ||
                  currentUser?.userId === user.id

  const canDeactivate = currentUser?.role === 'admin' || 
                       (currentUser?.role === 'content_manager' && user.role !== 'admin')

  const canResetPassword = currentUser?.role === 'admin' || 
                          (currentUser?.role === 'content_manager' && user.role !== 'admin')

  const isOwnAccount = currentUser?.userId === user.id

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
              <span className="text-white font-medium text-sm">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                  {user.username}
                </h3>
                {isOwnAccount && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    You
                  </span>
                )}
              </div>
              
              {user.email && (
                <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  {user.email}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
              {user.role === 'content_manager' ? 'Content Manager' : 
               user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
            
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(user.status)}`}>
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Created</p>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                {formatDate(user.createdAt)}
              </p>
              {user.creator && (
                <p className="text-xs" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
                  by {user.creator.username}
                </p>
              )}
            </div>
            
            <div>
              <p className="font-medium" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Last Login</p>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
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
              title="Edit User"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          
          {canResetPassword && (
            <button
              onClick={onResetPassword}
              className="p-2 rounded-md transition-colors duration-200 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
              style={{ color: darkMode ? '#fbbf24' : '#d97706' }}
              title="Reset Password"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </button>
          )}
          
          {canDeactivate && user.status === 'active' && (
            <button
              onClick={onDeactivate}
              className="p-2 rounded-md transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-900/20"
              style={{ color: darkMode ? '#f87171' : '#dc2626' }}
              title="Deactivate User"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-xs" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
              {user.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <span className="text-xs" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
            ID: {user.id}
          </span>
        </div>
      </div>
    </div>
  )
}

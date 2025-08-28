'use client'

import { useState, useEffect } from 'react'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface User {
  id: number
  username: string
  email?: string
  role: string
  status: string
}

interface UserFormProps {
  user?: User | null
  onSubmit: (userData: any, userId?: number) => void
  onClose: () => void
  currentUser: any
}

export default function UserForm({ user, onSubmit, onClose, currentUser }: UserFormProps) {
  const { darkMode } = useDarkMode()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'content_manager',
    status: 'active'
  } as {
    username: string
    email: string
    password: string
    role: string
    status: string
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!user

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email || '',
        password: '',
        role: user.role,
        status: user.status
      })
    }
  }, [user])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = { ...formData }
      
      // Remove password if it's empty (for editing)
      if (isEditing && !submitData.password) {
        delete (submitData as any).password
      }

      // Remove email if it's empty
      if (!submitData.email) {
        delete (submitData as any).email
      }



      if (isEditing) {
        await onSubmit(submitData, user!.id)
      } else {
        await onSubmit(submitData)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const canAssignRole = (role: string) => {
    if (currentUser?.role === 'admin') return true
    if (currentUser?.role === 'content_manager' && role !== 'admin') return true
    return false
  }

  const roleOptions = [
    { value: 'content_manager', label: 'Content Manager', description: 'Can manage content and users' },
    { value: 'admin', label: 'Admin', description: 'Full system access' }
  ].filter(option => canAssignRole(option.value))

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(2px)' }}>
      <div className="rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
           style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b" 
             style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
          <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
            {isEditing ? 'Edit User' : 'Add New User'}
          </h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
              Username *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.username ? 'border-red-500' : ''
              }`}
              style={{
                backgroundColor: darkMode ? '#374151' : '#ffffff',
                borderColor: errors.username ? '#ef4444' : (darkMode ? '#4b5563' : '#d1d5db'),
                color: darkMode ? '#f9fafb' : '#111827'
              }}
              placeholder="Enter username"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : ''
              }`}
              style={{
                backgroundColor: darkMode ? '#374151' : '#ffffff',
                borderColor: errors.email ? '#ef4444' : (darkMode ? '#4b5563' : '#d1d5db'),
                color: darkMode ? '#f9fafb' : '#111827'
              }}
              placeholder="Enter email (optional)"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
              Password {!isEditing && '*'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : ''
              }`}
              style={{
                backgroundColor: darkMode ? '#374151' : '#ffffff',
                borderColor: errors.password ? '#ef4444' : (darkMode ? '#4b5563' : '#d1d5db'),
                color: darkMode ? '#f9fafb' : '#111827'
              }}
              placeholder={isEditing ? "Leave blank to keep current password" : "Enter password"}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
            {isEditing && (
              <p className="mt-1 text-xs" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
                Leave blank to keep current password
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: darkMode ? '#374151' : '#ffffff',
                borderColor: darkMode ? '#4b5563' : '#d1d5db',
                color: darkMode ? '#f9fafb' : '#111827'
              }}
            >
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: darkMode ? '#374151' : '#ffffff',
                borderColor: darkMode ? '#4b5563' : '#d1d5db',
                color: darkMode ? '#f9fafb' : '#111827'
              }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>



          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

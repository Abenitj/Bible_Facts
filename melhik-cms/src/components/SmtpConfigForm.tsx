'use client'

import { useState, useEffect } from 'react'
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
}

interface SmtpConfigFormProps {
  config?: SmtpConfig | null
  onSubmit: (configData: any, configId?: number) => void
  onClose: () => void
  currentUser: any
}

export default function SmtpConfigForm({ config, onSubmit, onClose, currentUser }: SmtpConfigFormProps) {
  const { darkMode } = useDarkMode()
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromEmail: '',
    fromName: '',
    isActive: true
  } as {
    name: string
    host: string
    port: number
    secure: boolean
    username: string
    password: string
    fromEmail: string
    fromName: string
    isActive: boolean
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!config

  useEffect(() => {
    if (config) {
      setFormData({
        name: config.name,
        host: config.host,
        port: config.port,
        secure: config.secure,
        username: config.username,
        password: '', // Don't populate password for security
        fromEmail: config.fromEmail,
        fromName: config.fromName || '',
        isActive: config.isActive
      })
    }
  }, [config])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Configuration name is required'
    }

    if (!formData.host.trim()) {
      newErrors.host = 'SMTP host is required'
    }

    if (!formData.port || formData.port < 1 || formData.port > 65535) {
      newErrors.port = 'Port must be between 1 and 65535'
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'Password is required for new configurations'
    }

    if (!formData.fromEmail.trim()) {
      newErrors.fromEmail = 'From email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.fromEmail)) {
      newErrors.fromEmail = 'Invalid email address'
    }

    if (formData.fromName && formData.fromName.length > 100) {
      newErrors.fromName = 'From name must be less than 100 characters'
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

      // Remove fromName if it's empty
      if (!submitData.fromName) {
        delete (submitData as any).fromName
      }

      if (isEditing) {
        await onSubmit(config!.id, submitData)
      } else {
        await onSubmit(submitData)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(2px)' }}>
      <div className="rounded-lg max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
           style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" 
             style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
              {isEditing ? 'Edit SMTP Configuration' : 'Create SMTP Configuration'}
            </h2>
            <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
              {isEditing ? 'Update email server settings' : 'Configure new email server'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Configuration Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                Configuration Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.name ? 'border-red-500' : ''
                }`}
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: errors.name ? '#ef4444' : (darkMode ? '#4b5563' : '#d1d5db'),
                  color: darkMode ? '#f9fafb' : '#111827'
                }}
                placeholder="e.g., Gmail SMTP, Outlook SMTP"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* SMTP Host */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                SMTP Host *
              </label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => handleInputChange('host', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.host ? 'border-red-500' : ''
                }`}
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: errors.host ? '#ef4444' : (darkMode ? '#4b5563' : '#d1d5db'),
                  color: darkMode ? '#f9fafb' : '#111827'
                }}
                placeholder="e.g., smtp.gmail.com"
              />
              {errors.host && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.host}</p>
              )}
            </div>

            {/* Port */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                Port *
              </label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.port ? 'border-red-500' : ''
                }`}
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: errors.port ? '#ef4444' : (darkMode ? '#4b5563' : '#d1d5db'),
                  color: darkMode ? '#f9fafb' : '#111827'
                }}
                placeholder="587"
                min="1"
                max="65535"
              />
              {errors.port && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.port}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                Username/Email *
              </label>
              <input
                type="email"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.username ? 'border-red-500' : ''
                }`}
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: errors.username ? '#ef4444' : (darkMode ? '#4b5563' : '#d1d5db'),
                  color: darkMode ? '#f9fafb' : '#111827'
                }}
                placeholder="your-email@gmail.com"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                Password {isEditing ? '' : '*'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
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
                <p className="mt-1 text-xs" style={{ color: darkMode ? '#6b7280' : '#6b7280' }}>
                  Leave blank to keep current password
                </p>
              )}
            </div>

            {/* From Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                From Email *
              </label>
              <input
                type="email"
                value={formData.fromEmail}
                onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.fromEmail ? 'border-red-500' : ''
                }`}
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: errors.fromEmail ? '#ef4444' : (darkMode ? '#4b5563' : '#d1d5db'),
                  color: darkMode ? '#f9fafb' : '#111827'
                }}
                placeholder="noreply@yourdomain.com"
              />
              {errors.fromEmail && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fromEmail}</p>
              )}
            </div>

            {/* From Name */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                From Name
              </label>
              <input
                type="text"
                value={formData.fromName}
                onChange={(e) => handleInputChange('fromName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.fromName ? 'border-red-500' : ''
                }`}
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: errors.fromName ? '#ef4444' : (darkMode ? '#4b5563' : '#d1d5db'),
                  color: darkMode ? '#f9fafb' : '#111827'
                }}
                placeholder="Your Company Name"
                maxLength={100}
              />
              {errors.fromName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fromName}</p>
              )}
            </div>
          </div>

          {/* Security and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Secure Connection */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                Security
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.secure}
                    onChange={(e) => handleInputChange('secure', e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                    Use SSL/TLS
                  </span>
                </label>
              </div>
            </div>

            {/* Active Status */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                Status
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                    Active Configuration
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Common SMTP Providers */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
              Quick Setup
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false
                  }))
                }}
                className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                style={{ borderColor: darkMode ? '#4b5563' : '#d1d5db' }}
              >
                <div className="font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Gmail</div>
                <div className="text-xs" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>smtp.gmail.com:587</div>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    host: 'smtp-mail.outlook.com',
                    port: 587,
                    secure: false
                  }))
                }}
                className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                style={{ borderColor: darkMode ? '#4b5563' : '#d1d5db' }}
              >
                <div className="font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Outlook</div>
                <div className="text-xs" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>smtp-mail.outlook.com:587</div>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    host: 'smtp.yahoo.com',
                    port: 587,
                    secure: false
                  }))
                }}
                className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                style={{ borderColor: darkMode ? '#4b5563' : '#d1d5db' }}
              >
                <div className="font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Yahoo</div>
                <div className="text-xs" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>smtp.yahoo.com:587</div>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Configuration' : 'Create Configuration')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-md transition-colors"
              style={{
                backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                color: darkMode ? '#d1d5db' : '#374151'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

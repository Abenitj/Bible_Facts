'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDarkMode } from '@/contexts/DarkModeContext'
import DarkModeToggle from '@/components/DarkModeToggle'

export default function ChangePasswordPage() {
  const router = useRouter()
  const { darkMode } = useDarkMode()
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<{ username: string; role: string } | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('cms_token')
    const storedUser = localStorage.getItem('cms_user')

    if (!storedToken || !storedUser) {
      router.push('/login')
      return
    }

    try {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setToken(storedToken)
    } catch (error) {
      localStorage.removeItem('cms_token')
      localStorage.removeItem('cms_user')
      router.push('/login')
    }
  }, [router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !token) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newPassword: formData.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Password changed successfully, redirect to dashboard
        router.push('/dashboard')
      } else {
        setErrors({ submit: data.error || 'Failed to change password' })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setErrors({ submit: 'Failed to change password' })
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <DarkModeToggle />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
            Welcome to Melhik CMS
          </h1>
          <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
            Please change your temporary password to continue
          </p>
        </div>

        {/* Welcome Card */}
        <div className="mb-6 p-4 rounded-lg border" style={{ 
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          borderColor: darkMode ? '#374151' : '#e5e7eb'
        }}>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: darkMode ? '#3b82f6' : '#dbeafe' }}>
                <span className="text-lg font-semibold" style={{ color: darkMode ? '#ffffff' : '#1e40af' }}>
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                Welcome, {user.username}!
              </h3>
              <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                Role: {user.role === 'admin' ? 'Administrator' : 'Content Manager'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
          <form onSubmit={handleSubmit} className="space-y-4">


            {/* New Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                New Password *
              </label>
              
              {/* Password Requirements */}
              <div className="mb-3 p-2 rounded-lg border" style={{
                backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
                borderColor: darkMode ? '#475569' : '#e2e8f0'
              }}>
                <p className="text-xs font-medium mb-1" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                  Password Requirements:
                </p>
                <ul className="text-xs space-y-1" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  <li className={`flex items-center ${formData.newPassword.length >= 6 ? 'text-green-600 dark:text-green-400' : ''}`}>
                    <svg className={`w-3 h-3 mr-1 ${formData.newPassword.length >= 6 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    At least 6 characters
                  </li>
                </ul>
              </div>
              
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.newPassword ? 'border-red-500' : ''
                }`}
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: errors.newPassword ? '#ef4444' : (darkMode ? '#4b5563' : '#d1d5db'),
                  color: darkMode ? '#f9fafb' : '#111827'
                }}
                placeholder="Enter your new password"
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                Confirm New Password *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.confirmPassword ? 'border-red-500' : ''
                }`}
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: errors.confirmPassword ? '#ef4444' : (darkMode ? '#4b5563' : '#d1d5db'),
                  color: darkMode ? '#f9fafb' : '#111827'
                }}
                placeholder="Confirm your new password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 rounded-md" style={{
                backgroundColor: darkMode ? '#7f1d1d' : '#fef2f2',
                borderColor: darkMode ? '#991b1b' : '#fecaca',
                color: darkMode ? '#fca5a5' : '#dc2626'
              }}>
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Changing Password...' : 'Change Password & Continue'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs" style={{ color: darkMode ? '#6b7280' : '#6b7280' }}>
            This is a one-time setup. You'll be redirected to the dashboard after changing your password.
          </p>
        </div>
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiCall } from '@/lib/api'
import { useDarkMode } from '@/contexts/DarkModeContext'
import { useUser } from '@/contexts/UserContext'
import DarkModeToggle from '@/components/DarkModeToggle'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [inactiveMessage, setInactiveMessage] = useState('')
  const router = useRouter()
  const { darkMode } = useDarkMode()
  const { login } = useUser()

  // Check for inactive user message on component mount
  useEffect(() => {
    const message = localStorage.getItem('inactive_message')
    if (message) {
      setInactiveMessage(message)
      localStorage.removeItem('inactive_message') // Clear the message after showing it
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await apiCall('api/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Use the UserContext login function
        await login(data.data.token, data.data.user)
        
        // Check if user needs to change password (first-time login)
        if (data.data.requiresPasswordChange) {
          router.push('/change-password')
        }
        // Note: login function already redirects to dashboard
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" 
         style={{ 
           background: darkMode 
             ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
             : '#f8fafc' 
         }}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center relative">
          <div className="absolute top-0 right-0">
            <DarkModeToggle />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: darkMode ? '#ffffff' : '#1e293b' }}>Melhik CMS</h1>
          <p style={{ color: darkMode ? '#93c5fd' : '#64748b' }}>Admin Dashboard Login</p>
        </div>

        <div className="rounded-lg border p-8" 
             style={{ 
               backgroundColor: darkMode ? '#1f2937' : '#ffffff',
               borderColor: darkMode ? '#374151' : '#e5e7eb'
             }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2"
                     style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                  color: darkMode ? '#ffffff' : '#000000'
                }}
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2"
                     style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                  color: darkMode ? '#ffffff' : '#000000'
                }}
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="border px-4 py-3 rounded-md"
                   style={{
                     backgroundColor: darkMode ? '#7f1d1d' : '#fef2f2',
                     borderColor: darkMode ? '#991b1b' : '#fecaca',
                     color: darkMode ? '#fca5a5' : '#dc2626'
                   }}>
                {error}
              </div>
            )}

            {inactiveMessage && (
              <div className="border px-4 py-3 rounded-md"
                   style={{
                     backgroundColor: darkMode ? '#7c2d12' : '#fff7ed',
                     borderColor: darkMode ? '#9a3412' : '#fed7aa',
                     color: darkMode ? '#fdba74' : '#ea580c'
                   }}>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium">Account Deactivated</p>
                    <p className="text-sm mt-1">{inactiveMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>


        </div>
      </div>
    </div>
  )
}


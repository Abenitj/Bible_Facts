'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiCall } from '@/lib/api'
import { useDarkMode } from '@/contexts/DarkModeContext'
import DarkModeToggle from '@/components/DarkModeToggle'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { darkMode } = useDarkMode()

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
        // Store token in localStorage
        localStorage.setItem('cms_token', data.data.token)
        localStorage.setItem('cms_user', JSON.stringify(data.data.user))
        
        // Redirect to dashboard
        router.push('/dashboard')
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


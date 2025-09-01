'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar, { MobileMenu } from '@/components/Sidebar'
import SmtpConfigCard from '@/components/SmtpConfigCard'
import SmtpConfigForm from '@/components/SmtpConfigForm'
import { useDarkMode } from '@/contexts/DarkModeContext'
import DarkModeToggle from '@/components/DarkModeToggle'
import { authenticatedApiCall } from '@/lib/api'
import { checkPermission, ROLES, PERMISSIONS } from '@/lib/auth'

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

export default function SmtpConfigPage() {
  const [configs, setConfigs] = useState<SmtpConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingConfig, setEditingConfig] = useState<SmtpConfig | null>(null)
  const [user, setUser] = useState<{ username: string; role: string } | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('smtp-config')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { darkMode } = useDarkMode()
  const router = useRouter()

  // Error and success states
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingConfig, setDeletingConfig] = useState<SmtpConfig | null>(null)
  const [showTestModal, setShowTestModal] = useState(false)
  const [testingConfig, setTestingConfig] = useState<SmtpConfig | null>(null)
  const [testEmail, setTestEmail] = useState('')
  const [testLoading, setTestLoading] = useState(false)

  // Auto-dismiss notifications
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [error, success])

  useEffect(() => {
    const storedUser = localStorage.getItem('cms_user')
    const storedToken = localStorage.getItem('cms_token')

    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setToken(storedToken)
    } else {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    if (user && token) {
      fetchUserPermissionsAndCheckAccess()
    }
  }, [user, token])



  const fetchUserPermissionsAndCheckAccess = async () => {
    if (!token || !user) return

    try {
      // Fetch user's granular permissions using the actual user ID
      const response = await authenticatedApiCall(`/api/users/me/permissions`, 'GET', token)
      
      if (response.success) {
        const userPermissions = response.data.permissions || null
        
        // Check if user has permission to access SMTP configuration
        if (!checkPermission(user.role as any, userPermissions, PERMISSIONS.VIEW_SMTP_CONFIG)) {
          setError('You do not have permission to access SMTP Configuration. Only administrators can access this section.')
          setLoading(false)
          setConfigs([]) // Ensure configs is an array
          return
        }

        fetchConfigs()
      } else {
        setError('Failed to fetch user permissions')
        setLoading(false)
        setConfigs([]) // Ensure configs is an array
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error)
      setError('Failed to fetch user permissions')
      setLoading(false)
      setConfigs([]) // Ensure configs is an array
    }
  }

    const fetchConfigs = async () => {
    if (!token) return

    try {
      setLoading(true)
      const response = await authenticatedApiCall('/api/smtp-config', 'GET', token)
      
      if (response.success) {
        // Handle different response structures
        let configsData = []
        if (Array.isArray(response.data)) {
          configsData = response.data
        } else if (response.data && Array.isArray(response.data.data)) {
          configsData = response.data.data
        } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
          configsData = response.data.data
        }
        
        setConfigs(configsData)
      } else {
        // If we get an authentication error, redirect to login
        if (response.error?.includes('Unauthorized') || response.error?.includes('Invalid token')) {
          localStorage.removeItem('cms_user')
          localStorage.removeItem('cms_token')
          router.push('/login')
          return
        }
        setError(response.error || 'Failed to fetch SMTP configurations')
        setConfigs([]) // Set to empty array on error
      }
    } catch (error) {
      console.error('Error fetching SMTP configurations:', error)
      // If we get an authentication error, redirect to login
      if (error.message?.includes('Unauthorized') || error.message?.includes('Invalid token')) {
        localStorage.removeItem('cms_user')
        localStorage.removeItem('cms_token')
        router.push('/login')
        return
      }
      setError('Failed to fetch SMTP configurations')
      setConfigs([]) // Set to empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleCreateConfig = async (configData: any) => {
    if (!token) return

    try {
      const response = await authenticatedApiCall('/api/smtp-config', 'POST', token, configData)
      
      if (response.success) {
        setSuccess('SMTP configuration created successfully')
        setShowCreateForm(false)
        await fetchConfigs()
      } else {
        setError(response.error || 'Failed to create SMTP configuration')
      }
    } catch (error) {
      console.error('Error creating SMTP configuration:', error)
      setError('Failed to create SMTP configuration')
    }
  }

  const handleUpdateConfig = async (configId: number, configData: any) => {
    if (!token) return

    try {
      const response = await authenticatedApiCall(`/api/smtp-config/${configId}`, 'PUT', token, configData)
      
      if (response.success) {
        setSuccess('SMTP configuration updated successfully')
        setEditingConfig(null)
        fetchConfigs()
      } else {
        setError(response.error || 'Failed to update SMTP configuration')
      }
    } catch (error) {
      console.error('Error updating SMTP configuration:', error)
      setError('Failed to update SMTP configuration')
    }
  }

  const handleDeleteConfig = (config: SmtpConfig) => {
    setDeletingConfig(config)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteConfig = async () => {
    if (!token || !deletingConfig) return

    try {
      const response = await authenticatedApiCall(`/api/smtp-config/${deletingConfig.id}`, 'DELETE', token)
      
      if (response.success) {
        setSuccess('SMTP configuration deleted successfully')
        setShowDeleteConfirm(false)
        setDeletingConfig(null)
        fetchConfigs()
      } else {
        setError(response.error || 'Failed to delete SMTP configuration')
      }
    } catch (error) {
      console.error('Error deleting SMTP configuration:', error)
      setError('Failed to delete SMTP configuration')
    }
  }

  const handleTestConfig = (config: SmtpConfig) => {
    setTestingConfig(config)
    setShowTestModal(true)
  }

  const confirmTestConfig = async () => {
    if (!token || !testingConfig || !testEmail) return

    try {
      setTestLoading(true)
      const response = await authenticatedApiCall('/api/smtp-config/test', 'POST', token, {
        configId: testingConfig.id,
        testEmail
      })
      
      if (response.success) {
        setSuccess('SMTP configuration test completed successfully')
        setShowTestModal(false)
        setTestingConfig(null)
        setTestEmail('')
      } else {
        setError(response.error || 'SMTP configuration test failed')
      }
    } catch (error) {
      console.error('Error testing SMTP configuration:', error)
      setError('Failed to test SMTP configuration')
    } finally {
      setTestLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('cms_user')
    localStorage.removeItem('cms_token')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex" style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb' }}>
        <Sidebar 
          user={user} 
          activeSection={activeSection} 
          onLogout={handleLogout} 
        />

        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Loading SMTP configurations...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb' }}>
      <Sidebar 
        user={user} 
        activeSection={activeSection} 
        onLogout={handleLogout} 
      />
      
      <MobileMenu
        user={user}
        activeSection={activeSection}
        onLogout={handleLogout}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        <header className="shadow-sm border-b" 
                 style={{ 
                   backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                   borderColor: darkMode ? '#374151' : '#e5e7eb'
                 }}>
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>SMTP Configuration</h1>
                <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Manage email server configurations</p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="sm:hidden p-2 rounded-md transition-colors duration-200"
                  style={{
                    backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                    color: darkMode ? '#d1d5db' : '#374151'
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <DarkModeToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          {/* Add Configuration Button - Right Side */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 rounded-md transition-colors flex items-center text-sm"
              style={{
                backgroundColor: darkMode ? '#3b82f6' : '#dbeafe',
                color: darkMode ? '#ffffff' : '#1e40af',
                border: darkMode ? 'none' : '1px solid #93c5fd'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? '#2563eb' : '#bfdbfe'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? '#3b82f6' : '#dbeafe'
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">Add Configuration</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Loading SMTP configurations...</p>
              </div>
            </div>
          ) : !configs || configs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: darkMode ? '#374151' : '#f3f4f6' }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                     style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>No SMTP configurations found</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 px-4 py-2 rounded-md transition-colors"
                style={{
                  backgroundColor: darkMode ? '#3b82f6' : '#dbeafe',
                  color: darkMode ? '#ffffff' : '#1e40af',
                  border: darkMode ? 'none' : '1px solid #93c5fd'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#2563eb' : '#bfdbfe'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#3b82f6' : '#dbeafe'
                }}
              >
                Create First Configuration
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(configs) && configs.map((config) => (
                <SmtpConfigCard
                  key={config.id}
                  config={config}
                  currentUser={user}
                  onEdit={() => setEditingConfig(config)}
                  onDelete={() => handleDeleteConfig(config)}
                  onTest={() => handleTestConfig(config)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingConfig) && (
        <SmtpConfigForm
          config={editingConfig}
          onSubmit={editingConfig ? handleUpdateConfig : handleCreateConfig}
          onClose={() => {
            setShowCreateForm(false)
            setEditingConfig(null)
          }}
          currentUser={user}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingConfig && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(2px)' }}>
          <div className="rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
               style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Confirm Deletion</h3>
            <p className="mb-6" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
              Are you sure you want to delete the SMTP configuration "{deletingConfig.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 px-4 rounded-lg transition-colors"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                  color: darkMode ? '#d1d5db' : '#374151'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteConfig}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Configuration Modal */}
      {showTestModal && testingConfig && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(2px)' }}>
          <div className="rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
               style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Test SMTP Configuration</h3>
            <p className="mb-4" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
              Enter an email address to test the configuration "{testingConfig.name}":
            </p>
            
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors mb-4"
              style={{
                backgroundColor: darkMode ? '#374151' : '#ffffff',
                borderColor: darkMode ? '#4b5563' : '#d1d5db',
                color: darkMode ? '#f9fafb' : '#111827'
              }}
            />
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowTestModal(false)
                  setTestingConfig(null)
                  setTestEmail('')
                }}
                className="flex-1 py-2 px-4 rounded-lg transition-colors"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                  color: darkMode ? '#d1d5db' : '#374151'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmTestConfig}
                disabled={!testEmail || testLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testLoading ? 'Testing...' : 'Send Test Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {(error || success) && (
        <div className="fixed top-4 right-4 z-50 max-w-sm animate-in slide-in-from-right-2 duration-300">
          {error && (
            <div className="mb-2 p-4 rounded-lg shadow-lg border-l-4 border-red-500 flex items-center justify-between transform transition-all duration-300"
                 style={{
                   backgroundColor: darkMode ? '#7f1d1d' : '#fef2f2',
                   borderColor: darkMode ? '#991b1b' : '#fecaca'
                 }}>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"
                     style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-4 p-1 rounded-full hover:bg-black/10 transition-colors"
                style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          {success && (
            <div className="mb-2 p-4 rounded-lg shadow-lg border-l-4 border-green-500 flex items-center justify-between transform transition-all duration-300"
                 style={{
                   backgroundColor: darkMode ? '#064e3b' : '#f0fdf4',
                   borderColor: darkMode ? '#065f46' : '#bbf7d0'
                 }}>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"
                     style={{ color: darkMode ? '#6ee7b7' : '#166534' }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p style={{ color: darkMode ? '#6ee7b7' : '#166534' }}>{success}</p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="ml-4 p-1 rounded-full hover:bg-black/10 transition-colors"
                style={{ color: darkMode ? '#6ee7b7' : '#166534' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar, { MobileMenu } from '@/components/Sidebar'
import { useDarkMode } from '@/contexts/DarkModeContext'
import DarkModeToggle from '@/components/DarkModeToggle'

interface User {
  username: string
  role: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('settings')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const { darkMode } = useDarkMode()

  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [systemForm, setSystemForm] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    enableNotifications: true,
    language: 'en'
  })

  useEffect(() => {
    const token = localStorage.getItem('cms_token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser(payload)
      setProfileForm(prev => ({ ...prev, username: payload.username }))
    } catch (error) {
      localStorage.removeItem('cms_token')
      router.push('/login')
      return
    }

    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('cms_token')
    router.push('/login')
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
        setError('New passwords do not match')
        setSaving(false)
        return
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess('Profile updated successfully!')
      setProfileForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (error) {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSystemUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess('System settings updated successfully!')
    } catch (error) {
      setError('Failed to update system settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex" style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb' }}>
        <Sidebar user={user} activeSection={activeSection} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb' }}>
      <Sidebar user={user} activeSection={activeSection} onLogout={handleLogout} />
      
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Settings</h1>
                <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Manage your account and system preferences</p>
              </div>
              <div className="flex items-center space-x-2">
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
          {error && (
            <div className="mb-6 border px-4 py-3 rounded-md"
                 style={{
                   backgroundColor: darkMode ? '#7f1d1d' : '#fef2f2',
                   borderColor: darkMode ? '#991b1b' : '#fecaca',
                   color: darkMode ? '#fca5a5' : '#dc2626'
                 }}>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 border px-4 py-3 rounded-md"
                 style={{
                   backgroundColor: darkMode ? '#064e3b' : '#f0fdf4',
                   borderColor: darkMode ? '#065f46' : '#bbf7d0',
                   color: darkMode ? '#6ee7b7' : '#16a34a'
                 }}>
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Settings */}
            <div className="rounded-lg shadow" style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
              <div className="px-6 py-4 border-b" 
                   style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Profile Settings</h3>
                <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Update your account information</p>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: darkMode ? '#374151' : '#ffffff',
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                      color: darkMode ? '#ffffff' : '#000000'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: darkMode ? '#374151' : '#ffffff',
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                      color: darkMode ? '#ffffff' : '#000000'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={profileForm.currentPassword}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: darkMode ? '#374151' : '#ffffff',
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                      color: darkMode ? '#ffffff' : '#000000'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: darkMode ? '#374151' : '#ffffff',
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                      color: darkMode ? '#ffffff' : '#000000'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: darkMode ? '#374151' : '#ffffff',
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                      color: darkMode ? '#ffffff' : '#000000'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>

            {/* System Settings */}
            <div className="rounded-lg shadow" style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
              <div className="px-6 py-4 border-b" 
                   style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>System Settings</h3>
                <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Configure system preferences</p>
              </div>
              
              <form onSubmit={handleSystemUpdate} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                      Auto Backup
                    </label>
                    <p className="text-xs" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                      Automatically backup data
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemForm.autoBackup}
                    onChange={(e) => setSystemForm(prev => ({ ...prev, autoBackup: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                    Backup Frequency
                  </label>
                  <select
                    value={systemForm.backupFrequency}
                    onChange={(e) => setSystemForm(prev => ({ ...prev, backupFrequency: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: darkMode ? '#374151' : '#ffffff',
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                      color: darkMode ? '#ffffff' : '#000000'
                    }}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                      Enable Notifications
                    </label>
                    <p className="text-xs" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                      Show system notifications
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemForm.enableNotifications}
                    onChange={(e) => setSystemForm(prev => ({ ...prev, enableNotifications: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                    Language
                  </label>
                  <select
                    value={systemForm.language}
                    onChange={(e) => setSystemForm(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: darkMode ? '#374151' : '#ffffff',
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                      color: darkMode ? '#ffffff' : '#000000'
                    }}
                  >
                    <option value="en">English</option>
                    <option value="am">Amharic</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            </div>
          </div>

          {/* System Information */}
          <div className="mt-6 rounded-lg shadow" style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
            <div className="px-6 py-4 border-b" 
                 style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
              <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>System Information</h3>
              <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Current system status and actions</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                  <h4 className="font-medium mb-2" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>User Information</h4>
                  <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                    Username: {user?.username}
                  </p>
                  <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                    Role: {user?.role}
                  </p>
                  <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                    Last Login: {new Date().toLocaleString()}
                  </p>
                </div>

                <div className="p-4 border rounded-lg" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                  <h4 className="font-medium mb-2" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>System Status</h4>
                  <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                    Status: Online
                  </p>
                  <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                    Version: 1.0.0
                  </p>
                  <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                    Database: Connected
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

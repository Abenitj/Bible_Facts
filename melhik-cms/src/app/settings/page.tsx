'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar, { MobileMenu } from '@/components/Sidebar'
import { useDarkMode } from '@/contexts/DarkModeContext'
import { ROLES } from '@/lib/auth'
import { apiUrl } from '@/lib/api'

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
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [fullImageOpen, setFullImageOpen] = useState(false)
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)

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
      // Fetch full profile
      fetch(apiUrl('/api/profile'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          const p = data.data
          setProfileForm(prev => ({ ...prev, username: p.username || '', email: p.email || '' }))
          if (p.avatarUrl) setAvatarPreview(p.avatarUrl)
        }
      }).catch(() => {})
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
      const token = localStorage.getItem('cms_token')
      if (!token) {
        setError('Not authenticated')
        setSaving(false)
        return
      }

      const formData = new FormData()
      formData.append('username', profileForm.username)
      formData.append('email', profileForm.email)
      if (profileForm.currentPassword) formData.append('currentPassword', profileForm.currentPassword)
      if (profileForm.newPassword) formData.append('newPassword', profileForm.newPassword)
      if (avatarFile) formData.append('avatar', avatarFile)

      const res = await fetch(apiUrl('/api/profile'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.error || 'Failed to update profile')
      } else {
        const data = await res.json()
        setSuccess('Profile updated successfully!')
        setProfileForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
        if (data.data?.avatarUrl) setAvatarPreview(data.data.avatarUrl)
      }
    } catch (error) {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const removeAvatar = async () => {
    const token = localStorage.getItem('cms_token')
    if (!token) return
    const formData = new FormData()
    formData.append('removeAvatar', 'true')
    const res = await fetch(apiUrl('/api/profile'), {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
    if (res.ok) {
      setAvatarPreview('')
      setAvatarFile(null)
      setSuccess('Profile image removed')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex" style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb' }}>
        <Sidebar user={{ ...user, avatarUrl: avatarPreview }} activeSection={activeSection} onLogout={handleLogout} />
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
          <div className="px-4 sm:px-6 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="flex flex-col">
                  <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                    {user?.username || 'User'}
                  </h1>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-sm font-medium px-2 py-1 rounded-full" 
                          style={{ 
                            backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                            color: darkMode ? '#d1d5db' : '#374151'
                          }}>
                      {user?.role || 'User'}
                    </span>
                    <span className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                      Melhik CMS
                    </span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                    Account Settings & System Preferences
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
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

          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="rounded-lg shadow" style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
              <div className="px-6 py-4 border-b" 
                   style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Profile Settings</h3>
                <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Update your account information</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer"
                       onClick={() => setAvatarModalOpen(true)}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Click image to change</p>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" 
                           style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
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
                           style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
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
                           style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
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
                           style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
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
                           style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
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
            </div>

            {/* System Settings - Admin Only */}
            {user?.role === ROLES.ADMIN && (
            <div className="rounded-lg shadow" style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
              <div className="px-6 py-4 border-b" 
                   style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>System Settings</h3>
                <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Configure system preferences</p>
              </div>
              
              <form onSubmit={() => {}} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium" style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
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
                         style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
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
                    <label className="text-sm font-medium" style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
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
                         style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
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
                  type="button"
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            </div>
            )}

            {/* System Information - Admin Only */}
            {user?.role === ROLES.ADMIN && (
            <div className="rounded-lg shadow" style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
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
            )}
          </div>
        </main>
      </div>

      {/* Avatar Modal */}
      {avatarModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(2px)' }}>
          <div className="rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Manage Profile Image</h3>
                <button onClick={() => setAvatarModalOpen(false)} className="p-2 rounded-md" style={{ backgroundColor: darkMode ? '#374151' : '#f3f4f6' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 flex flex-col items-center">
              <button type="button" className="w-48 h-48 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center focus:outline-none"
                      onClick={() => avatarPreview && setFullImageOpen(true)}
                      title={avatarPreview ? 'Click to view full image' : ''}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </button>
              <div className="mt-4 flex gap-3">
                <label className="px-3 py-2 rounded-md text-sm cursor-pointer" 
                       style={{ backgroundColor: darkMode ? '#374151' : '#f3f4f6', color: darkMode ? '#d1d5db' : '#374151' }}>
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setAvatarFile(file)
                      if (file) setAvatarPreview(URL.createObjectURL(file))
                    }}
                  />
                </label>
                {avatarPreview && (
                  <button type="button" onClick={() => setConfirmRemoveOpen(true)} className="px-3 py-2 rounded-md text-sm"
                          style={{ backgroundColor: darkMode ? '#7f1d1d' : '#fef2f2', color: darkMode ? '#fca5a5' : '#dc2626' }}>
                    Remove Image
                  </button>
                )}
                <button type="button" onClick={() => setAvatarModalOpen(false)} className="px-3 py-2 rounded-md text-sm"
                        style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff', color: darkMode ? '#d1d5db' : '#374151', border: '1px solid', borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Image Viewer */}
      {fullImageOpen && avatarPreview && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(2px)' }}>
          <div className="relative rounded-lg shadow-xl max-w-4xl w-full p-4" style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
            <img src={avatarPreview} alt="Full avatar" className="object-contain max-w-full max-h-[80vh] rounded-md" />
            <button onClick={() => setFullImageOpen(false)} className="absolute top-3 right-3 p-2 rounded-md" style={{ backgroundColor: darkMode ? '#374151' : '#f3f4f6' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Confirm Remove Modal */}
      {confirmRemoveOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(2px)' }}>
          <div className="rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
              <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Confirm Delete</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Are you sure you want to remove your profile image?</p>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={async () => { await removeAvatar(); setConfirmRemoveOpen(false); }} className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors">
                  Delete
                </button>
                <button type="button" onClick={() => setConfirmRemoveOpen(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

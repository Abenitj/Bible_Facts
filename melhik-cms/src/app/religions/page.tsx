'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar, { MobileMenu } from '../../components/Sidebar'
import { useDarkMode } from '@/contexts/DarkModeContext'
import DarkModeToggle from '@/components/DarkModeToggle'

interface Religion {
  id: number
  name: string
  nameEn: string
  description: string
  color: string
  createdAt: string
  updatedAt: string
  topics: { id: number; title: string }[]
}

interface ReligionFormData {
  name: string
  nameEn: string
  description: string
  color: string
}

export default function ReligionsPage() {
  const [religions, setReligions] = useState<Religion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingReligion, setEditingReligion] = useState<Religion | null>(null)
  const [formData, setFormData] = useState<ReligionFormData>({
    name: '',
    nameEn: '',
    description: '',
    color: '#8B4513'
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeSection, setActiveSection] = useState('religions')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<{ username: string; role: string } | null>(null)
  const router = useRouter()
  const { darkMode } = useDarkMode()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('cms_token')
    if (!token) {
      router.push('/login')
      return
    }

    // Get user info from token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser({ username: payload.username, role: payload.role })
    } catch (error) {
      router.push('/login')
      return
    }
    
    loadReligions()
  }, [])

  const loadReligions = async () => {
    try {
      const response = await fetch('/api/religions')
      if (response.ok) {
        const data = await response.json()
        setReligions(data.data)
      } else {
        setError('Failed to load religions')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const url = editingReligion ? `/api/religions/${editingReligion.id}` : '/api/religions'
      const method = editingReligion ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadReligions()
        resetForm()
        setShowForm(false)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save religion')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (religion: Religion) => {
    setEditingReligion(religion)
    setFormData({
      name: religion.name,
      nameEn: religion.nameEn || '',
      description: religion.description || '',
      color: religion.color
    })
    setShowForm(true)
  }

  const handleDelete = async (religion: Religion) => {
    if (!confirm(`Are you sure you want to delete "${religion.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/religions/${religion.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadReligions()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete religion')
      }
    } catch (error) {
      setError('Network error')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      description: '',
      color: '#8B4513'
    })
    setEditingReligion(null)
    setError('')
  }

  const handleCancel = () => {
    resetForm()
    setShowForm(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('cms_token')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex" style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb' }}>
        {/* Sidebar */}
        <Sidebar 
          user={user} 
          activeSection={activeSection} 
          onLogout={handleLogout} 
        />

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Loading religions...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb' }}>
      {/* Sidebar */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="shadow-sm border-b" 
                 style={{ 
                   backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                   borderColor: darkMode ? '#374151' : '#e5e7eb'
                 }}>
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Religion Management</h1>
                <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Manage religious categories and topics</p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Mobile Menu Button */}
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
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="hidden sm:inline">Add Religion</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
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

        {/* Religion Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                 style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
              <div className="px-6 py-4 border-b" 
                   style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                  {editingReligion ? 'Edit Religion' : 'Add New Religion'}
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                    Name (Amharic) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: darkMode ? '#374151' : '#ffffff',
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                      color: darkMode ? '#ffffff' : '#000000'
                    }}
                    placeholder="እስልምና"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                    Name (English)
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: darkMode ? '#374151' : '#ffffff',
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                      color: darkMode ? '#ffffff' : '#000000'
                    }}
                    placeholder="Islam"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: darkMode ? '#374151' : '#ffffff',
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                      color: darkMode ? '#ffffff' : '#000000'
                    }}
                    placeholder="Brief description about this religion..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                    Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-10 border rounded-md cursor-pointer"
                      style={{ borderColor: darkMode ? '#4b5563' : '#d1d5db' }}
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: darkMode ? '#374151' : '#ffffff',
                        borderColor: darkMode ? '#4b5563' : '#d1d5db',
                        color: darkMode ? '#ffffff' : '#000000'
                      }}
                      placeholder="#8B4513"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? 'Saving...' : (editingReligion ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Religions List */}
        <div className="rounded-lg shadow" 
             style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
          <div className="px-6 py-4 border-b" 
               style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
            <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
              All Religions ({religions.length})
            </h3>
          </div>
          
          {religions.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                   style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0v-3.5a2 2 0 011.5-1.5h.5m0 0V9H9m4.5 6v-3.5a2 2 0 00-1.5-1.5H9" />
              </svg>
              <p className="mb-4" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>No religions found</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add First Religion
              </button>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
              {religions.map((religion) => (
                <div key={religion.id} className="p-6 hover:bg-gray-50" 
                     style={{ 
                       backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                       borderColor: darkMode ? '#374151' : '#e5e7eb'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#f9fafb'
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.backgroundColor = darkMode ? '#1f2937' : '#ffffff'
                     }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: religion.color }}
                      ></div>
                      <div>
                        <h4 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>{religion.name}</h4>
                        {religion.nameEn && (
                          <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>{religion.nameEn}</p>
                        )}
                        {religion.description && (
                          <p className="text-sm mt-1" style={{ color: darkMode ? '#6b7280' : '#6b7280' }}>{religion.description}</p>
                        )}
                        <p className="text-xs mt-2" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
                          {religion.topics.length} topics • Created {new Date(religion.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(religion)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Edit religion"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(religion)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Delete religion"
                        disabled={religion.topics.length > 0}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  )
}

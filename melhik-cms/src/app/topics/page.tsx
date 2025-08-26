'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'
import { useDarkMode } from '@/contexts/DarkModeContext'
import DarkModeToggle from '@/components/DarkModeToggle'

interface Religion {
  id: number
  name: string
  nameEn: string
  color: string
}

interface Topic {
  id: number
  title: string
  titleEn: string
  description: string
  religionId: number
  createdAt: string
  updatedAt: string
  religion: Religion
  details: { id: number; version: number } | null
}

interface TopicFormData {
  title: string
  titleEn: string
  description: string
  religionId: number
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [religions, setReligions] = useState<Religion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [formData, setFormData] = useState<TopicFormData>({
    title: '',
    titleEn: '',
    description: '',
    religionId: 0
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeSection, setActiveSection] = useState('topics')
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

    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load religions first
      const religionsResponse = await fetch('/api/religions')
      if (religionsResponse.ok) {
        const religionsData = await religionsResponse.json()
        setReligions(religionsData.data)
      }

      // Load topics
      const topicsResponse = await fetch('/api/topics')
      if (topicsResponse.ok) {
        const topicsData = await topicsResponse.json()
        setTopics(topicsData.data)
      } else {
        setError('Failed to load topics')
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
      const url = editingTopic ? `/api/topics/${editingTopic.id}` : '/api/topics'
      const method = editingTopic ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadData()
        resetForm()
        setShowForm(false)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save topic')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic)
    setFormData({
      title: topic.title,
      titleEn: topic.titleEn || '',
      description: topic.description || '',
      religionId: topic.religionId
    })
    setShowForm(true)
  }

  const handleDelete = async (topic: Topic) => {
    if (!confirm(`Are you sure you want to delete "${topic.title}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/topics/${topic.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadData()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete topic')
      }
    } catch (error) {
      setError('Network error')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      titleEn: '',
      description: '',
      religionId: 0
    })
    setEditingTopic(null)
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
            <p className="mt-4" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Loading topics...</p>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="shadow-sm border-b" 
                 style={{ 
                   backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                   borderColor: darkMode ? '#374151' : '#e5e7eb'
                 }}>
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Topic Management</h1>
                <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Manage topics and content categories</p>
              </div>
              <div className="flex items-center space-x-3">
                <DarkModeToggle />
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Topic
              </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
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

        {/* Topic Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                 style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
              <div className="px-6 py-4 border-b" 
                   style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                  {editingTopic ? 'Edit Topic' : 'Add New Topic'}
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                    Religion *
                  </label>
                  <select
                    required
                    value={formData.religionId}
                    onChange={(e) => setFormData(prev => ({ ...prev, religionId: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    style={{
                      backgroundColor: darkMode ? '#374151' : '#ffffff',
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                      color: darkMode ? '#ffffff' : '#000000'
                    }}
                  >
                    <option value={0}>Select a religion</option>
                    {religions.map((religion) => (
                      <option key={religion.id} value={religion.id}>
                        {religion.name} ({religion.nameEn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                    Title (Amharic) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    style={{
                      backgroundColor: darkMode ? '#374151' : '#ffffff',
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                      color: darkMode ? '#ffffff' : '#000000'
                    }}
                    placeholder="ፍጹም አንድነት"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                    Title (English)
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    style={{
                      backgroundColor: darkMode ? '#374151' : '#ffffff',
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                      color: darkMode ? '#ffffff' : '#000000'
                    }}
                    placeholder="The Trinity"
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
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    style={{
                      backgroundColor: darkMode ? '#374151' : '#ffffff',
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                      color: darkMode ? '#ffffff' : '#000000'
                    }}
                    placeholder="Brief description about this topic..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? 'Saving...' : (editingTopic ? 'Update' : 'Create')}
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

        {/* Topics List */}
        <div className="rounded-lg shadow" style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
          <div className="px-6 py-4 border-b" 
               style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
            <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
              All Topics ({topics.length})
            </h3>
          </div>
          
          {topics.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                   style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="mb-4" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>No topics found</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Add First Topic
              </button>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
              {topics.map((topic) => (
                <div key={topic.id} className="p-6 hover:bg-gray-50" 
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
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: topic.religion.color }}
                      ></div>
                      <div>
                        <h4 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>{topic.title}</h4>
                        {topic.titleEn && (
                          <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>{topic.titleEn}</p>
                        )}
                        {topic.description && (
                          <p className="text-sm mt-1" style={{ color: darkMode ? '#6b7280' : '#6b7280' }}>{topic.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
                            Religion: {topic.religion.name}
                          </span>
                          <span className="text-xs" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
                            {topic.details ? `Content: v${topic.details.version}` : 'No content'}
                          </span>
                          <span className="text-xs" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
                            Created {new Date(topic.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => alert('Content editor coming soon!')}
                        className="text-purple-600 hover:text-purple-800 p-2"
                        title="Edit content"
                        disabled={!topic.details}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(topic)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Edit topic"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(topic)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Delete topic"
                        disabled={topic.details !== null}
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

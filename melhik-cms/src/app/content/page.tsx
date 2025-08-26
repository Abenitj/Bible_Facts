'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar, { MobileMenu } from '@/components/Sidebar'
import { useDarkMode } from '@/contexts/DarkModeContext'
import DarkModeToggle from '@/components/DarkModeToggle'

interface Topic {
  id: number
  title: string
  titleEn: string
  description: string
  religionId: number
  religion: {
    id: number
    name: string
    nameEn: string
    color: string
  }
  details: {
    id: number
    explanation: string
    bibleVerses: string
    keyPoints: string
    references: string
    version: number
  } | null
}

interface ContentFormData {
  explanation: string
  bibleVerses: string[]
  keyPoints: string[]
  references: Array<{
    verse: string
    text: string
    explanation: string
  }>
}

export default function ContentEditorPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeSection, setActiveSection] = useState('content')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<{ username: string; role: string } | null>(null)
  const router = useRouter()
  const { darkMode } = useDarkMode()

  const [formData, setFormData] = useState<ContentFormData>({
    explanation: '',
    bibleVerses: [''],
    keyPoints: [''],
    references: [{ verse: '', text: '', explanation: '' }]
  })

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return

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
      localStorage.removeItem('cms_token')
      router.push('/login')
      return
    }

    loadTopics()
  }, [router])

  const loadTopics = async () => {
    try {
      const response = await fetch('/api/topics')
      if (response.ok) {
        const data = await response.json()
        setTopics(data.data)
      } else {
        setError('Failed to load topics')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic)
    if (topic.details) {
      // Parse existing content
      setFormData({
        explanation: topic.details.explanation,
        bibleVerses: topic.details.bibleVerses ? JSON.parse(topic.details.bibleVerses) : [''],
        keyPoints: topic.details.keyPoints ? JSON.parse(topic.details.keyPoints) : [''],
        references: topic.details.references ? JSON.parse(topic.details.references) : [{ verse: '', text: '', explanation: '' }]
      })
    } else {
      // New content
      setFormData({
        explanation: '',
        bibleVerses: [''],
        keyPoints: [''],
        references: [{ verse: '', text: '', explanation: '' }]
      })
    }
  }

  const handleSave = async () => {
    if (!selectedTopic) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const url = selectedTopic.details 
        ? `/api/topics/${selectedTopic.id}/content` 
        : `/api/topics/${selectedTopic.id}/content`

      const response = await fetch(url, {
        method: selectedTopic.details ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          explanation: formData.explanation,
          bibleVerses: formData.bibleVerses.filter(v => v.trim()),
          keyPoints: formData.keyPoints.filter(k => k.trim()),
          references: formData.references.filter(r => r.verse.trim() && r.text.trim()),
          version: selectedTopic.details ? selectedTopic.details.version + 1 : 1
        }),
      })

      if (response.ok) {
        setSuccess('Content saved successfully!')
        await loadTopics() // Reload to get updated data
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save content')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const addBibleVerse = () => {
    setFormData(prev => ({
      ...prev,
      bibleVerses: [...prev.bibleVerses, '']
    }))
  }

  const removeBibleVerse = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bibleVerses: prev.bibleVerses.filter((_, i) => i !== index)
    }))
  }

  const updateBibleVerse = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      bibleVerses: prev.bibleVerses.map((verse, i) => i === index ? value : verse)
    }))
  }

  const addKeyPoint = () => {
    setFormData(prev => ({
      ...prev,
      keyPoints: [...prev.keyPoints, '']
    }))
  }

  const removeKeyPoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyPoints: prev.keyPoints.filter((_, i) => i !== index)
    }))
  }

  const updateKeyPoint = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      keyPoints: prev.keyPoints.map((point, i) => i === index ? value : point)
    }))
  }

  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      references: [...prev.references, { verse: '', text: '', explanation: '' }]
    }))
  }

  const removeReference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }))
  }

  const updateReference = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => 
        i === index ? { ...ref, [field]: value } : ref
      )
    }))
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
            <p className="mt-4" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Loading content editor...</p>
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Content Editor</h1>
                <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Create and edit topic content</p>
              </div>
              <div className="flex items-center space-x-2">
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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
            {/* Topic Selection */}
            <div className="lg:col-span-1">
              <div className="rounded-lg shadow" style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
                <div className="px-6 py-4 border-b" 
                     style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                  <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Select Topic</h3>
                  <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Choose a topic to edit content</p>
                </div>
                <div className="p-6">
                  {topics.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                           style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <p style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>No topics found</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {topics.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleTopicSelect(topic)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedTopic?.id === topic.id
                              ? 'border-blue-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{
                            backgroundColor: selectedTopic?.id === topic.id 
                              ? (darkMode ? '#1e40af' : '#eff6ff')
                              : (darkMode ? '#1f2937' : '#ffffff'),
                            borderColor: selectedTopic?.id === topic.id 
                              ? '#3b82f6'
                              : (darkMode ? '#374151' : '#e5e7eb')
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: topic.religion.color }}
                            ></div>
                            <div className="flex-1">
                              <h4 className="font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>{topic.title}</h4>
                              <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>{topic.religion.name}</p>
                              {topic.details && (
                                <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full"
                                      style={{
                                        backgroundColor: darkMode ? '#064e3b' : '#dcfce7',
                                        color: darkMode ? '#6ee7b7' : '#16a34a'
                                      }}>
                                  v{topic.details.version}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="lg:col-span-2">
              {selectedTopic ? (
                <div className="rounded-lg shadow" style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
                  <div className="px-6 py-4 border-b" 
                       style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                          {selectedTopic.title}
                        </h3>
                        <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                          {selectedTopic.religion.name} • {selectedTopic.details ? `Version ${selectedTopic.details.version}` : 'New Content'}
                        </p>
                      </div>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {saving ? 'Saving...' : 'Save Content'}
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Main Explanation */}
                    <div>
                      <label className="block text-sm font-medium mb-2" 
                             style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                        Main Explanation *
                      </label>
                      <textarea
                        value={formData.explanation}
                        onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                        rows={8}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{
                          backgroundColor: darkMode ? '#374151' : '#ffffff',
                          borderColor: darkMode ? '#4b5563' : '#d1d5db',
                          color: darkMode ? '#ffffff' : '#000000'
                        }}
                        placeholder="Write the main explanation for this topic..."
                      />
                    </div>

                    {/* Bible Verses */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                          Bible Verses
                        </label>
                        <button
                          type="button"
                          onClick={addBibleVerse}
                          className="text-sm transition-colors"
                          style={{ color: darkMode ? '#60a5fa' : '#2563eb' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = darkMode ? '#93c5fd' : '#1d4ed8'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = darkMode ? '#60a5fa' : '#2563eb'
                          }}
                        >
                          + Add Verse
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formData.bibleVerses.map((verse, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={verse}
                              onChange={(e) => updateBibleVerse(index, e.target.value)}
                              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{
                                backgroundColor: darkMode ? '#374151' : '#ffffff',
                                borderColor: darkMode ? '#4b5563' : '#d1d5db',
                                color: darkMode ? '#ffffff' : '#000000'
                              }}
                              placeholder="e.g., John 3:16"
                            />
                            {formData.bibleVerses.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeBibleVerse(index)}
                                className="transition-colors"
                                style={{ color: darkMode ? '#f87171' : '#dc2626' }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = darkMode ? '#fca5a5' : '#b91c1c'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = darkMode ? '#f87171' : '#dc2626'
                                }}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Points */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                          Key Points
                        </label>
                        <button
                          type="button"
                          onClick={addKeyPoint}
                          className="text-sm transition-colors"
                          style={{ color: darkMode ? '#60a5fa' : '#2563eb' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = darkMode ? '#93c5fd' : '#1d4ed8'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = darkMode ? '#60a5fa' : '#2563eb'
                          }}
                        >
                          + Add Point
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formData.keyPoints.map((point, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={point}
                              onChange={(e) => updateKeyPoint(index, e.target.value)}
                              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{
                                backgroundColor: darkMode ? '#374151' : '#ffffff',
                                borderColor: darkMode ? '#4b5563' : '#d1d5db',
                                color: darkMode ? '#ffffff' : '#000000'
                              }}
                              placeholder="Enter a key point..."
                            />
                            {formData.keyPoints.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeKeyPoint(index)}
                                className="transition-colors"
                                style={{ color: darkMode ? '#f87171' : '#dc2626' }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = darkMode ? '#fca5a5' : '#b91c1c'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = darkMode ? '#f87171' : '#dc2626'
                                }}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* References */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                          Detailed References
                        </label>
                        <button
                          type="button"
                          onClick={addReference}
                          className="text-sm transition-colors"
                          style={{ color: darkMode ? '#60a5fa' : '#2563eb' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = darkMode ? '#93c5fd' : '#1d4ed8'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = darkMode ? '#60a5fa' : '#2563eb'
                          }}
                        >
                          + Add Reference
                        </button>
                      </div>
                      <div className="space-y-4">
                        {formData.references.map((reference, index) => (
                          <div key={index} className="border rounded-lg p-4" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Reference {index + 1}</h4>
                              {formData.references.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeReference(index)}
                                  className="transition-colors"
                                  style={{ color: darkMode ? '#f87171' : '#dc2626' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = darkMode ? '#fca5a5' : '#b91c1c'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = darkMode ? '#f87171' : '#dc2626'
                                  }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={reference.verse}
                                onChange={(e) => updateReference(index, 'verse', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                                  color: darkMode ? '#ffffff' : '#000000'
                                }}
                                placeholder="Verse reference (e.g., John 3:16)"
                              />
                              <textarea
                                value={reference.text}
                                onChange={(e) => updateReference(index, 'text', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                                  color: darkMode ? '#ffffff' : '#000000'
                                }}
                                placeholder="Verse text..."
                              />
                              <textarea
                                value={reference.explanation}
                                onChange={(e) => updateReference(index, 'explanation', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                                  color: darkMode ? '#ffffff' : '#000000'
                                }}
                                placeholder="Explanation of this verse..."
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg shadow" style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
                  <div className="p-8 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                         style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium mb-2" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Select a Topic</h3>
                    <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Choose a topic from the left panel to start editing content</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

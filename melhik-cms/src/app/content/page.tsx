'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

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
  const [user, setUser] = useState<{ username: string; role: string } | null>(null)
  const router = useRouter()

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
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <Sidebar 
          user={user} 
          activeSection={activeSection} 
          onLogout={handleLogout} 
        />

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading content editor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        activeSection={activeSection} 
        onLogout={handleLogout} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Content Editor</h1>
                <p className="text-sm text-gray-600">Create and edit topic content</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Topic Selection */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Select Topic</h3>
                  <p className="text-sm text-gray-600">Choose a topic to edit content</p>
                </div>
                <div className="p-6">
                  {topics.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <p className="text-gray-500">No topics found</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {topics.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleTopicSelect(topic)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedTopic?.id === topic.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: topic.religion.color }}
                            ></div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{topic.title}</h4>
                              <p className="text-sm text-gray-500">{topic.religion.name}</p>
                              {topic.details && (
                                <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
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
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {selectedTopic.title}
                        </h3>
                        <p className="text-sm text-gray-600">
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Main Explanation *
                      </label>
                      <textarea
                        value={formData.explanation}
                        onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Write the main explanation for this topic..."
                      />
                    </div>

                    {/* Bible Verses */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Bible Verses
                        </label>
                        <button
                          type="button"
                          onClick={addBibleVerse}
                          className="text-blue-600 hover:text-blue-800 text-sm"
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
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., John 3:16"
                            />
                            {formData.bibleVerses.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeBibleVerse(index)}
                                className="text-red-600 hover:text-red-800"
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
                        <label className="block text-sm font-medium text-gray-700">
                          Key Points
                        </label>
                        <button
                          type="button"
                          onClick={addKeyPoint}
                          className="text-blue-600 hover:text-blue-800 text-sm"
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
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter a key point..."
                            />
                            {formData.keyPoints.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeKeyPoint(index)}
                                className="text-red-600 hover:text-red-800"
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
                        <label className="block text-sm font-medium text-gray-700">
                          Detailed References
                        </label>
                        <button
                          type="button"
                          onClick={addReference}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          + Add Reference
                        </button>
                      </div>
                      <div className="space-y-4">
                        {formData.references.map((reference, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-gray-700">Reference {index + 1}</h4>
                              {formData.references.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeReference(index)}
                                  className="text-red-600 hover:text-red-800"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Verse reference (e.g., John 3:16)"
                              />
                              <textarea
                                value={reference.text}
                                onChange={(e) => updateReference(index, 'text', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Verse text..."
                              />
                              <textarea
                                value={reference.explanation}
                                onChange={(e) => updateReference(index, 'explanation', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="bg-white rounded-lg shadow">
                  <div className="p-8 text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Topic</h3>
                    <p className="text-gray-500">Choose a topic from the left panel to start editing content</p>
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

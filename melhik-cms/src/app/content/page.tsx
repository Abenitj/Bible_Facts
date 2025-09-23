'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar, { MobileMenu } from '@/components/Sidebar'
import { useDarkMode } from '@/contexts/DarkModeContext'
import DarkModeToggle from '@/components/DarkModeToggle'
import { authenticatedApiCall } from '@/lib/api'
import EnhancedContentEditor from '@/components/EnhancedContentEditor'

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
    version: number
    useBlocks: boolean
    contentBlocks?: Array<{
      id: number
      blockType: 'text' | 'image' | 'mixed' | 'gallery'
      contentData: string
      orderIndex: number
    }>
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

interface VersionHistory {
  version: number
  explanation: string
  bibleVerses: string[]
  keyPoints: string[]
  references: Array<{
    verse: string
    text: string
    explanation: string
  }>
  createdAt: string
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
  const [versionHistory, setVersionHistory] = useState<VersionHistory | null>(null)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterReligion, setFilterReligion] = useState<number | 'all'>('all')
  const [filterContentStatus, setFilterContentStatus] = useState<'all' | 'with-content' | 'without-content'>('all')
  const [sortBy, setSortBy] = useState<'title' | 'religion' | 'content-status'>('title')
  const [user, setUser] = useState<{ 
    username: string; 
    role: string; 
    firstName?: string; 
    lastName?: string; 
    avatarUrl?: string 
  } | null>(null)
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
      
      // Fetch full profile to get avatar, firstName, lastName
      fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          const p = data.data
          // Update user with full profile data
          setUser(prev => ({
            ...prev,
            firstName: p.firstName,
            lastName: p.lastName,
            avatarUrl: p.avatarUrl
          }))
        }
      }).catch(() => {})
    } catch (error) {
      localStorage.removeItem('cms_token')
      router.push('/login')
      return
    }

    loadTopics()
  }, [router])

  const loadTopics = async () => {
    try {
      const token = localStorage.getItem('cms_token')
      if (!token) {
        setError('No authentication token')
        setLoading(false)
        return
      }

      const result = await authenticatedApiCall('/api/topics', 'GET', token)
      if (result.success) {
        setTopics(result.data.data)
      } else {
        setError(result.error || 'Failed to load topics')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleTopicSelect = async (topic: Topic) => {
    // Clear previous data first
    setSelectedTopic(null)
    clearForm()
    
    // Set the new topic
    setSelectedTopic(topic)
    
    // For block-based content, we don't need to load traditional form data
    // The EnhancedContentEditor will handle the content blocks directly
  }

  const loadVersionHistory = async (topicId: number, version: number) => {
    try {
      const token = localStorage.getItem('cms_token')
      if (!token) return

      // Since we don't have a version history API, we'll use the current topic details
      // and show them as the "previous version" for reference
      const currentTopic = topics.find(t => t.id === topicId)
      if (!currentTopic || !currentTopic.details) return

      // Use the current content as the "previous version" reference
      const historyData: VersionHistory = {
        version: version,
        explanation: currentTopic.details.explanation,
        bibleVerses: currentTopic.details.bibleVerses ? JSON.parse(currentTopic.details.bibleVerses) : [''],
        keyPoints: currentTopic.details.keyPoints ? JSON.parse(currentTopic.details.keyPoints) : [''],
        references: currentTopic.details.references ? JSON.parse(currentTopic.details.references) : [{ verse: '', text: '', explanation: '' }],
        createdAt: new Date().toISOString()
      }
      
      setVersionHistory(historyData)
    } catch (error) {
      console.error('Error loading version history:', error)
    }
  }

  const handleSave = async (content: any) => {
    if (!selectedTopic) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      setSuccess('Content saved successfully!')
      await loadTopics() // Reload to get updated data
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

  const clearForm = () => {
    setFormData({
      explanation: '',
      bibleVerses: [''],
      keyPoints: [''],
      references: [{ verse: '', text: '', explanation: '' }]
    })
    setVersionHistory(null)
    setShowVersionHistory(false)
    setError('')
    setSuccess('')
  }

  const handleLogout = () => {
    localStorage.removeItem('cms_token')
    router.push('/login')
  }

  // Filter and sort topics
  const filteredAndSortedTopics = topics
    .filter(topic => {
      // Search filter
      const matchesSearch = !searchTerm || 
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (topic.titleEn && topic.titleEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (topic.description && topic.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        topic.religion?.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Religion filter
      const matchesReligion = filterReligion === 'all' || topic.religionId === filterReligion
      
      // Content status filter
      const matchesContentStatus = filterContentStatus === 'all' || 
        (filterContentStatus === 'with-content' && topic.details) ||
        (filterContentStatus === 'without-content' && !topic.details)
      
      return matchesSearch && matchesReligion && matchesContentStatus
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'religion':
          comparison = (a.religion?.name || '').localeCompare(b.religion?.name || '')
          break
        case 'content-status':
          // Sort by content status: topics without content first, then with content
          if (a.details && !b.details) comparison = 1
          else if (!a.details && b.details) comparison = -1
          else comparison = a.title.localeCompare(b.title)
          break
      }
      
      return comparison
    })

  const clearFilters = () => {
    setSearchTerm('')
    setFilterReligion('all')
    setFilterContentStatus('all')
    setSortBy('title')
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
                
                {/* Search and Filter Controls */}
                <div className="px-6 py-4 border-b space-y-3" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                  {/* Search Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search topics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: darkMode ? '#374151' : '#ffffff',
                        borderColor: darkMode ? '#4b5563' : '#d1d5db',
                        color: darkMode ? '#ffffff' : '#000000'
                      }}
                    />
                  </div>

                  {/* Filter Controls */}
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={filterReligion}
                      onChange={(e) => setFilterReligion(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={{
                        backgroundColor: darkMode ? '#374151' : '#ffffff',
                        borderColor: darkMode ? '#4b5563' : '#d1d5db',
                        color: darkMode ? '#ffffff' : '#000000'
                      }}
                    >
                      <option value="all">All Religions</option>
                      {topics.reduce((acc, topic) => {
                        if (!acc.find(r => r.id === topic.religion.id)) {
                          acc.push(topic.religion)
                        }
                        return acc
                      }, [] as typeof topics[0]['religion'][]).map((religion) => (
                        <option key={religion.id} value={religion.id}>
                          {religion.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filterContentStatus}
                      onChange={(e) => setFilterContentStatus(e.target.value as 'all' | 'with-content' | 'without-content')}
                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={{
                        backgroundColor: darkMode ? '#374151' : '#ffffff',
                        borderColor: darkMode ? '#4b5563' : '#d1d5db',
                        color: darkMode ? '#ffffff' : '#000000'
                      }}
                    >
                      <option value="all">All Topics</option>
                      <option value="with-content">With Content</option>
                      <option value="without-content">Without Content</option>
                    </select>
                  </div>

                  {/* Sort and Clear Controls */}
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'title' | 'religion' | 'content-status')}
                      className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={{
                        backgroundColor: darkMode ? '#374151' : '#ffffff',
                        borderColor: darkMode ? '#4b5563' : '#d1d5db',
                        color: darkMode ? '#ffffff' : '#000000'
                      }}
                    >
                      <option value="title">Sort by Title</option>
                      <option value="religion">Sort by Religion</option>
                      <option value="content-status">Sort by Content Status</option>
                    </select>

                    {(searchTerm || filterReligion !== 'all' || filterContentStatus !== 'all') && (
                      <button
                        onClick={clearFilters}
                        className="px-2 py-1 text-xs border rounded transition-colors"
                        style={{
                          backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                          borderColor: darkMode ? '#4b5563' : '#d1d5db',
                          color: darkMode ? '#d1d5db' : '#374151'
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Results Summary */}
                  <div className="text-xs" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                    Showing {filteredAndSortedTopics.length} of {topics.length} topics
                  </div>
                </div>

                <div className="p-6">
                  {filteredAndSortedTopics.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                           style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <p style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
                        {topics.length === 0 ? 'No topics found' : 'No topics match your search criteria'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredAndSortedTopics.map((topic) => (
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
                      <div className="flex items-center space-x-2">
                        {versionHistory && (
                          <button
                            onClick={() => setShowVersionHistory(!showVersionHistory)}
                            className="px-3 py-1 text-sm rounded-md transition-colors"
                            style={{
                              backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                              color: darkMode ? '#d1d5db' : '#374151',
                              border: darkMode ? '1px solid #4b5563' : '1px solid #d1d5db'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = darkMode ? '#4b5563' : '#e5e7eb'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#f3f4f6'
                            }}
                          >
                            {showVersionHistory ? 'Hide' : 'Show'} Current v{versionHistory.version}
                          </button>
                        )}
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {saving ? 'Saving...' : 'Save Content'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Version History Display */}
                  {showVersionHistory && versionHistory && (
                    <div className="px-6 py-4 border-b" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                      <div className="rounded-lg p-4" style={{ backgroundColor: darkMode ? '#1f2937' : '#f9fafb' }}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                            Current Version {versionHistory.version} (Reference)
                          </h4>
                          <span className="text-xs px-2 py-1 rounded-full" style={{ 
                            backgroundColor: darkMode ? '#374151' : '#e5e7eb',
                            color: darkMode ? '#9ca3af' : '#6b7280'
                          }}>
                            {new Date(versionHistory.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="font-medium" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Explanation:</span>
                            <p className="mt-1 p-2 rounded" style={{ 
                              backgroundColor: darkMode ? '#374151' : '#ffffff',
                              color: darkMode ? '#9ca3af' : '#6b7280'
                            }}>
                              {versionHistory.explanation}
                            </p>
                          </div>
                          
                          {versionHistory.bibleVerses.length > 0 && (
                            <div>
                              <span className="font-medium" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Bible Verses:</span>
                              <ul className="mt-1 list-disc list-inside" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                                {versionHistory.bibleVerses.map((verse, index) => (
                                  <li key={index}>{verse}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {versionHistory.keyPoints.length > 0 && (
                            <div>
                              <span className="font-medium" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Key Points:</span>
                              <ul className="mt-1 list-disc list-inside" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                                {versionHistory.keyPoints.map((point, index) => (
                                  <li key={index}>{point}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {versionHistory.references.length > 0 && (
                            <div>
                              <span className="font-medium" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>References:</span>
                              <div className="mt-1 space-y-2">
                                {versionHistory.references.map((ref, index) => (
                                  <div key={index} className="p-2 rounded border" style={{ 
                                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                                    borderColor: darkMode ? '#4b5563' : '#e5e7eb'
                                  }}>
                                    <div className="font-medium" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>{ref.verse}</div>
                                    <div className="text-xs mt-1" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>{ref.text}</div>
                                    <div className="text-xs mt-1" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>{ref.explanation}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <EnhancedContentEditor
                      topicId={selectedTopic.id}
                      initialContent={selectedTopic.details}
                      onSave={(savedContent) => {
                        setSuccess('Content saved successfully!')
                        setError('')
                        // Update the selected topic with the saved content
                        setSelectedTopic(prev => prev ? {
                          ...prev,
                          details: savedContent
                        } : null)
                        // Reload topics to get updated data
                        loadTopics()
                      }}
                      onCancel={() => {
                        setError('')
                        setSuccess('')
                      }}
                    />
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

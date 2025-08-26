'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

interface User {
  id: number
  username: string
  role: string
}

interface Religion {
  id: number
  name: string
  description: string
  topics: Topic[]
}

interface Topic {
  id: number
  title: string
  religionId: number
  religion: {
    id: number
    name: string
  }
  details: {
    id: number
    version: number
  } | null
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [religions, setReligions] = useState<Religion[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('cms_token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser(payload)
    } catch (error) {
      localStorage.removeItem('cms_token')
      router.push('/login')
      return
    }

    // Load data
    const loadData = async () => {
      try {
        const religionsRes = await fetch('/api/religions')
        const topicsRes = await fetch('/api/topics')

        if (religionsRes.ok) {
          const religionsData = await religionsRes.json()
          setReligions(religionsData.data || religionsData)
        }

        if (topicsRes.ok) {
          const topicsData = await topicsRes.json()
          setTopics(topicsData.data || topicsData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('cms_token')
    localStorage.removeItem('cms_user')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          user={user}
          activeSection={activeSection}
          onLogout={handleLogout}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  const totalReligions = religions.length
  const totalTopics = topics.length
  const totalContent = topics.filter(topic => topic.details).length

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        user={user}
        activeSection={activeSection}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Religions</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalReligions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Topics</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalTopics}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Content</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalContent}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Religion Overview */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Religion Overview</h2>
            </div>
            <div className="p-6">
              {religions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No religions found. Add your first religion to get started.</p>
              ) : (
                <div className="space-y-4">
                  {religions.map((religion) => (
                    <div key={religion.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{religion.name}</h3>
                        <p className="text-sm text-gray-600">{religion.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {religion.topics?.length || 0} topics
                        </p>
                      </div>
                      <button
                        onClick={() => router.push('/religions')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Manage
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Topics */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Topics</h2>
            </div>
            <div className="p-6">
              {topics.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No topics found.</p>
              ) : (
                <div className="space-y-4">
                  {topics.slice(0, 5).map((topic) => (
                    <div key={topic.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{topic.title}</h3>
                        <p className="text-sm text-gray-600">{topic.religion?.name}</p>
                        {topic.details && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            v{topic.details.version}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => router.push('/content')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/religions')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Add Religion</p>
                    <p className="text-sm text-gray-600">Create a new religion</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/topics')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Add Topic</p>
                    <p className="text-sm text-gray-600">Create a new topic</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/content')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Edit Content</p>
                    <p className="text-sm text-gray-600">Manage topic content</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useDarkMode } from '@/contexts/DarkModeContext'
import DarkModeToggle from '@/components/DarkModeToggle'

interface User {
  username: string
  role: string
}

interface Religion {
  id: number
  name: string
  nameEn?: string
  description: string
  color?: string
  topics?: Topic[]
}

interface Topic {
  id: number
  title: string
  religion?: Religion
  details?: {
    version: number
  } | null
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [religions, setReligions] = useState<Religion[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  const { darkMode } = useDarkMode()

  useEffect(() => {
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
      <div className="flex h-screen" style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb' }}>
        <Sidebar
          user={user}
          activeSection={activeSection}
          onLogout={handleLogout}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  const totalReligions = religions.length
  const totalTopics = topics.length
  const totalContent = topics.filter(topic => topic.details).length
  const recentTopics = topics.slice(0, 5)
  const topicsWithoutContent = topics.filter(topic => !topic.details).length
  const completionRate = totalTopics > 0 ? Math.round((totalContent / totalTopics) * 100) : 0

  // Calculate religion distribution for chart
  const religionDistribution = religions.map(religion => ({
    name: religion.name,
    count: religion.topics?.length || 0,
    color: religion.color || '#3B82F6'
  }))

  // Mock activity data
  const recentActivity = [
    {
      id: 1,
      type: 'content_created',
      title: 'New content added to "Christianity Basics"',
      time: '2 hours ago',
      icon: '📝',
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'topic_created',
      title: 'Topic "Islamic Practices" created',
      time: '4 hours ago',
      icon: '📚',
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'religion_updated',
      title: 'Religion "Buddhism" updated',
      time: '1 day ago',
      icon: '🔄',
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'content_edited',
      title: 'Content edited in "Jewish Traditions"',
      time: '2 days ago',
      icon: '✏️',
      color: 'text-orange-600'
    }
  ]

  // Generate chart data
  const chartData = religionDistribution.map((item, index) => ({
    ...item,
    percentage: totalTopics > 0 ? Math.round((item.count / totalTopics) * 100) : 0,
    angle: (360 / religionDistribution.length) * index
  }))

  return (
    <div className="flex h-screen" style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb' }}>
      {/* Sidebar */}
      <Sidebar
        user={user}
        activeSection={activeSection}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto" style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb' }}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 p-4 rounded-lg border" 
               style={{ 
                 backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                 borderColor: darkMode ? '#374151' : '#e5e7eb'
               }}>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Dashboard</h1>
              <p className="mt-1" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                Welcome back! Here's what's happening with your content.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live</span>
                <span className="ml-2 px-2 py-1 rounded text-xs" style={{ 
                  backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                  color: darkMode ? '#d1d5db' : '#374151'
                }}>
                  {darkMode ? '🌙 Dark' : '☀️ Light'}
                </span>
              </div>
              <DarkModeToggle />
            </div>
          </div>


          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="rounded-lg p-6 border-l-4 border-blue-500 transition-all duration-300"
                 style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
              <div className="flex items-center">
                <div className="p-3 rounded-full" 
                     style={{ 
                       backgroundColor: darkMode ? '#1e40af' : '#dbeafe',
                       color: darkMode ? '#93c5fd' : '#2563eb'
                     }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Total Religions</p>
                  <p className="text-2xl font-bold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>{totalReligions}</p>
                  <p className="text-xs text-green-600">+{Math.floor(Math.random() * 3) + 1} this week</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg p-6 border-l-4 border-green-500 transition-all duration-300"
                 style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
              <div className="flex items-center">
                <div className="p-3 rounded-full" 
                     style={{ 
                       backgroundColor: darkMode ? '#059669' : '#dcfce7',
                       color: darkMode ? '#6ee7b7' : '#16a34a'
                     }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Total Topics</p>
                  <p className="text-2xl font-bold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>{totalTopics}</p>
                  <p className="text-xs text-green-600">+{Math.floor(Math.random() * 5) + 2} this week</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg p-6 border-l-4 border-purple-500 transition-all duration-300"
                 style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
              <div className="flex items-center">
                <div className="p-3 rounded-full" 
                     style={{ 
                       backgroundColor: darkMode ? '#7c3aed' : '#f3e8ff',
                       color: darkMode ? '#c4b5fd' : '#9333ea'
                     }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Content Created</p>
                  <p className="text-2xl font-bold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>{totalContent}</p>
                  <p className="text-xs text-green-600">+{Math.floor(Math.random() * 8) + 3} this week</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg p-6 border-l-4 border-orange-500 transition-all duration-300"
                 style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
              <div className="flex items-center">
                <div className="p-3 rounded-full" 
                     style={{ 
                       backgroundColor: darkMode ? '#ea580c' : '#fed7aa',
                       color: darkMode ? '#fdba74' : '#ea580c'
                     }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Completion Rate</p>
                  <p className="text-2xl font-bold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>{completionRate}%</p>
                  <p className="text-xs text-green-600">+{Math.floor(Math.random() * 5) + 2}% this week</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Religion Distribution Chart */}
            <div className="rounded-lg p-6 transition-all duration-300" 
                 style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Religion Distribution</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Topics per Religion</span>
                </div>
              </div>
              <div className="flex items-center justify-center h-64">
                {religionDistribution.length > 0 ? (
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {chartData.map((item, index) => {
                        const radius = 40
                        const circumference = 2 * Math.PI * radius
                        const strokeDasharray = circumference
                        const strokeDashoffset = circumference - (item.percentage / 100) * circumference
                        
                        return (
                          <circle
                            key={item.name}
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke={item.color}
                            strokeWidth="8"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            style={{
                              transformOrigin: '50% 50%',
                              transform: `rotate(${item.angle}deg)`
                            }}
                          />
                        )
                      })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>{totalTopics}</div>
                        <div className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Total Topics</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                         style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p>No data available</p>
                  </div>
                )}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {religionDistribution.slice(0, 4).map((item) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm truncate" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>{item.name}</span>
                    <span className="text-sm font-semibold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="rounded-lg p-6 transition-all duration-300" 
                 style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Recent Activity</h2>
                <button className="text-sm font-medium transition-colors hover:opacity-80"
                        style={{ 
                          color: darkMode ? '#60a5fa' : '#2563eb'
                        }}>
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg transition-all duration-200"
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
                    <div className={`text-2xl ${activity.color}`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                        {activity.title}
                      </p>
                      <p className="text-xs" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>{activity.time}</p>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Religion Overview */}
          <div className="rounded-lg mb-8 transition-all duration-300" 
               style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
            <div className="px-6 py-4 border-b flex items-center justify-between" 
                 style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
              <h2 className="text-xl font-semibold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Religion Overview</h2>
              <button
                onClick={() => router.push('/religions')}
                className="text-sm font-medium flex items-center transition-colors hover:opacity-80"
                style={{ color: darkMode ? '#60a5fa' : '#2563eb' }}
              >
                View All
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {religions.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                       style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="mb-4" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>No religions found. Add your first religion to get started.</p>
                  <button
                    onClick={() => router.push('/religions')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Religion
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {religions.map((religion) => (
                    <div key={religion.id} className="border rounded-lg p-4 transition-all duration-300"
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
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: religion.color }}
                          ></div>
                          <h3 className="font-semibold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>{religion.name}</h3>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full"
                              style={{
                                backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                                color: darkMode ? '#d1d5db' : '#374151'
                              }}>
                          {religion.topics?.length || 0} topics
                        </span>
                      </div>
                      <p className="text-sm mb-3 line-clamp-2" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>{religion.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>{religion.nameEn}</span>
                        <button
                          onClick={() => router.push('/religions')}
                          className="text-sm font-medium flex items-center transition-colors hover:opacity-80"
                          style={{ color: darkMode ? '#60a5fa' : '#2563eb' }}
                        >
                          Manage
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Topics */}
          <div className="rounded-lg mb-8 transition-all duration-300" 
               style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
            <div className="px-6 py-4 border-b flex items-center justify-between" 
                 style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
              <h2 className="text-xl font-semibold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Recent Topics</h2>
              <button
                onClick={() => router.push('/topics')}
                className="text-sm font-medium flex items-center transition-colors hover:opacity-80"
                style={{ color: darkMode ? '#60a5fa' : '#2563eb' }}
              >
                View All
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {topics.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                       style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="mb-4" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>No topics found.</p>
                  <button
                    onClick={() => router.push('/topics')}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Add Topic
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTopics.map((topic) => (
                    <div key={topic.id} className="flex items-center justify-between p-4 border rounded-lg transition-all duration-300"
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
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: topic.religion?.color }}
                        ></div>
                        <div>
                          <h3 className="font-semibold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>{topic.title}</h3>
                          <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>{topic.religion?.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {topic.details ? (
                              <span className="inline-block px-2 py-1 text-xs rounded-full"
                                    style={{
                                      backgroundColor: darkMode ? '#064e3b' : '#dcfce7',
                                      color: darkMode ? '#6ee7b7' : '#16a34a'
                                    }}>
                                ✓ Content Ready
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-1 text-xs rounded-full"
                                    style={{
                                      backgroundColor: darkMode ? '#78350f' : '#fef3c7',
                                      color: darkMode ? '#fbbf24' : '#d97706'
                                    }}>
                                ⚠ Needs Content
                              </span>
                            )}
                            {topic.details && (
                              <span className="text-xs" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>v{topic.details.version}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push('/content')}
                          className="text-sm font-medium flex items-center transition-colors hover:opacity-80"
                          style={{ color: darkMode ? '#60a5fa' : '#2563eb' }}
                        >
                          {topic.details ? 'Edit' : 'Add Content'}
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div className="rounded-lg transition-all duration-300" 
                 style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
              <div className="px-6 py-4 border-b" 
                   style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                <h2 className="text-xl font-semibold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => router.push('/religions')}
                    className="flex items-center p-4 border rounded-lg transition-all duration-300"
                    style={{ 
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      borderColor: darkMode ? '#374151' : '#e5e7eb'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#f9fafb'
                      e.currentTarget.style.borderColor = '#3b82f6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = darkMode ? '#1f2937' : '#ffffff'
                      e.currentTarget.style.borderColor = darkMode ? '#374151' : '#e5e7eb'
                    }}
                  >
                    <div className="p-3 rounded-full mr-3"
                         style={{ 
                           backgroundColor: darkMode ? '#1e40af' : '#dbeafe',
                           color: darkMode ? '#93c5fd' : '#2563eb'
                         }}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Add Religion</p>
                      <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Create a new religion</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/topics')}
                    className="flex items-center p-4 border rounded-lg transition-all duration-300"
                    style={{ 
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      borderColor: darkMode ? '#374151' : '#e5e7eb'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#f9fafb'
                      e.currentTarget.style.borderColor = '#16a34a'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = darkMode ? '#1f2937' : '#ffffff'
                      e.currentTarget.style.borderColor = darkMode ? '#374151' : '#e5e7eb'
                    }}
                  >
                    <div className="p-3 rounded-full mr-3"
                         style={{ 
                           backgroundColor: darkMode ? '#059669' : '#dcfce7',
                           color: darkMode ? '#6ee7b7' : '#16a34a'
                         }}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Add Topic</p>
                      <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Create a new topic</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/content')}
                    className="flex items-center p-4 border rounded-lg transition-all duration-300"
                    style={{ 
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      borderColor: darkMode ? '#374151' : '#e5e7eb'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#f9fafb'
                      e.currentTarget.style.borderColor = '#9333ea'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = darkMode ? '#1f2937' : '#ffffff'
                      e.currentTarget.style.borderColor = darkMode ? '#374151' : '#e5e7eb'
                    }}
                  >
                    <div className="p-3 rounded-full mr-3"
                         style={{ 
                           backgroundColor: darkMode ? '#7c3aed' : '#f3e8ff',
                           color: darkMode ? '#c4b5fd' : '#9333ea'
                         }}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Edit Content</p>
                      <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Manage topic content</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/sync')}
                    className="flex items-center p-4 border rounded-lg transition-all duration-300"
                    style={{ 
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      borderColor: darkMode ? '#374151' : '#e5e7eb'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#f9fafb'
                      e.currentTarget.style.borderColor = '#ea580c'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = darkMode ? '#1f2937' : '#ffffff'
                      e.currentTarget.style.borderColor = darkMode ? '#374151' : '#e5e7eb'
                    }}
                  >
                    <div className="p-3 rounded-full mr-3"
                         style={{ 
                           backgroundColor: darkMode ? '#ea580c' : '#fed7aa',
                           color: darkMode ? '#fdba74' : '#ea580c'
                         }}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Mobile Sync</p>
                      <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Sync with mobile app</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="rounded-lg transition-all duration-300" 
                 style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
              <div className="px-6 py-4 border-b" 
                   style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                <h2 className="text-xl font-semibold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Progress Overview</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {/* Completion Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Content Completion</span>
                      <span className="text-sm font-semibold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>{completionRate}%</span>
                    </div>
                    <div className="w-full rounded-full h-3" 
                         style={{ backgroundColor: darkMode ? '#374151' : '#e5e7eb' }}>
                      <div 
                        className="h-3 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${completionRate}%`,
                          background: darkMode 
                            ? 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)'
                            : 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)'
                        }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>{totalContent} of {totalTopics} topics have content</p>
                  </div>

                  {/* Topics Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg transition-all duration-300"
                         style={{ backgroundColor: darkMode ? '#064e3b' : '#f0fdf4' }}>
                      <div className="text-2xl font-bold" style={{ color: darkMode ? '#6ee7b7' : '#16a34a' }}>{totalContent}</div>
                      <div className="text-sm" style={{ color: darkMode ? '#6ee7b7' : '#15803d' }}>With Content</div>
                    </div>
                    <div className="text-center p-4 rounded-lg transition-all duration-300"
                         style={{ backgroundColor: darkMode ? '#78350f' : '#fef3c7' }}>
                      <div className="text-2xl font-bold" style={{ color: darkMode ? '#fbbf24' : '#d97706' }}>{topicsWithoutContent}</div>
                      <div className="text-sm" style={{ color: darkMode ? '#fbbf24' : '#b45309' }}>Need Content</div>
                    </div>
                  </div>

                  {/* Next Steps */}
                  {topicsWithoutContent > 0 && (
                    <div className="rounded-lg p-4 transition-all duration-300"
                         style={{ 
                           backgroundColor: darkMode ? '#1e40af' : '#eff6ff',
                           borderColor: darkMode ? '#3b82f6' : '#bfdbfe'
                         }}>
                      <h3 className="font-medium mb-2" style={{ color: darkMode ? '#dbeafe' : '#1e40af' }}>Next Steps</h3>
                      <p className="text-sm mb-3" style={{ color: darkMode ? '#93c5fd' : '#1d4ed8' }}>
                        You have {topicsWithoutContent} topics that need content. Start creating content to improve your completion rate.
                      </p>
                      <button
                        onClick={() => router.push('/content')}
                        className="px-4 py-2 rounded-md transition-colors text-sm hover:opacity-80"
                        style={{ 
                          backgroundColor: darkMode ? '#3b82f6' : '#2563eb',
                          color: '#ffffff'
                        }}
                      >
                        Start Creating Content
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

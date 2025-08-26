'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BookOpenIcon, 
  DocumentTextIcon, 
  UsersIcon, 
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface Religion {
  id: number
  name: string
  nameEn?: string
  description?: string
  color: string
  _count: {
    topics: number
  }
}

interface Topic {
  id: number
  title: string
  titleEn?: string
  description?: string
  religion: {
    id: number
    name: string
  }
}

export default function Dashboard() {
  const [religions, setReligions] = useState<Religion[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    religions: 0,
    topics: 0,
    topicDetails: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [religionsRes, topicsRes] = await Promise.all([
        fetch('/api/religions'),
        fetch('/api/topics')
      ])

      if (religionsRes.ok) {
        const religionsData = await religionsRes.json()
        setReligions(religionsData.data)
        setStats(prev => ({ ...prev, religions: religionsData.data.length }))
      }

      if (topicsRes.ok) {
        const topicsData = await topicsRes.json()
        setTopics(topicsData.data)
        setStats(prev => ({ ...prev, topics: topicsData.data.length }))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Melhik CMS</h1>
              <p className="text-gray-600">Content Management System</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/religions/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Religion
              </Link>
              <Link
                href="/topics/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Topic
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpenIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Religions</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.religions}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Topics</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.topics}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Topic Details</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.topicDetails}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Religions */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Religions</h3>
              <Link
                href="/religions"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                View all
              </Link>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topics
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Color
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {religions.slice(0, 5).map((religion) => (
                    <tr key={religion.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{religion.name}</div>
                          {religion.nameEn && (
                            <div className="text-sm text-gray-500">{religion.nameEn}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {religion._count.topics}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="h-6 w-6 rounded-full border border-gray-300"
                          style={{ backgroundColor: religion.color }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/religions/${religion.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/religions/${religion.id}/edit`}
                            className="text-green-600 hover:text-green-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Topics */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Topics</h3>
              <Link
                href="/topics"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                View all
              </Link>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Religion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topics.slice(0, 5).map((topic) => (
                    <tr key={topic.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{topic.title}</div>
                          {topic.titleEn && (
                            <div className="text-sm text-gray-500">{topic.titleEn}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {topic.religion.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/topics/${topic.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/topics/${topic.id}/edit`}
                            className="text-green-600 hover:text-green-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


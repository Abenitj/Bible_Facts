'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar, { MobileMenu } from '@/components/Sidebar'
import { useDarkMode } from '@/contexts/DarkModeContext'
import DarkModeToggle from '@/components/DarkModeToggle'
import UserForm from '@/components/UserForm'
import UserCard from '@/components/UserCard'
import { authenticatedApiCall } from '@/lib/api'

interface User {
  id: number
  username: string
  email?: string
  role: string
  status: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  creator?: {
    id: number
    username: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function UsersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
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

    loadUsers()
  }, [router, currentPage, filters])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('cms_token')
      
      console.log('Token from localStorage:', token ? 'Token exists' : 'No token')
      
      if (!token) {
        console.error('No token found')
        alert('No authentication token found. Please log in again.')
        router.push('/login')
        return
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filters.search && { search: filters.search }),
        ...(filters.role && { role: filters.role }),
        ...(filters.status && { status: filters.status })
      })

      console.log('Fetching users with params:', params.toString())

      const response = await authenticatedApiCall(`api/users?${params}`, token)

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data = await response.json()
        console.log('Users data:', data)
        setUsers(data.data || [])
        setPagination(data.pagination)
      } else {
        const errorData = await response.json()
        console.error('Failed to load users:', errorData)
        alert(`Failed to load users: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error loading users:', error)
      alert('Error loading users. Please check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (userData: any) => {
    try {
      const token = localStorage.getItem('cms_token')
      const response = await authenticatedApiCall('api/users', token, {
        method: 'POST',
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        setShowUserForm(false)
        loadUsers()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Failed to create user')
    }
  }

  const handleUpdateUser = async (userId: number, userData: any) => {
    try {
      const token = localStorage.getItem('cms_token')
      const response = await authenticatedApiCall(`api/users/${userId}`, token, {
        method: 'PUT',
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        setShowUserForm(false)
        setEditingUser(null)
        loadUsers()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user')
    }
  }

  const handleDeactivateUser = async (userId: number) => {
    if (!confirm('Are you sure you want to deactivate this user?')) {
      return
    }

    try {
      const token = localStorage.getItem('cms_token')
      const response = await authenticatedApiCall(`api/users/${userId}`, token, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadUsers()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to deactivate user')
      }
    } catch (error) {
      console.error('Error deactivating user:', error)
      alert('Failed to deactivate user')
    }
  }

  const handleResetPassword = async (userId: number) => {
    const newPassword = prompt('Enter new password (minimum 6 characters):')
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }

    try {
      const token = localStorage.getItem('cms_token')
      const response = await authenticatedApiCall(`api/users/${userId}/reset-password`, token, {
        method: 'POST',
        body: JSON.stringify({ newPassword })
      })

      if (response.ok) {
        alert('Password reset successfully')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Failed to reset password')
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const openUserForm = (user?: User) => {
    setEditingUser(user || null)
    setShowUserForm(true)
  }

  const closeUserForm = () => {
    setShowUserForm(false)
    setEditingUser(null)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'content_manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  if (loading) {
    return (
      <div className="flex h-screen" style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb' }}>
        <Sidebar
          user={user}
          activeSection="users"
          onLogout={() => {
            localStorage.removeItem('cms_token')
            router.push('/login')
          }}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb' }}>
      {/* Sidebar */}
      <Sidebar
        user={user}
        activeSection="users"
        onLogout={() => {
          localStorage.removeItem('cms_token')
          router.push('/login')
        }}
      />
      
      <MobileMenu
        user={user}
        activeSection="users"
        onLogout={() => {
          localStorage.removeItem('cms_token')
          router.push('/login')
        }}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto" style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb' }}>
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 p-4 rounded-lg border space-y-4 sm:space-y-0" 
               style={{ 
                 backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                 borderColor: darkMode ? '#374151' : '#e5e7eb'
               }}>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>User Management</h1>
              <p className="mt-1 text-sm sm:text-base" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                Manage system users and their permissions.
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
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
              
              <button
                onClick={() => openUserForm()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add User</span>
              </button>
              
              <button
                onClick={async () => {
                  const token = localStorage.getItem('cms_token')
                  console.log('Testing API with token:', token ? 'Token exists' : 'No token')
                  const response = await authenticatedApiCall('api/users', token)
                  const data = await response.json()
                  console.log('Test API response:', data)
                  alert(`API Test: ${response.status} - ${JSON.stringify(data)}`)
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Test API
              </button>
              
              <DarkModeToggle />
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 p-4 rounded-lg border" 
               style={{ 
                 backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                 borderColor: darkMode ? '#374151' : '#e5e7eb'
               }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                    borderColor: darkMode ? '#4b5563' : '#d1d5db',
                    color: darkMode ? '#f9fafb' : '#111827'
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                  Role
                </label>
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                    borderColor: darkMode ? '#4b5563' : '#d1d5db',
                    color: darkMode ? '#f9fafb' : '#111827'
                  }}
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="content_manager">Content Manager</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                    borderColor: darkMode ? '#4b5563' : '#d1d5db',
                    color: darkMode ? '#f9fafb' : '#111827'
                  }}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ search: '', role: '', status: '' })
                    setCurrentPage(1)
                  }}
                  className="w-full px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  style={{
                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                    borderColor: darkMode ? '#4b5563' : '#d1d5db',
                    color: darkMode ? '#f9fafb' : '#111827'
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                     style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <p className="mb-4" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>No users found.</p>
                <button
                  onClick={() => openUserForm()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add First User
                </button>
              </div>
            ) : (
              users.map((userItem) => (
                <UserCard
                  key={userItem.id}
                  user={userItem}
                  currentUser={user}
                  onEdit={() => openUserForm(userItem)}
                  onDeactivate={() => handleDeactivateUser(userItem.id)}
                  onResetPassword={() => handleResetPassword(userItem.id)}
                  getRoleColor={getRoleColor}
                  getStatusColor={getStatusColor}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  style={{
                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                    borderColor: darkMode ? '#4b5563' : '#d1d5db',
                    color: darkMode ? '#f9fafb' : '#111827'
                  }}
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 border rounded-md transition-colors ${
                      page === pagination.page 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    style={{
                      backgroundColor: page === pagination.page ? undefined : (darkMode ? '#374151' : '#ffffff'),
                      borderColor: page === pagination.page ? undefined : (darkMode ? '#4b5563' : '#d1d5db'),
                      color: page === pagination.page ? undefined : (darkMode ? '#f9fafb' : '#111827')
                    }}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  style={{
                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                    borderColor: darkMode ? '#4b5563' : '#d1d5db',
                    color: darkMode ? '#f9fafb' : '#111827'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          user={editingUser}
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
          onClose={closeUserForm}
          currentUser={user}
        />
      )}
    </div>
  )
}

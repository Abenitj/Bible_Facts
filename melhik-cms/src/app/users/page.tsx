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
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [showPasswordResetConfirm, setShowPasswordResetConfirm] = useState(false)
  const [resettingPasswordUser, setResettingPasswordUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false)
  const [deletingAccountUser, setDeletingAccountUser] = useState<User | null>(null)
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
        setError('No authentication token found. Please log in again.')
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
        setError('')
      } else {
        const errorData = await response.json()
        console.error('Failed to load users:', errorData)
        setError(`Failed to load users: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error loading users:', error)
      setError('Error loading users. Please check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (userData: any, userId?: number) => {
    try {
      const token = localStorage.getItem('cms_token')
      const response = await authenticatedApiCall('api/users', token!, {
        method: 'POST',
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        setShowUserForm(false)
        setSuccess('User created successfully')
        loadUsers()
      } else {
        const error = await response.json()
        setError(error.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      setError('Failed to create user')
    }
  }

  const handleUpdateUser = async (userData: any, userId?: number) => {
    try {
      const token = localStorage.getItem('cms_token')
      const response = await authenticatedApiCall(`api/users/${userId!}`, token!, {
        method: 'PUT',
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        setShowUserForm(false)
        setEditingUser(null)
        setSuccess('User updated successfully')
        loadUsers()
      } else {
        const error = await response.json()
        setError(error.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      setError('Failed to update user')
    }
  }

  const handleDeactivateUser = (user: User) => {
    setDeletingUser(user)
    setShowDeleteConfirm(true)
  }

  const confirmDeactivateUser = async () => {
    if (!deletingUser) return

    try {
      const token = localStorage.getItem('cms_token')
      const response = await authenticatedApiCall(`api/users/${deletingUser.id}`, token!, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('User deactivated successfully')
        loadUsers()
      } else {
        const error = await response.json()
        setError(error.error || 'Failed to deactivate user')
      }
    } catch (error) {
      console.error('Error deactivating user:', error)
      setError('Failed to deactivate user')
    } finally {
      setShowDeleteConfirm(false)
      setDeletingUser(null)
    }
  }

  const cancelDeactivateUser = () => {
    setShowDeleteConfirm(false)
    setDeletingUser(null)
  }

  const handleDeleteAccount = (user: User) => {
    setDeletingAccountUser(user)
    setShowDeleteAccountConfirm(true)
  }

  const confirmDeleteAccount = async () => {
    if (!deletingAccountUser) return

    try {
      const token = localStorage.getItem('cms_token')
      const response = await authenticatedApiCall(`api/users/${deletingAccountUser.id}/delete`, token!, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('User account permanently deleted successfully')
        loadUsers()
      } else {
        const error = await response.json()
        setError(error.error || 'Failed to delete user account')
      }
    } catch (error) {
      console.error('Error deleting user account:', error)
      setError('Failed to delete user account')
    } finally {
      setShowDeleteAccountConfirm(false)
      setDeletingAccountUser(null)
    }
  }

  const cancelDeleteAccount = () => {
    setShowDeleteAccountConfirm(false)
    setDeletingAccountUser(null)
  }

  const handleResetPassword = (user: User) => {
    setResettingPasswordUser(user)
    setNewPassword('')
    setShowPasswordResetConfirm(true)
  }

  const confirmResetPassword = async () => {
    if (!resettingPasswordUser || !newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    try {
      const token = localStorage.getItem('cms_token')
      const response = await authenticatedApiCall(`api/users/${resettingPasswordUser.id}/reset-password`, token!, {
        method: 'POST',
        body: JSON.stringify({ newPassword })
      })

      if (response.ok) {
        setSuccess('Password reset successfully')
      } else {
        const error = await response.json()
        setError(error.error || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      setError('Failed to reset password')
    } finally {
      setShowPasswordResetConfirm(false)
      setResettingPasswordUser(null)
      setNewPassword('')
    }
  }

  const cancelResetPassword = () => {
    setShowPasswordResetConfirm(false)
    setResettingPasswordUser(null)
    setNewPassword('')
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
                  const response = await authenticatedApiCall('api/users', token!)
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
                  onDeactivate={() => handleDeactivateUser(userItem)}
                  onResetPassword={() => handleResetPassword(userItem)}
                  onDelete={() => handleDeleteAccount(userItem)}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(2px)' }}>
          <div className="rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
               style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
            <div className="px-6 py-4 border-b" 
                 style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
              <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                Confirm Deactivation
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full" style={{ backgroundColor: darkMode ? '#7f1d1d' : '#fef2f2' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                       style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                    Deactivate "{deletingUser.username}"?
                  </p>
                  <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                    This user will be marked as inactive and won't be able to log in.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={confirmDeactivateUser}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                >
                  Deactivate
                </button>
                <button
                  onClick={cancelDeactivateUser}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Confirmation Modal */}
      {showPasswordResetConfirm && resettingPasswordUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(2px)' }}>
          <div className="rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
               style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
            <div className="px-6 py-4 border-b" 
                 style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
              <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                Reset Password
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full" style={{ backgroundColor: darkMode ? '#1e40af' : '#eff6ff' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                       style={{ color: darkMode ? '#93c5fd' : '#3b82f6' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                    Reset password for "{resettingPasswordUser.username}"?
                  </p>
                  <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                    Enter a new password (minimum 6 characters).
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                  New Password *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                    borderColor: darkMode ? '#4b5563' : '#d1d5db',
                    color: darkMode ? '#ffffff' : '#000000'
                  }}
                  placeholder="Enter new password"
                  minLength={6}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={confirmResetPassword}
                  disabled={!newPassword || newPassword.length < 6}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Reset Password
                </button>
                <button
                  onClick={cancelResetPassword}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteAccountConfirm && deletingAccountUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(2px)' }}>
          <div className="rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
               style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
            <div className="px-6 py-4 border-b" 
                 style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
              <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                Confirm Account Deletion
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full" style={{ backgroundColor: darkMode ? '#7f1d1d' : '#fef2f2' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                       style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                    Permanently delete "{deletingAccountUser.username}"?
                  </p>
                  <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                    This action cannot be undone. The user account and all associated data will be permanently removed.
                  </p>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                <p className="text-sm font-medium" style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>
                  ⚠️ Warning: This is a permanent action
                </p>
                <p className="text-xs mt-1" style={{ color: darkMode ? '#f87171' : '#b91c1c' }}>
                  The user account will be completely removed from the system and cannot be recovered.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={confirmDeleteAccount}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
                <button
                  onClick={cancelDeleteAccount}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="border px-4 py-3 rounded-md shadow-lg"
               style={{
                 backgroundColor: darkMode ? '#7f1d1d' : '#fef2f2',
                 borderColor: darkMode ? '#991b1b' : '#fecaca',
                 color: darkMode ? '#fca5a5' : '#dc2626'
               }}>
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError('')}
                className="ml-4 text-sm font-medium hover:opacity-75"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="border px-4 py-3 rounded-md shadow-lg"
               style={{
                 backgroundColor: darkMode ? '#064e3b' : '#f0fdf4',
                 borderColor: darkMode ? '#065f46' : '#bbf7d0',
                 color: darkMode ? '#6ee7b7' : '#16a34a'
               }}>
            <div className="flex items-center justify-between">
              <span>{success}</span>
              <button
                onClick={() => setSuccess('')}
                className="ml-4 text-sm font-medium hover:opacity-75"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


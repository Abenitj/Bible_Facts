'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import UserCard from '@/components/UserCard'
import UserForm from '@/components/UserForm'
import { useDarkMode } from '@/contexts/DarkModeContext'
import { authenticatedApiCall } from '@/lib/api'
import { canAccessUserManagement, ROLES } from '@/lib/auth'

interface User {
  id: number
  username: string
  email: string | null
  role: string
  status: string
  lastLoginAt: string | null
  createdAt: string
  createdByUsername: string | null
  _count: {
    activities: number
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [user, setUser] = useState<{ username: string; role: string } | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('users')
  const { darkMode } = useDarkMode()
  const router = useRouter()

  // Error and success states
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [showPasswordResetConfirm, setShowPasswordResetConfirm] = useState(false)
  const [resettingPasswordUser, setResettingPasswordUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false)
  const [deletingAccountUser, setDeletingAccountUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('cms_user')
    const storedToken = localStorage.getItem('cms_token')

    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setToken(storedToken)

      // Check if user has permission to access user management
      if (!canAccessUserManagement(userData.role as any)) {
        // Show error message instead of redirecting
        setError('You do not have permission to access User Management. Only administrators can access this section.')
        setLoading(false)
        return
      }

      fetchUsers()
    } else {
      router.push('/login')
    }
  }, [router])

  const fetchUsers = async () => {
    if (!token) return

    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })

      if (searchTerm) params.append('search', searchTerm)
      if (roleFilter) params.append('role', roleFilter)
      if (statusFilter) params.append('status', statusFilter)

      const response = await authenticatedApiCall(`/api/users?${params}`, 'GET', token)
      
      if (response.success) {
        setUsers(response.data.users)
        setTotalPages(response.data.pagination.pages)
      } else {
        setError(response.error || 'Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchUsers()
    }
  }, [currentPage, searchTerm, roleFilter, statusFilter, token])

  const handleCreateUser = async (userData: any) => {
    if (!token) return

    try {
      const response = await authenticatedApiCall('/api/users', 'POST', token, userData)
      
      if (response.success) {
        setSuccess('User created successfully')
        setShowCreateForm(false)
        fetchUsers()
      } else {
        setError(response.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      setError('Failed to create user')
    }
  }

  const handleUpdateUser = async (userData: any, userId?: number) => {
    if (!token || !userId) return

    try {
      const response = await authenticatedApiCall(`/api/users/${userId}`, 'PUT', token, userData)
      
      if (response.success) {
        setSuccess('User updated successfully')
        setEditingUser(null)
        fetchUsers()
      } else {
        setError(response.error || 'Failed to update user')
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
    if (!token || !deletingUser) return

    try {
      const response = await authenticatedApiCall(`/api/users/${deletingUser.id}`, 'DELETE', token)
      
      if (response.success) {
        setSuccess('User deactivated successfully')
        setShowDeleteConfirm(false)
        setDeletingUser(null)
        fetchUsers()
      } else {
        setError(response.error || 'Failed to deactivate user')
      }
    } catch (error) {
      console.error('Error deactivating user:', error)
      setError('Failed to deactivate user')
    }
  }

  const handleResetPassword = (user: User) => {
    setResettingPasswordUser(user)
    setShowPasswordResetConfirm(true)
  }

  const confirmResetPassword = async () => {
    if (!token || !resettingPasswordUser || !newPassword) return

    try {
      const response = await authenticatedApiCall(
        `/api/users/${resettingPasswordUser.id}/reset-password`,
        'POST',
        token,
        { password: newPassword }
      )
      
      if (response.success) {
        setSuccess('Password reset successfully')
        setShowPasswordResetConfirm(false)
        setResettingPasswordUser(null)
        setNewPassword('')
      } else {
        setError(response.error || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      setError('Failed to reset password')
    }
  }

  const handleDeleteAccount = (user: User) => {
    setDeletingAccountUser(user)
    setShowDeleteAccountConfirm(true)
  }

  const confirmDeleteAccount = async () => {
    if (!token || !deletingAccountUser) return

    try {
      const response = await authenticatedApiCall(
        `/api/users/${deletingAccountUser.id}/delete`,
        'DELETE',
        token
      )
      
      if (response.success) {
        setSuccess('User account permanently deleted')
        setShowDeleteAccountConfirm(false)
        setDeletingAccountUser(null)
        fetchUsers()
      } else {
        setError(response.error || 'Failed to delete user account')
      }
    } catch (error) {
      console.error('Error deleting user account:', error)
      setError('Failed to delete user account')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('cms_token')
    localStorage.removeItem('cms_user')
    router.push('/login')
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'content_manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb' }}>
      <Sidebar user={user} activeSection={activeSection} onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add New User
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="content_manager">Content Manager</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Users Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={() => setEditingUser(user)}
                  onDeactivate={() => handleDeactivateUser(user)}
                  onResetPassword={() => handleResetPassword(user)}
                  onDelete={() => handleDeleteAccount(user)}
                  getRoleColor={getRoleColor}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </main>
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => setShowCreateForm(false)}
          isEditing={false}
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <UserForm
          user={editingUser}
          onSubmit={handleUpdateUser}
          onCancel={() => setEditingUser(null)}
          isEditing={true}
        />
      )}

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Error</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => setError(null)}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Success</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{success}</p>
            <button
              onClick={() => setSuccess(null)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Deactivation</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to deactivate user "{deletingUser.username}"? This action can be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeactivateUser}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Confirmation Modal */}
      {showPasswordResetConfirm && resettingPasswordUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reset Password</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Enter new password for user "{resettingPasswordUser.username}":
            </p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-6"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowPasswordResetConfirm(false)
                  setNewPassword('')
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmResetPassword}
                disabled={!newPassword}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteAccountConfirm && deletingAccountUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">⚠️ Permanent Delete</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to <strong>permanently delete</strong> user "{deletingAccountUser.username}"? 
              This action cannot be undone and will remove all user data.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteAccountConfirm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar, { MobileMenu } from '@/components/Sidebar'
import UserCard from '@/components/UserCard'
import UserForm from '@/components/UserForm'
import PermissionManager from '@/components/PermissionManager'
import { useDarkMode } from '@/contexts/DarkModeContext'
import DarkModeToggle from '@/components/DarkModeToggle'
import { authenticatedApiCall } from '@/lib/api'
import { canAccessUserManagement, ROLES } from '@/lib/auth'

interface User {
  id: number
  username: string
  email: string | null
  role: string
  status: string
  permissions?: string | null
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
  const [showPermissionManager, setShowPermissionManager] = useState(false)
  const [managingPermissionsUser, setManagingPermissionsUser] = useState<User | null>(null)

  // Auto-dismiss notifications
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000) // Auto-dismiss after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [error, success])

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

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long'
    }
    return null
  }

  const confirmResetPassword = async () => {
    if (!token || !resettingPasswordUser || !newPassword) return

    // Validate password on frontend first
    const validationError = validatePassword(newPassword)
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      const response = await authenticatedApiCall(
        `/api/users/${resettingPasswordUser.id}/reset-password`,
        'POST',
        token,
        { newPassword: newPassword }
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

  const handleManagePermissions = (user: User) => {
    setManagingPermissionsUser(user)
    setShowPermissionManager(true)
  }

  const handleSavePermissions = async (userId: number, permissions: string[]) => {
    if (!token) return

    try {
      const response = await authenticatedApiCall(
        `/api/users/${userId}/permissions`,
        'PUT',
        token,
        { permissions }
      )
      
      if (response.success) {
        setSuccess('User permissions updated successfully')
        setShowPermissionManager(false)
        setManagingPermissionsUser(null)
        fetchUsers()
      } else {
        setError(response.error || 'Failed to update user permissions')
      }
    } catch (error) {
      console.error('Error updating user permissions:', error)
      setError('Failed to update user permissions')
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
            <p className="mt-4" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <div>Loading...</div>
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>User Management</h1>
                <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Manage system users and permissions</p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
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
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="hidden sm:inline">Add User</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              style={{
                backgroundColor: darkMode ? '#374151' : '#ffffff',
                borderColor: darkMode ? '#4b5563' : '#d1d5db',
                color: darkMode ? '#f9fafb' : '#111827'
              }}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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

          {/* Users Grid */}
          {users.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: darkMode ? '#374151' : '#f3f4f6' }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                     style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>No users found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((userItem) => (
                <UserCard
                  key={userItem.id}
                  user={userItem}
                  currentUser={user}
                  onEdit={() => setEditingUser(userItem)}
                  onDeactivate={() => handleDeactivateUser(userItem)}
                  onResetPassword={() => handleResetPassword(userItem)}
                  onDelete={() => handleDeleteAccount(userItem)}
                  onManagePermissions={() => handleManagePermissions(userItem)}
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
                  className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{
                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                    borderColor: darkMode ? '#4b5563' : '#d1d5db',
                    color: darkMode ? '#f9fafb' : '#111827'
                  }}
                >
                  Previous
                </button>
                <span className="px-3 py-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{
                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                    borderColor: darkMode ? '#4b5563' : '#d1d5db',
                    color: darkMode ? '#f9fafb' : '#111827'
                  }}
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
          onClose={() => setShowCreateForm(false)}
          currentUser={user}
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <UserForm
          user={editingUser}
          onSubmit={handleUpdateUser}
          onClose={() => setEditingUser(null)}
          currentUser={user}
        />
      )}

      {/* Toast Notifications */}
      {(error || success) && (
        <div className="fixed top-4 right-4 z-50 max-w-sm animate-in slide-in-from-right-2 duration-300">
          {error && (
            <div className="mb-2 p-4 rounded-lg shadow-lg border-l-4 border-red-500 flex items-center justify-between transform transition-all duration-300"
                 style={{
                   backgroundColor: darkMode ? '#7f1d1d' : '#fef2f2',
                   borderColor: darkMode ? '#991b1b' : '#fecaca'
                 }}>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"
                     style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-4 p-1 rounded-full hover:bg-black/10 transition-colors"
                style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          {success && (
            <div className="mb-2 p-4 rounded-lg shadow-lg border-l-4 border-green-500 flex items-center justify-between transform transition-all duration-300"
                 style={{
                   backgroundColor: darkMode ? '#064e3b' : '#f0fdf4',
                   borderColor: darkMode ? '#065f46' : '#bbf7d0'
                 }}>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"
                     style={{ color: darkMode ? '#6ee7b7' : '#166534' }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p style={{ color: darkMode ? '#6ee7b7' : '#166534' }}>{success}</p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="ml-4 p-1 rounded-full hover:bg-black/10 transition-colors"
                style={{ color: darkMode ? '#6ee7b7' : '#166534' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(2px)' }}>
          <div className="rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
               style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Confirm Deactivation</h3>
            <p className="mb-6" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
              Are you sure you want to deactivate user "{deletingUser.username}"? This action can be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 px-4 rounded-lg transition-colors"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                  color: darkMode ? '#d1d5db' : '#374151'
                }}
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
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(2px)' }}>
          <div className="rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
               style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Reset Password</h3>
            <p className="mb-4" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
              Enter new password for user "{resettingPasswordUser.username}":
            </p>
            
            {/* Password Requirements */}
            <div className="mb-4 p-3 rounded-lg border"
                 style={{
                   backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
                   borderColor: darkMode ? '#475569' : '#e2e8f0'
                 }}>
              <p className="text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                Password Requirements:
              </p>
              <ul className="text-xs space-y-1" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                <li className={`flex items-center ${newPassword.length >= 6 ? 'text-green-600 dark:text-green-400' : ''}`}>
                  <svg className={`w-3 h-3 mr-2 ${newPassword.length >= 6 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  At least 6 characters long
                </li>
                <li className={`flex items-center ${/[A-Z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                  <svg className={`w-3 h-3 mr-2 ${/[A-Z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Contains uppercase letter
                </li>
                <li className={`flex items-center ${/[a-z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                  <svg className={`w-3 h-3 mr-2 ${/[a-z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Contains lowercase letter
                </li>
                <li className={`flex items-center ${/\d/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                  <svg className={`w-3 h-3 mr-2 ${/\d/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Contains number
                </li>
              </ul>
            </div>
            
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6 transition-colors ${
                newPassword.length > 0 && newPassword.length < 6 ? 'border-red-500' : ''
              }`}
              style={{
                backgroundColor: darkMode ? '#374151' : '#ffffff',
                borderColor: newPassword.length > 0 && newPassword.length < 6 ? '#ef4444' : (darkMode ? '#4b5563' : '#d1d5db'),
                color: darkMode ? '#f9fafb' : '#111827'
              }}
            />
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowPasswordResetConfirm(false)
                  setNewPassword('')
                }}
                className="flex-1 py-2 px-4 rounded-lg transition-colors"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                  color: darkMode ? '#d1d5db' : '#374151'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmResetPassword}
                disabled={!newPassword || newPassword.length < 6}
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
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(2px)' }}>
          <div className="rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
               style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>⚠️ Permanent Delete</h3>
            <p className="mb-6" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
              Are you sure you want to <strong>permanently delete</strong> user "{deletingAccountUser.username}"? 
              This action cannot be undone and will remove all user data.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteAccountConfirm(false)}
                className="flex-1 py-2 px-4 rounded-lg transition-colors"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                  color: darkMode ? '#d1d5db' : '#374151'
                }}
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

      {/* Permission Manager Modal */}
      {showPermissionManager && managingPermissionsUser && (
        <PermissionManager
          user={managingPermissionsUser}
          currentUser={user}
          onSave={handleSavePermissions}
          onClose={() => {
            setShowPermissionManager(false)
            setManagingPermissionsUser(null)
          }}
        />
      )}
    </div>
  )
}


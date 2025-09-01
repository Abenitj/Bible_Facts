'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDarkMode } from '@/contexts/DarkModeContext'
import { PERMISSIONS, ROLES } from '@/lib/auth'

interface User {
  id: number
  username: string
  email?: string
  role: string
  status: string
}

interface UserFormProps {
  user?: User | null
  onSubmit: (userData: any, userId?: number) => void
  onClose: () => void
  currentUser: any
}

interface PermissionGroup {
  name: string
  permissions: {
    key: string
    label: string
    description: string
  }[]
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    name: 'Dashboard',
    permissions: [
      { key: PERMISSIONS.VIEW_DASHBOARD, label: 'View Dashboard', description: 'Can access the main dashboard' }
    ]
  },
  {
    name: 'User Management',
    permissions: [
      { key: PERMISSIONS.VIEW_USERS, label: 'View Users', description: 'Can view user list and details' },
      { key: PERMISSIONS.CREATE_USERS, label: 'Create Users', description: 'Can create new users' },
      { key: PERMISSIONS.EDIT_USERS, label: 'Edit Users', description: 'Can edit user information' },
      { key: PERMISSIONS.DELETE_USERS, label: 'Delete Users', description: 'Can delete users' },
      { key: PERMISSIONS.RESET_USER_PASSWORD, label: 'Reset User Password', description: 'Can reset user passwords' }
    ]
  },
  {
    name: 'Content Management',
    permissions: [
      { key: PERMISSIONS.VIEW_RELIGIONS, label: 'View Religions', description: 'Can view religion list and details' },
      { key: PERMISSIONS.CREATE_RELIGIONS, label: 'Create Religions', description: 'Can create new religions' },
      { key: PERMISSIONS.EDIT_RELIGIONS, label: 'Edit Religions', description: 'Can edit religion information' },
      { key: PERMISSIONS.DELETE_RELIGIONS, label: 'Delete Religions', description: 'Can delete religions' },
      { key: PERMISSIONS.VIEW_TOPICS, label: 'View Topics', description: 'Can view topic list and details' },
      { key: PERMISSIONS.CREATE_TOPICS, label: 'Create Topics', description: 'Can create new topics' },
      { key: PERMISSIONS.EDIT_TOPICS, label: 'Edit Topics', description: 'Can edit topic information' },
      { key: PERMISSIONS.DELETE_TOPICS, label: 'Delete Topics', description: 'Can delete topics' },
      { key: PERMISSIONS.VIEW_CONTENT, label: 'View Content', description: 'Can view content details' },
      { key: PERMISSIONS.EDIT_CONTENT, label: 'Edit Content', description: 'Can edit content' }
    ]
  },
  {
    name: 'Profile Settings',
    permissions: [
      { key: PERMISSIONS.VIEW_PROFILE_SETTINGS, label: 'View Profile Settings', description: 'Can view profile settings' },
      { key: PERMISSIONS.EDIT_PROFILE_SETTINGS, label: 'Edit Profile Settings', description: 'Can modify profile settings' }
    ]
  },
  {
    name: 'System Management',
    permissions: [
      { key: PERMISSIONS.VIEW_SYNC, label: 'View Sync', description: 'Can view sync status' },
      { key: PERMISSIONS.MANAGE_SYNC, label: 'Manage Sync', description: 'Can manage sync operations' },
      { key: PERMISSIONS.VIEW_SYSTEM_SETTINGS, label: 'View System Settings', description: 'Can view system settings' },
      { key: PERMISSIONS.MANAGE_SYSTEM_SETTINGS, label: 'Manage System Settings', description: 'Can modify system settings' }
    ]
  },
  {
    name: 'SMTP Configuration',
    permissions: [
      { key: PERMISSIONS.VIEW_SMTP_CONFIG, label: 'View SMTP Config', description: 'Can view SMTP configurations' },
      { key: PERMISSIONS.CREATE_SMTP_CONFIG, label: 'Create SMTP Config', description: 'Can create new SMTP configurations' },
      { key: PERMISSIONS.EDIT_SMTP_CONFIG, label: 'Edit SMTP Config', description: 'Can edit SMTP configurations' },
      { key: PERMISSIONS.DELETE_SMTP_CONFIG, label: 'Delete SMTP Config', description: 'Can delete SMTP configurations' },
      { key: PERMISSIONS.TEST_SMTP_CONFIG, label: 'Test SMTP Config', description: 'Can test SMTP configurations' }
    ]
  }
]

export default function UserForm({ user, onSubmit, onClose, currentUser }: UserFormProps) {
  const { darkMode } = useDarkMode()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'content_manager',
    status: 'active'
  } as {
    username: string
    email: string
    password: string
    role: string
    status: string
  })
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true) // Always true for new users
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)

  const isEditing = !!user

  // Get default permissions for a role
  const getDefaultPermissionsForRole = (role: string): string[] => {
    if (role === ROLES.ADMIN) {
      return Object.values(PERMISSIONS)
    } else if (role === ROLES.CONTENT_MANAGER) {
      return [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_RELIGIONS,
        PERMISSIONS.CREATE_RELIGIONS,
        PERMISSIONS.EDIT_RELIGIONS,
        PERMISSIONS.DELETE_RELIGIONS,
        PERMISSIONS.VIEW_TOPICS,
        PERMISSIONS.CREATE_TOPICS,
        PERMISSIONS.EDIT_TOPICS,
        PERMISSIONS.DELETE_TOPICS,
        PERMISSIONS.VIEW_CONTENT,
        PERMISSIONS.EDIT_CONTENT,
        PERMISSIONS.VIEW_PROFILE_SETTINGS,
        PERMISSIONS.EDIT_PROFILE_SETTINGS
      ]
    }
    return []
  }

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email || '',
        password: '',
        role: user.role,
        status: user.status
      })
      // For editing, we don't set default permissions as they should be loaded from the user's current permissions
    } else {
      // For new users, set default permissions based on selected role
      setSelectedPermissions(getDefaultPermissionsForRole(formData.role))
    }
  }, [user])

  // Update permissions when role changes
  useEffect(() => {
    if (!isEditing) {
      setSelectedPermissions(getDefaultPermissionsForRole(formData.role))
    }
  }, [formData.role, isEditing])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    // Password validation only for editing (when user provides a new password)
    if (isEditing && formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = { 
        ...formData,
        permissions: selectedPermissions, // Include permissions in submission
        sendWelcomeEmail: !isEditing ? sendWelcomeEmail : undefined // Only for new users
      }
      
      // Remove password if it's empty (for editing)
      if (isEditing && !submitData.password) {
        delete (submitData as any).password
      }

      // Remove email if it's empty
      if (!submitData.email) {
        delete (submitData as any).email
      }

      if (isEditing) {
        await onSubmit(submitData, user!.id)
      } else {
        const result = await onSubmit(submitData)
        
        // Handle temporary password display
        if (result && result.temporaryPassword) {
          setTemporaryPassword(result.temporaryPassword)
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Debounced validation function
  const debouncedValidation = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (field: string, value: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          validateField(field, value)
        }, 500) // Wait 500ms after user stops typing
      }
    })(),
    []
  )

  const validateField = async (field: string, value: string) => {
    if (!value.trim()) return

    // Only validate username and email for duplicates
    if (field === 'username' || field === 'email') {
      try {
        const response = await fetch(`/api/users/validate?${field}=${encodeURIComponent(value)}`)
        const data = await response.json()
        
        if (!data.available) {
          setErrors(prev => ({ 
            ...prev, 
            [field]: data.error || `${field === 'username' ? 'Username' : 'Email'} is already taken` 
          }))
        } else {
          // Clear error if field is now available
          setErrors(prev => ({ ...prev, [field]: '' }))
        }
      } catch (error) {
        console.error('Validation error:', error)
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Trigger debounced validation for username and email
    if (field === 'username' || field === 'email') {
      debouncedValidation(field, value)
    }
  }

  const handlePermissionToggle = (permissionKey: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionKey)
        ? prev.filter(p => p !== permissionKey)
        : [...prev, permissionKey]
    )
  }

  const handleSelectRoleDefaults = () => {
    setSelectedPermissions(getDefaultPermissionsForRole(formData.role))
  }

  const canAssignRole = (role: string) => {
    if (currentUser?.role === 'admin') return true
    if (currentUser?.role === 'content_manager' && role !== 'admin') return true
    return false
  }

  const roleOptions = [
    { value: 'content_manager', label: 'Content Manager', description: 'Can manage content and users' },
    { value: 'admin', label: 'Admin', description: 'Full system access' }
  ].filter(option => canAssignRole(option.value))

  // Filter permission groups based on selected role
  const visiblePermissionGroups = PERMISSION_GROUPS.filter(group => {
    if (formData.role === ROLES.CONTENT_MANAGER) {
      return ['Dashboard', 'Content Management', 'Profile Settings'].includes(group.name)
    }
    return true
  })

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(2px)' }}>
      <div className="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
           style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b" 
             style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
          <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
            {isEditing ? 'Edit User' : 'Add New User'}
          </h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                Username *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.username ? 'border-red-500' : ''
                }`}
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: errors.username ? '#ef4444' : (darkMode ? '#4b5563' : '#d1d5db'),
                  color: darkMode ? '#f9fafb' : '#111827'
                }}
                placeholder="Enter username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : ''
                }`}
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: errors.email ? '#ef4444' : (darkMode ? '#4b5563' : '#d1d5db'),
                  color: darkMode ? '#f9fafb' : '#111827'
                }}
                placeholder="Enter email (optional)"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password - Only for editing */}
            {isEditing && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                  style={{
                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                    borderColor: errors.password ? '#ef4444' : (darkMode ? '#4b5563' : '#d1d5db'),
                    color: darkMode ? '#f9fafb' : '#111827'
                  }}
                  placeholder="Leave blank to keep current password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
                <p className="mt-1 text-xs" style={{ color: darkMode ? '#6b7280' : '#6b7280' }}>
                  Leave blank to keep current password
                </p>
              </div>
            )}

            {/* Role */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                  color: darkMode ? '#f9fafb' : '#111827'
                }}
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: darkMode ? '#374151' : '#ffffff',
                borderColor: darkMode ? '#4b5563' : '#d1d5db',
                color: darkMode ? '#f9fafb' : '#111827'
              }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Email Information - Only for new users */}
          {!isEditing && (
            <div className="border-t pt-4" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
              <div className="p-3 rounded-lg border"
                   style={{
                     backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
                     borderColor: darkMode ? '#475569' : '#e2e8f0'
                   }}>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                      Welcome Email Will Be Sent
                    </p>
                    <p className="text-xs" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                      {formData.email ? `A welcome email with temporary password will be sent to ${formData.email}` : 'Email address required to send welcome email'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Permissions Section */}
          <div className="border-t pt-4" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                  Permissions
                </h4>
                <p className="text-xs" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  Selected: {selectedPermissions.length} permissions
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleSelectRoleDefaults}
                  className="text-xs px-2 py-1 rounded transition-colors"
                  style={{
                    backgroundColor: darkMode ? '#065f46' : '#dcfce7',
                    color: darkMode ? '#d1fae5' : '#166534',
                    border: `1px solid ${darkMode ? '#047857' : '#bbf7d0'}`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = darkMode ? '#047857' : '#bbf7d0'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = darkMode ? '#065f46' : '#dcfce7'
                  }}
                >
                  Role Defaults
                </button>
                <button
                  type="button"
                  onClick={() => setShowPermissions(!showPermissions)}
                  className="text-xs px-2 py-1 rounded transition-colors"
                  style={{
                    backgroundColor: darkMode ? '#1e40af' : '#dbeafe',
                    color: darkMode ? '#bfdbfe' : '#1e40af',
                    border: `1px solid ${darkMode ? '#3b82f6' : '#93c5fd'}`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = darkMode ? '#3b82f6' : '#93c5fd'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = darkMode ? '#1e40af' : '#dbeafe'
                  }}
                >
                  {showPermissions ? 'Hide' : 'Customize'}
                </button>
              </div>
            </div>

            {/* Permission Groups */}
            {showPermissions && (
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {visiblePermissionGroups.map((group) => (
                  <div key={group.name} className="border rounded-lg p-3"
                       style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                    <h5 className="text-sm font-medium mb-2" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                      {group.name}
                    </h5>
                    <div className="grid grid-cols-1 gap-2">
                      {group.permissions.map((permission) => (
                        <div key={permission.key} className="flex items-start space-x-2">
                          <input
                            type="checkbox"
                            id={permission.key}
                            checked={selectedPermissions.includes(permission.key)}
                            onChange={() => handlePermissionToggle(permission.key)}
                            className="mt-1 h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={permission.key}
                              className="text-xs font-medium cursor-pointer"
                              style={{ color: darkMode ? '#f9fafb' : '#111827' }}
                            >
                              {permission.label}
                            </label>
                            <p className="text-xs" style={{ color: darkMode ? '#9ca3af' : '#4b5563' }}>
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Temporary Password Display */}
          {temporaryPassword && (
            <div className="border-t pt-4" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  ⚠️ Temporary Password Generated
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  A temporary password has been generated for the new user. Please share this with them securely:
                </p>
                <div className="bg-white border border-yellow-300 rounded p-3 dark:bg-gray-800 dark:border-yellow-600">
                  <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                    {temporaryPassword}
                  </code>
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                  The user will be required to change this password on their first login.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-md transition-colors"
              style={{
                backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                color: darkMode ? '#d1d5db' : '#374151'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

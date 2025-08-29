'use client'

import { useState, useEffect } from 'react'
import { useDarkMode } from '@/contexts/DarkModeContext'
import { PERMISSIONS, ROLES } from '@/lib/auth'

interface PermissionManagerProps {
  user: {
    id: number
    username: string
    role: string
    permissions?: string[]
  }
  currentUser: {
    role: string
  }
  onSave: (userId: number, permissions: string[]) => Promise<void>
  onClose: () => void
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
    name: 'System Management',
    permissions: [
      { key: PERMISSIONS.VIEW_SYNC, label: 'View Sync', description: 'Can view sync status' },
      { key: PERMISSIONS.MANAGE_SYNC, label: 'Manage Sync', description: 'Can manage sync operations' },
      { key: PERMISSIONS.VIEW_SETTINGS, label: 'View Settings', description: 'Can view system settings' },
      { key: PERMISSIONS.MANAGE_SETTINGS, label: 'Manage Settings', description: 'Can modify system settings' }
    ]
  }
]

export default function PermissionManager({ user, currentUser, onSave, onClose }: PermissionManagerProps) {
  const { darkMode } = useDarkMode()
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRole, setSelectedRole] = useState(user.role)

  useEffect(() => {
    // Initialize with current user permissions or role-based permissions
    if (user.permissions) {
      let permissionsArray: string[]
      
      if (typeof user.permissions === 'string') {
        try {
          permissionsArray = JSON.parse(user.permissions)
        } catch (error) {
          console.error('Error parsing user permissions:', error)
          // Set default permissions based on role
          permissionsArray = getDefaultPermissionsForRole(user.role)
        }
      } else if (Array.isArray(user.permissions)) {
        permissionsArray = user.permissions
      } else {
        // Set default permissions based on role
        permissionsArray = getDefaultPermissionsForRole(user.role)
      }
      
      setSelectedPermissions(permissionsArray)
    } else {
      // Set default permissions based on role
      const defaultPermissions = getDefaultPermissionsForRole(user.role)
      setSelectedPermissions(defaultPermissions)
    }
  }, [user])

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
        PERMISSIONS.VIEW_SYNC,
        PERMISSIONS.VIEW_SETTINGS
      ]
    }
    return []
  }

  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole)
    const defaultPermissions = getDefaultPermissionsForRole(newRole)
    setSelectedPermissions(defaultPermissions)
  }

  const handlePermissionToggle = (permissionKey: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionKey)
        ? prev.filter(p => p !== permissionKey)
        : [...prev, permissionKey]
    )
  }

  const handleSelectAll = (groupPermissions: string[]) => {
    setSelectedPermissions(prev => {
      const newPermissions = [...prev]
      groupPermissions.forEach(permission => {
        if (!newPermissions.includes(permission)) {
          newPermissions.push(permission)
        }
      })
      return newPermissions
    })
  }

  const handleDeselectAll = (groupPermissions: string[]) => {
    setSelectedPermissions(prev => 
      prev.filter(p => !groupPermissions.includes(p))
    )
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    console.log('PermissionManager: Saving permissions:', selectedPermissions)
    console.log('PermissionManager: Selected permissions length:', selectedPermissions.length)
    try {
      await onSave(user.id, selectedPermissions)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canManagePermissions = currentUser.role === ROLES.ADMIN
  const isOwnAccount = false // This would need to be passed from parent

  if (!canManagePermissions) {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(2px)' }}>
        <div className="rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
             style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Access Denied</h3>
          <p className="mb-6" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
            Only administrators can manage user permissions.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(2px)' }}>
      <div className="rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
           style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b" 
             style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                Manage Permissions
              </h3>
              <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                User: {user.username}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
              User Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: darkMode ? '#374151' : '#ffffff',
                borderColor: darkMode ? '#4b5563' : '#d1d5db',
                color: darkMode ? '#f9fafb' : '#111827'
              }}
            >
              <option value={ROLES.CONTENT_MANAGER}>Content Manager</option>
              <option value={ROLES.ADMIN}>Admin</option>
            </select>
            <p className="mt-1 text-xs" style={{ color: darkMode ? '#6b7280' : '#6b7280' }}>
              Changing the role will update the default permissions
            </p>
          </div>

          {/* Global Actions */}
          <div className="mb-6 flex space-x-2">
            <button
              onClick={() => setSelectedPermissions(Object.values(PERMISSIONS))}
              className="text-sm px-3 py-1 rounded transition-colors"
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
              Select All Permissions
            </button>
            <button
              onClick={() => setSelectedPermissions([])}
              className="text-sm px-3 py-1 rounded transition-colors"
              style={{
                backgroundColor: darkMode ? '#7f1d1d' : '#fee2e2',
                color: darkMode ? '#fecaca' : '#991b1b',
                border: `1px solid ${darkMode ? '#991b1b' : '#fca5a5'}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? '#991b1b' : '#fca5a5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? '#7f1d1d' : '#fee2e2'
              }}
            >
              Deselect All Permissions
            </button>
          </div>

          {/* Permission Groups */}
          <div className="space-y-6">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.name} className="border rounded-lg p-4"
                   style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                    {group.name}
                  </h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSelectAll(group.permissions.map(p => p.key))}
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
                      Select All
                    </button>
                    <button
                      onClick={() => handleDeselectAll(group.permissions.map(p => p.key))}
                      className="text-xs px-2 py-1 rounded transition-colors"
                      style={{
                        backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                        color: darkMode ? '#d1d5db' : '#374151',
                        border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = darkMode ? '#4b5563' : '#e5e7eb'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#f3f4f6'
                      }}
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.permissions.map((permission) => (
                    <div key={permission.key} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id={permission.key}
                        checked={selectedPermissions.includes(permission.key)}
                        onChange={() => handlePermissionToggle(permission.key)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={permission.key}
                          className="text-sm font-medium cursor-pointer"
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

          {/* Actions */}
          <div className="flex space-x-3 pt-6 border-t" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Permissions'}
            </button>
            <button
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
        </div>
      </div>
    </div>
  )
}

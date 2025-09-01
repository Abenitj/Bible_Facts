'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDarkMode } from '@/contexts/DarkModeContext'
import DarkModeToggle from './DarkModeToggle'
import { canAccessUserManagement, ROLES, checkPermission, PERMISSIONS } from '@/lib/auth'

// Shared navigation items configuration
// Shared helper function to filter navigation items based on user role and permissions
const filterNavigationItems = (items: any[], currentUser: any, currentPermissions: string[], componentName: string = 'Unknown') => {
  console.log(`${componentName}: Filtering navigation items:`, {
    user: currentUser,
    permissions: currentPermissions,
    itemsCount: items.length
  })
  
  return items.filter(item => {
    if (!currentUser) return false
    
    // First check if user has the required role
    const hasRole = item.showForRoles.includes(currentUser.role as any)
    if (!hasRole) {
      console.log(`${componentName}: Item ${item.id}: No role access (${currentUser.role} not in ${item.showForRoles})`)
      return false
    }
    
    // If no specific permission is required, show the item
    if (!item.requiredPermission) {
      console.log(`${componentName}: Item ${item.id}: No permission required, showing`)
      return true
    }
    
    // Check if user has the required permission
    const hasPermission = checkPermission(currentUser.role as any, currentPermissions, item.requiredPermission)
    console.log(`${componentName}: Item ${item.id}: Permission check for ${item.requiredPermission} = ${hasPermission}`)
    return hasPermission
  })
}

// Shared navigation items configuration
const getNavigationItems = () => [
  // Profile is managed inside Settings; no standalone nav item
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
      </svg>
    ),
    href: '/dashboard',
    showForRoles: [ROLES.ADMIN, ROLES.CONTENT_MANAGER],
    requiredPermission: PERMISSIONS.VIEW_DASHBOARD
  },
  {
    id: 'religions',
    name: 'Religions',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    href: '/religions',
    showForRoles: [ROLES.ADMIN, ROLES.CONTENT_MANAGER],
    requiredPermission: PERMISSIONS.VIEW_RELIGIONS
  },
  {
    id: 'topics',
    name: 'Topics',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    href: '/topics',
    showForRoles: [ROLES.ADMIN, ROLES.CONTENT_MANAGER],
    requiredPermission: PERMISSIONS.VIEW_TOPICS
  },
  {
    id: 'content',
    name: 'Content Editor',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    href: '/content',
    showForRoles: [ROLES.ADMIN, ROLES.CONTENT_MANAGER],
    requiredPermission: PERMISSIONS.VIEW_CONTENT
  },
  {
    id: 'users',
    name: 'Users',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    href: '/users',
    showForRoles: [ROLES.ADMIN],
    requiredPermission: PERMISSIONS.VIEW_USERS
  },
  {
    id: 'sync',
    name: 'Mobile Sync',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    href: '/sync',
    showForRoles: [ROLES.ADMIN],
    requiredPermission: PERMISSIONS.VIEW_SYNC
  },
  {
    id: 'smtp-config',
    name: 'SMTP Config',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    href: '/smtp-config',
    showForRoles: [ROLES.ADMIN],
    requiredPermission: PERMISSIONS.VIEW_SMTP_CONFIG
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    href: '/settings',
    showForRoles: [ROLES.ADMIN, ROLES.CONTENT_MANAGER],
    requiredPermission: null
  },

]

interface MobileMenuProps {
  user: { 
    username: string; 
    role: string; 
    firstName?: string;
    lastName?: string;
    avatarUrl?: string 
  } | null
  activeSection: string
  onLogout: () => void
  isOpen: boolean
  onClose: () => void
}

interface SidebarProps {
  user: { 
    username: string; 
    role: string; 
    firstName?: string;
    lastName?: string;
    avatarUrl?: string 
  } | null
  activeSection: string
  onLogout: () => void
}

export default function Sidebar({ user, activeSection, onLogout }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userPermissions, setUserPermissions] = useState<string[] | null>(null)
  const router = useRouter()
  const { darkMode } = useDarkMode()

  // Fetch user permissions when user changes
  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (!user) return
      
      try {
        const token = localStorage.getItem('cms_token')
        if (!token) return

        const response = await fetch(`/api/users/${user.id || 'me'}/permissions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setUserPermissions(data.data.permissions)
          }
        }
      } catch (error) {
        console.error('Error fetching user permissions:', error)
      }
    }

    fetchUserPermissions()
  }, [user])

  // Helper function to filter navigation items based on user role and permissions
  const filterNavigationItems = (items: any[], currentUser: any, currentPermissions: string[]) => {
    return items.filter(item => {
      if (!currentUser) return false
      
      // First check if user has the required role
      const hasRole = item.showForRoles.includes(currentUser.role as any)
      if (!hasRole) return false
      
      // If no specific permission is required, show the item
      if (!item.requiredPermission) return true
      
      // Check if user has the required permission
      return checkPermission(currentUser.role as any, currentPermissions, item.requiredPermission)
    })
  }

  const navigationItems = getNavigationItems()

  // Filter navigation items based on user role and permissions
  const filteredNavigationItems = filterNavigationItems(navigationItems, user, userPermissions, 'Sidebar')

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-16'} shadow-lg transition-all duration-300 ease-in-out hidden sm:block relative`}
         style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
      <div className="flex flex-col h-full">
        {/* Header with Collapse Button and Avatar */}
        <div className="px-4 py-3 border-b" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
          <div className="flex items-center justify-between">
            {/* User Avatar */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 cursor-pointer" 
                     style={{ borderColor: darkMode ? '#4b5563' : '#e5e7eb' }}
                     onClick={() => router.push('/settings')}
                     title="Go to Settings">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                
                {/* User Info (only show when sidebar is open) */}
                {sidebarOpen && (
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.username
                      }
                    </p>
                    <p className="text-xs truncate" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                      {user.role === 'content_manager' ? 'Content Manager' : user.role}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Collapse Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md transition-colors duration-200"
              style={{
                backgroundColor: 'transparent',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#f3f4f6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {filteredNavigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                router.push(item.href)
              }}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeSection === item.id
                  ? 'border-r-2'
                  : ''
              }`}
              style={{
                backgroundColor: activeSection === item.id 
                  ? (darkMode ? '#1e40af' : '#dbeafe')
                  : (darkMode ? '#1f2937' : '#ffffff'),
                color: activeSection === item.id 
                  ? (darkMode ? '#bfdbfe' : '#1e40af')
                  : (darkMode ? '#d1d5db' : '#374151'),
                borderRightColor: activeSection === item.id 
                  ? (darkMode ? '#3b82f6' : '#93c5fd')
                  : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#f9fafb'
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.backgroundColor = darkMode ? '#1f2937' : '#ffffff'
                }
              }}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="ml-3">{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onLogout}
            className="w-full p-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
            style={{
              backgroundColor: darkMode ? '#7f1d1d' : '#fef2f2',
              color: darkMode ? '#fca5a5' : '#dc2626'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = darkMode ? '#991b1b' : '#fee2e2'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = darkMode ? '#7f1d1d' : '#fef2f2'
            }}
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  )
}

// Mobile Menu Component
export function MobileMenu({ user, activeSection, onLogout, isOpen, onClose }: MobileMenuProps) {
  const router = useRouter()
  const { darkMode } = useDarkMode()
  const [userPermissions, setUserPermissions] = useState<string[]>([])

  // Fetch user permissions when user changes
  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (!user) return
      
      try {
        const token = localStorage.getItem('cms_token')
        if (!token) return

        const response = await fetch(`/api/users/${user.id || 'me'}/permissions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data.permissions) {
            setUserPermissions(data.data.permissions)
          }
        }
      } catch (error) {
        console.error('Error fetching user permissions:', error)
      }
    }

    fetchUserPermissions()
  }, [user])

  // Helper function to filter navigation items based on user role and permissions
  const filterNavigationItems = (items: any[], currentUser: any, currentPermissions: string[]) => {
    return items.filter(item => {
      if (!currentUser) return false
      
      // First check if user has the required role
      const hasRole = item.showForRoles.includes(currentUser.role as any)
      if (!hasRole) return false
      
      // If no specific permission is required, show the item
      if (!item.requiredPermission) return true
      
      // Check if user has the required permission
      return checkPermission(currentUser.role as any, currentPermissions, item.requiredPermission)
    })
  }



  const navigationItems = getNavigationItems()
  const filteredNavigationItems = filterNavigationItems(navigationItems, user, userPermissions, 'MobileMenu')

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-40 sm:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Mobile Menu */}
      <div className={`fixed top-0 left-0 h-full w-64 transform transition-transform duration-300 ease-in-out z-50 sm:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b"
               style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-lg font-bold" style={{ color: darkMode ? '#ffffff' : '#111827' }}>Melhik CMS</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md transition-colors duration-200"
              style={{
                backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                color: darkMode ? '#d1d5db' : '#374151'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2">
              {filteredNavigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(item.href)
                    onClose()
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200`}
                  style={{
                    backgroundColor: activeSection === item.id 
                      ? (darkMode ? '#1e40af' : '#dbeafe')
                      : (darkMode ? '#1f2937' : '#ffffff'),
                    color: activeSection === item.id 
                      ? (darkMode ? '#bfdbfe' : '#1e40af')
                      : (darkMode ? '#d1d5db' : '#374151')
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== item.id) {
                      e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#f9fafb'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== item.id) {
                      e.currentTarget.style.backgroundColor = darkMode ? '#1f2937' : '#ffffff'
                    }
                  }}
                >
                  <span className="mr-3" style={{ color: 'inherit' }}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Mobile Logout Button */}
          <div className="p-4 border-t" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
            <button
              onClick={() => {
                onLogout()
                onClose()
              }}
              className="w-full p-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
              style={{
                backgroundColor: darkMode ? '#7f1d1d' : '#fef2f2',
                color: darkMode ? '#fca5a5' : '#dc2626'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? '#991b1b' : '#fee2e2'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? '#7f1d1d' : '#fef2f2'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}


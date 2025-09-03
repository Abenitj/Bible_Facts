'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useDarkMode } from '@/contexts/DarkModeContext'
import { useUser } from '@/contexts/UserContext'
import DarkModeToggle from './DarkModeToggle'
import { canAccessUserManagement, ROLES, checkPermission, PERMISSIONS } from '@/lib/auth'

// Permission cache key for localStorage
const PERMISSIONS_CACHE_KEY = 'cms_user_permissions'
const PERMISSIONS_CACHE_EXPIRY = 'cms_permissions_expiry'

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

// Function to get cached permissions
const getCachedPermissions = (): string[] | null => {
  try {
    const cached = localStorage.getItem(PERMISSIONS_CACHE_KEY)
    const expiry = localStorage.getItem(PERMISSIONS_CACHE_EXPIRY)
    
    if (!cached || !expiry) return null
    
    // Check if cache has expired (24 hours)
    if (Date.now() > parseInt(expiry)) {
      localStorage.removeItem(PERMISSIONS_CACHE_KEY)
      localStorage.removeItem(PERMISSIONS_CACHE_EXPIRY)
      return null
    }
    
    return JSON.parse(cached)
  } catch (error) {
    console.error('Error reading cached permissions:', error)
    return null
  }
}

// Function to cache permissions
const cachePermissions = (permissions: string[]) => {
  try {
    localStorage.setItem(PERMISSIONS_CACHE_KEY, JSON.stringify(permissions))
    // Cache expires in 24 hours
    localStorage.setItem(PERMISSIONS_CACHE_EXPIRY, (Date.now() + 24 * 60 * 60 * 1000).toString())
  } catch (error) {
    console.error('Error caching permissions:', error)
  }
}

// Function to clear cached permissions (call on logout)
export const clearCachedPermissions = () => {
  try {
    localStorage.removeItem(PERMISSIONS_CACHE_KEY)
    localStorage.removeItem(PERMISSIONS_CACHE_EXPIRY)
  } catch (error) {
    console.error('Error clearing cached permissions:', error)
  }
}

// Function to refresh permissions (force reload from API)
export const refreshPermissions = async (): Promise<string[]> => {
  try {
    const token = localStorage.getItem('cms_token')
    if (!token) throw new Error('No token found')

    const response = await fetch('/api/users/me/permissions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        const permissionsObj = data.data
        const permissionsArray: string[] = []
        
        if (permissionsObj.permissions && Array.isArray(permissionsObj.permissions)) {
          permissionsArray.push(...permissionsObj.permissions)
        } else {
          if (permissionsObj.canManageUsers) permissionsArray.push('create_users', 'edit_users', 'delete_users')
          if (permissionsObj.canManageContent) permissionsArray.push('create_religions', 'edit_religions', 'delete_religions', 'create_topics', 'edit_topics', 'delete_topics')
          if (permissionsObj.canManageSystem) permissionsArray.push('view_system_settings', 'manage_system_settings')
          if (permissionsObj.canViewAnalytics) permissionsArray.push('view_dashboard')
          if (permissionsObj.canTriggerSync) permissionsArray.push('view_sync', 'manage_sync')
          permissionsArray.push('view_religions', 'view_topics', 'view_content', 'view_profile_settings', 'edit_profile_settings')
        }
        
        // Update cache with new permissions
        cachePermissions(permissionsArray)
        return permissionsArray
      }
    }
    
    // Fallback to default permissions
    const defaultPermissions = ['view_religions', 'view_topics', 'view_content', 'view_profile_settings', 'edit_profile_settings']
    cachePermissions(defaultPermissions)
    return defaultPermissions
  } catch (error) {
    console.error('Error refreshing permissions:', error)
    const defaultPermissions = ['view_religions', 'view_topics', 'view_content', 'view_profile_settings', 'edit_profile_settings']
    cachePermissions(defaultPermissions)
    return defaultPermissions
  }
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
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const router = useRouter()
  const { darkMode } = useDarkMode()
  const { user: contextUser, userPermissions, logout } = useUser()

  // Use user from context if not provided as prop - ensure we get it once
  const currentUser = user || contextUser

  // Fallback: If no user in context, try to load from localStorage
  const [localUser, setLocalUser] = useState<any>(null)
  
  useEffect(() => {
    if (!currentUser) {
      try {
        const storedUser = localStorage.getItem('cms_user')
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setLocalUser(parsedUser)
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error)
      }
    }
  }, [currentUser])

  // Use localUser as final fallback
  const finalUser = currentUser || localUser

  // Clear permissions cache on mount to ensure fresh permissions are loaded
  useEffect(() => {
    // Clear cached permissions to force refresh
    clearCachedPermissions()
    
    // Force refresh permissions to ensure SMTP permissions are loaded
    setTimeout(() => {
      refreshPermissions()
    }, 100)
  }, []) // Empty dependency array - only run once on mount

  // Remove the duplicate filterNavigationItems function - use the shared one
  const navigationItems = getNavigationItems()

  // Filter navigation items based on user role and permissions
  // If permissions are still loading or null, show all items for the user's role
  const filteredNavigationItems = useMemo(() => {
    if (userPermissions === null) {
      return finalUser?.role ? navigationItems.filter(item => item.showForRoles.includes(finalUser.role as any)) : []
    }
    return filterNavigationItems(navigationItems, finalUser, userPermissions?.permissions || [], 'Sidebar')
  }, [userPermissions, finalUser, navigationItems])

  // Always show navigation items based on role if permissions are not loaded yet
  // Fallback to showing all items if still no items found
  const displayItems = useMemo(() => {
    if (filteredNavigationItems.length > 0) {
      return filteredNavigationItems
    }
    if (finalUser?.role) {
      const roleItems = navigationItems.filter(item => item.showForRoles.includes(finalUser.role as any))
      return roleItems.length > 0 ? roleItems : navigationItems
    }
    return navigationItems
  }, [filteredNavigationItems, finalUser, navigationItems])

  // If still no items, show at least Settings (which has no role restriction)
  const finalDisplayItems = useMemo(() => {
    return displayItems.length > 0 
      ? displayItems 
      : navigationItems.filter(item => item.id === 'settings')
  }, [displayItems, navigationItems])

  // Prevent blinking by ensuring we always have items to show
  // If we have a user with a role, show items for that role
  // If no user or no role, show all items as fallback
  const stableDisplayItems = useMemo(() => {
    if (finalUser?.role) {
      return finalDisplayItems.length > 0 ? finalDisplayItems : navigationItems.filter(item => item.showForRoles.includes(finalUser.role as any))
    }
    return finalDisplayItems
  }, [finalUser, finalDisplayItems, navigationItems])

  // Handle logout
  const handleLogout = () => {
    logout()
    if (onLogout) onLogout()
  }

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-16'} shadow-lg transition-all duration-300 ease-in-out hidden sm:block relative`}
         style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
      <div className="flex flex-col h-full">
        {/* Header with User Info - ALWAYS VISIBLE AND CONSISTENT */}
        <div className="px-4 py-3 border-b flex-shrink-0" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
          <div className="flex items-center justify-between">
            {/* User Avatar - Always Visible */}
            {finalUser && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 cursor-pointer" 
                     style={{ borderColor: darkMode ? '#4b5563' : '#e5e7eb' }}
                     onClick={() => setImageModalOpen(true)}
                     title="Click to view profile image">
                  {finalUser.avatarUrl ? (
                    <img src={finalUser.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                
                {/* User Info - Always Visible When Sidebar Open */}
                {sidebarOpen && (
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                      {finalUser.firstName && finalUser.lastName 
                        ? `${finalUser.firstName} ${finalUser.lastName}`
                        : finalUser.username
                      }
                    </p>
                    <p className="text-xs truncate" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                      {finalUser.role === 'content_manager' ? 'Content Manager' : finalUser.role}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Collapse Button - Always Visible */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md transition-colors duration-200 flex-shrink-0"
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

        {/* Navigation Section - Separate from User Section */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {stableDisplayItems.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            stableDisplayItems.map((item) => (
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
            ))
          )}
        </nav>

        {/* Footer Section - Always Visible */}
        <div className="px-4 py-3 border-t flex-shrink-0" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
          <div className="flex items-center justify-between">
            {/* Dark Mode Toggle */}
            <DarkModeToggle />
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
              style={{
                backgroundColor: 'transparent',
                color: darkMode ? '#ef4444' : '#dc2626'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? '#7f1d1d' : '#fef2f2'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              title="Logout"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {imageModalOpen && finalUser?.avatarUrl && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(2px)' }} onClick={() => setImageModalOpen(false)}>
          <div className="relative max-w-7xl max-h-[98vh] p-8" onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button - Professional, no background */}
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute top-6 right-6 z-10 p-3 rounded-full text-white hover:bg-white/10 transition-all duration-200"
              title="Close"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image with overlay - Much larger size */}
            <div className="relative">
              <img 
                src={finalUser.avatarUrl} 
                alt={`${finalUser.firstName || finalUser.username}'s Profile`}
                className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              />
              
              {/* User Info Overlay - Bottom of Image */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 rounded-b-xl">
                <div className="text-white">
                  <h4 className="text-xl font-semibold mb-2">
                    {finalUser.firstName && finalUser.lastName 
                      ? `${finalUser.firstName} ${finalUser.lastName}`
                      : finalUser.username
                    }
                  </h4>
                  <p className="text-lg opacity-90">
                    {finalUser.role === 'content_manager' ? 'Content Manager' : 
                     finalUser.role === 'admin' ? 'Administrator' : 
                     finalUser.role.charAt(0).toUpperCase() + finalUser.role.slice(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Mobile Menu Component
export function MobileMenu({ user, activeSection, onLogout, isOpen, onClose }: MobileMenuProps) {
  const router = useRouter()
  const { darkMode } = useDarkMode()
  const { userPermissions, logout } = useUser()

  // Use user from context if not provided as prop
  const currentUser = user || useUser().user

  // Remove the duplicate filterNavigationItems function - use the shared one
  const navigationItems = getNavigationItems()
  const filteredNavigationItems = userPermissions === null 
    ? navigationItems.filter(item => item.showForRoles.includes(currentUser?.role as any))
    : filterNavigationItems(navigationItems, currentUser, userPermissions?.permissions || [], 'MobileMenu')

  // Handle logout
  const handleLogout = () => {
    logout()
    if (onLogout) onLogout()
  }

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


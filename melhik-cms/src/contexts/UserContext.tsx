'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  username: string
  firstName?: string
  lastName?: string
  email?: string
  role: 'admin' | 'content_manager'
  status: string
  avatarUrl?: string
  isFirstLogin: boolean
  requiresPasswordChange: boolean
  createdAt: string
  lastLoginAt?: string
}

interface UserPermissions {
  canManageUsers: boolean
  canManageContent: boolean
  canManageSystem: boolean
  canViewAnalytics: boolean
  canTriggerSync: boolean
  role: string
  permissions: string[]
}

interface UserContextType {
  user: User | null
  userPermissions: UserPermissions | null
  loading: boolean
  error: string | null
  login: (token: string, userData: User) => Promise<void>
  logout: () => void
  refreshUserData: () => Promise<void>
  refreshPermissions: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider: ReactNode = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null)
  const [loading, setLoading] = useState(false) // Changed to false initially
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Load user data from localStorage on mount - SYNCHRONOUSLY
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const token = localStorage.getItem('cms_token')
        const userData = localStorage.getItem('cms_user')
        const permissionsData = localStorage.getItem('cms_user_permissions')
        const permissionsExpiry = localStorage.getItem('cms_permissions_expiry')

        if (token && userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)

          // Check if permissions cache is still valid
          if (permissionsData && permissionsExpiry && Date.now() < parseInt(permissionsExpiry)) {
            const parsedPermissions = JSON.parse(permissionsData)
            setUserPermissions(parsedPermissions)
          } else {
            // Cache expired or missing, fetch fresh permissions in background
            // Don't set loading state to prevent blinking
            fetchUserPermissions(token)
          }

          // Fetch complete profile data in background
          fetchCompleteProfile(token)
        } else {
          // No token or user data found in storage
        }
      } catch (error) {
        console.error('UserContext: Error loading user from storage:', error)
      }
    }

    loadUserFromStorage()
  }, [])

  // Fetch user permissions from API - ASYNCHRONOUSLY in background
  const fetchUserPermissions = async (token: string) => {
    try {
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
          
          // If the API returns a permissions array, use it directly
          if (permissionsObj.permissions && Array.isArray(permissionsObj.permissions)) {
            permissionsArray.push(...permissionsObj.permissions)
          } else {
            // Fallback to mapping API permissions to internal permission constants
            if (permissionsObj.canManageUsers) permissionsArray.push('create_users', 'edit_users', 'delete_users')
            if (permissionsObj.canManageContent) permissionsArray.push('create_religions', 'edit_religions', 'delete_religions', 'create_topics', 'edit_topics', 'delete_topics')
            if (permissionsObj.canManageSystem) permissionsArray.push('view_system_settings', 'manage_system_settings')
            if (permissionsObj.canViewAnalytics) permissionsArray.push('view_dashboard')
            if (permissionsObj.canTriggerSync) permissionsArray.push('view_sync', 'manage_sync')
            
            // Add basic permissions that all users should have
            permissionsArray.push('view_religions', 'view_topics', 'view_content', 'view_profile_settings', 'edit_profile_settings')
          }

          const permissions: UserPermissions = {
            canManageUsers: permissionsObj.canManageUsers || false,
            canManageContent: permissionsObj.canManageContent || false,
            canManageSystem: permissionsObj.canManageSystem || false,
            canViewAnalytics: permissionsObj.canViewAnalytics || false,
            canTriggerSync: permissionsObj.canTriggerSync || false,
            role: permissionsObj.role || 'user',
            permissions: permissionsArray
          }

          setUserPermissions(permissions)
          
          // Cache permissions for 24 hours
          localStorage.setItem('cms_user_permissions', JSON.stringify(permissions))
          localStorage.setItem('cms_permissions_expiry', (Date.now() + 24 * 60 * 60 * 1000).toString())
        }
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error)
      // Set default permissions on error
      const defaultPermissions: UserPermissions = {
        canManageUsers: false,
        canManageContent: false,
        canManageSystem: false,
        canViewAnalytics: false,
        canTriggerSync: false,
        role: 'user',
        permissions: ['view_religions', 'view_topics', 'view_content', 'view_profile_settings', 'edit_profile_settings']
      }
      setUserPermissions(defaultPermissions)
    }
  }

  // Fetch complete profile data from API
  const fetchCompleteProfile = async (token: string) => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success) {
          const profileData = data.data
          
          // Update user with complete profile data
          setUser(prev => {
            if (prev) {
              const updatedUser = {
                ...prev,
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                avatarUrl: profileData.avatarUrl,
                email: profileData.email
              }
              
              // Update localStorage with complete user data
              localStorage.setItem('cms_user', JSON.stringify(updatedUser))
              
              return updatedUser
            }
            return prev
          })
        } else {
          // Profile API returned success: false
        }
      } else {
        // Profile API failed with status:
        const errorText = await response.text()
        // Profile API error response:
      }
    } catch (error) {
      console.error('UserContext: Error fetching complete profile:', error)
    }
  }

  // Login function
  const login = async (token: string, userData: User) => {
    try {
      setError(null)

      // Store user data and token
      localStorage.setItem('cms_token', token)
      localStorage.setItem('cms_user', JSON.stringify(userData))
      
      setUser(userData)

      // Fetch and cache permissions in background
      fetchUserPermissions(token)
      
      // Fetch complete profile data in background
      fetchCompleteProfile(token)
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      setError('Login failed. Please try again.')
    }
  }

  // Logout function
  const logout = () => {
    // Clear all stored data
    localStorage.removeItem('cms_token')
    localStorage.removeItem('cms_user')
    localStorage.removeItem('cms_user_permissions')
    localStorage.removeItem('cms_permissions_expiry')
    
    // Reset state
    setUser(null)
    setUserPermissions(null)
    setError(null)
    
    // Redirect to login
    router.push('/login')
  }

  // Refresh user data
  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('cms_token')
      if (!token) {
        // No token found for refresh
        return
      }

      // Try to get user data from localStorage first
      const userData = localStorage.getItem('cms_user')
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        return
      }

      // If no localStorage data, try to fetch from API
      // No localStorage data, would need API endpoint to refresh user
    } catch (error) {
      console.error('UserContext: Error refreshing user data:', error)
    }
  }

  // Ensure user data is always available
  const ensureUserData = () => {
    if (!user) {
      // User is null, attempting to load from storage
      refreshUserData()
    }
  }

  // Call ensureUserData whenever user becomes null
  useEffect(() => {
    if (!user) {
      ensureUserData()
    }
  }, [user])

  // Refresh permissions
  const refreshPermissions = async () => {
    if (!user) return
    
    try {
      const token = localStorage.getItem('cms_token')
      if (!token) throw new Error('No token found')

      await fetchUserPermissions(token)
    } catch (error) {
      console.error('Error refreshing permissions:', error)
    }
  }

  // Update user data
  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('cms_user', JSON.stringify(updatedUser))
    }
  }

  const value: UserContextType = {
    user,
    userPermissions,
    loading,
    error,
    login,
    logout,
    refreshUserData,
    refreshPermissions,
    updateUser
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}


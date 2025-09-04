'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar, { MobileMenu } from '@/components/Sidebar'
import { useDarkMode } from '@/contexts/DarkModeContext'
import DarkModeToggle from '@/components/DarkModeToggle'

interface User {
  username: string
  role: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
}

interface SyncStats {
  religions: number
  topics: number
  topicDetails: number
  totalSize: string
  lastUpdated: string
  recentChanges?: {
    religions: number
    topics: number
    details: number
    total: number
  }
}

interface SyncStatus {
  isRunning: boolean
  lastSync: string | null
  syncCount: number
  errors: string[]
  currentStatus: 'idle' | 'checking' | 'syncing' | 'completed' | 'failed'
  progress: number
  statusMessage: string
}

export default function SyncPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('sync')
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isRunning: false,
    lastSync: null,
    syncCount: 0,
    errors: [],
    currentStatus: 'idle',
    progress: 0,
    statusMessage: 'Ready to sync'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { darkMode } = useDarkMode()

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('cms_token')
    router.push('/login')
  }

  useEffect(() => {
    const token = localStorage.getItem('cms_token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser(payload)
      
      // Fetch full profile to get avatar, firstName, lastName
      fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          const p = data.data
          // Update user with full profile data
          setUser(prev => ({
            ...prev,
            firstName: p.firstName,
            lastName: p.lastName,
            avatarUrl: p.avatarUrl
          }))
        }
      }).catch(() => {})
    } catch (error) {
      localStorage.removeItem('cms_token')
      router.push('/login')
      return
    }

    loadSyncStats()
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [router])

  const loadSyncStats = async () => {
    try {
      const [downloadResponse, statusResponse] = await Promise.all([
        fetch('/api/sync/download'),
        fetch('/api/sync/status')
      ])
      
      if (downloadResponse.ok && statusResponse.ok) {
        const downloadData = await downloadResponse.json()
        const statusData = await statusResponse.json()
        
        // Get recent changes (last 24 hours)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const recentReligions = downloadData.data.religions.filter((religion: any) => 
          new Date(religion.updatedAt) >= yesterday
        ).length;
        
        const recentTopics = downloadData.data.topics.filter((topic: any) => 
          new Date(topic.updatedAt) >= yesterday
        ).length;
        
        const recentDetails = downloadData.data.topicDetails.filter((detail: any) => 
          new Date(detail.updatedAt) >= yesterday
        ).length;
        
        const stats: SyncStats = {
          religions: downloadData.data.religions.length,
          topics: downloadData.data.topics.length,
          topicDetails: downloadData.data.topicDetails.length,
          totalSize: `${Math.round(JSON.stringify(downloadData.data).length / 1024)}KB`,
          lastUpdated: downloadData.data.lastUpdated,
          recentChanges: {
            religions: recentReligions,
            topics: recentTopics,
            details: recentDetails,
            total: recentReligions + recentTopics + recentDetails
          }
        }
        setSyncStats(stats)
      }
    } catch (error) {
      console.error('Error loading sync stats:', error)
      setError('Failed to load sync statistics')
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'info') => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        // Remove favicon reference to prevent 500 errors
        // icon: '/favicon.ico'
      })
    }
  }

  const triggerSync = async () => {
    setSyncStatus(prev => ({ 
      ...prev, 
      isRunning: true, 
      errors: [],
      currentStatus: 'checking',
      progress: 0,
      statusMessage: 'Checking for updates...'
    }))
    setError('')
    setSuccess('')

    try {
      // Step 1: Check for updates
      setSyncStatus(prev => ({ 
        ...prev, 
        currentStatus: 'checking',
        progress: 25,
        statusMessage: 'Checking for updates...'
      }))
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Step 2: Start sync process
      setSyncStatus(prev => ({ 
        ...prev, 
        currentStatus: 'syncing',
        progress: 50,
        statusMessage: 'Syncing content with mobile apps...'
      }))
      
      const token = localStorage.getItem('cms_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/sync/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Step 3: Complete sync
        setSyncStatus(prev => ({ 
          ...prev, 
          currentStatus: 'completed',
          progress: 100,
          statusMessage: 'Sync completed successfully!'
        }))
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const syncData = data.data
        setSuccess(`${syncData.message} Triggered by: ${syncData.triggeredBy}`)
        
        // Step 4: Final status update
        setSyncStatus(prev => ({
          ...prev,
          isRunning: false,
          lastSync: syncData.timestamp,
          syncCount: prev.syncCount + 1,
          currentStatus: 'idle',
          progress: 0,
          statusMessage: 'Ready to sync'
        }))
        
        setSuccess(`✅ Sync completed successfully! ${data.data.statistics.totalItems} items processed.`)
        showNotification('Sync Complete', `${data.data.statistics.totalItems} items synced successfully!`, 'success')
        await loadSyncStats() // Refresh stats
      } else {
        throw new Error('Sync request failed')
      }
      
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        isRunning: false,
        currentStatus: 'failed',
        progress: 0,
        statusMessage: 'Sync failed',
        errors: [...prev.errors, 'Sync failed']
      }))
      setError('❌ Sync operation failed')
      showNotification('Sync Failed', 'Sync operation failed. Please try again.', 'error')
    }
  }

  const downloadSyncData = async () => {
    try {
      const response = await fetch('/api/sync/download')
      if (response.ok) {
        const data = await response.json()
        
        // Create and download file
        const blob = new Blob([JSON.stringify(data.data, null, 2)], {
          type: 'application/json'
        })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `melhik-sync-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        setSuccess('Sync data downloaded successfully!')
      } else {
        setError('Failed to download sync data')
      }
    } catch (error) {
      setError('Download failed')
    }
  }

  const checkSyncStatus = async () => {
    try {
      const response = await fetch('/api/sync/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          localVersion: 1,
          lastSync: syncStatus.lastSync || new Date(0).toISOString()
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.data.hasUpdates) {
          setSuccess(`Updates available! Current version: ${data.data.currentVersion}`)
        } else {
          setSuccess('No updates available')
        }
      }
    } catch (error) {
      setError('Failed to check sync status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex" style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb' }}>
        <Sidebar 
          user={user} 
          activeSection={activeSection} 
          onLogout={handleLogout} 
        />
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Loading sync page...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb' }}>
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

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="shadow-sm border-b" 
                 style={{ 
                   backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                   borderColor: darkMode ? '#374151' : '#e5e7eb'
                 }}>
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Sync Management</h1>
                <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Manage content synchronization with mobile apps</p>
              </div>
              <div className="flex items-center space-x-2">
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
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800" style={{ 
          maxHeight: 'calc(100vh - 80px)',
          scrollbarWidth: 'thin',
          scrollbarColor: darkMode ? '#4b5563 #1f2937' : '#9ca3af #f3f4f6'
        }}>
          {error && (
            <div className="mb-6 border px-4 py-3 rounded-md"
                 style={{
                   backgroundColor: darkMode ? '#7f1d1d' : '#fef2f2',
                   borderColor: darkMode ? '#991b1b' : '#fecaca',
                   color: darkMode ? '#fca5a5' : '#dc2626'
                 }}>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 border px-4 py-3 rounded-md"
                 style={{
                   backgroundColor: darkMode ? '#064e3b' : '#f0fdf4',
                   borderColor: darkMode ? '#065f46' : '#bbf7d0',
                   color: darkMode ? '#6ee7b7' : '#16a34a'
                 }}>
              {success}
            </div>
          )}

          {/* Sync Status Indicator */}
          <div className="mb-6 rounded-lg transition-all duration-300" 
               style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
            <div className="px-6 py-4 border-b" 
                 style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
              <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Sync Status</h3>
              <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Current synchronization status</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    syncStatus.currentStatus === 'idle' ? 'bg-gray-400' :
                    syncStatus.currentStatus === 'checking' ? 'bg-yellow-500' :
                    syncStatus.currentStatus === 'syncing' ? 'bg-blue-500' :
                    syncStatus.currentStatus === 'completed' ? 'bg-green-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                    {syncStatus.currentStatus === 'idle' ? 'Idle' :
                     syncStatus.currentStatus === 'checking' ? 'Checking' :
                     syncStatus.currentStatus === 'syncing' ? 'Syncing' :
                     syncStatus.currentStatus === 'completed' ? 'Completed' :
                     'Failed'}
                  </span>
                </div>
                {syncStatus.isRunning && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                )}
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Progress</span>
                  <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>{syncStatus.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2" style={{ backgroundColor: darkMode ? '#374151' : '#e5e7eb' }}>
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${syncStatus.progress}%`,
                      backgroundColor: syncStatus.currentStatus === 'completed' ? '#10b981' :
                                   syncStatus.currentStatus === 'failed' ? '#ef4444' :
                                   '#3b82f6'
                    }}
                  ></div>
                </div>
              </div>
              
              <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                {syncStatus.statusMessage}
              </p>
            </div>
          </div>

          {/* Manual Sync Workflow Info */}
          <div className="rounded-lg transition-all duration-300 mb-6" 
               style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
            <div className="px-4 sm:px-6 py-4 border-b" 
                 style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
              <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Manual Sync Workflow</h3>
              <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>How content synchronization works</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Content Creation</p>
                    <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>When you create or update religions, topics, or content, changes are saved to the database immediately but are not yet available on mobile apps.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Manual Sync Trigger</p>
                    <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Click the "Trigger Sync" button below to make all pending changes available to mobile apps. Only admins or users with sync permissions can trigger sync.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Mobile App Update</p>
                    <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Mobile apps will receive the updated content the next time users sync or refresh their data.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
            {/* Sync Statistics */}
            <div className="rounded-lg transition-all duration-300" 
                 style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
              <div className="px-4 sm:px-6 py-4 border-b" 
                   style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Content Statistics</h3>
                <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Current content overview</p>
              </div>
              <div className="p-4 sm:p-6">
                {syncStats ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 sm:p-4 rounded-lg" 
                         style={{ backgroundColor: darkMode ? '#374151' : '#f8fafc' }}>
                      <span className="text-sm sm:text-base" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Religions</span>
                      <span className="font-semibold text-sm sm:text-base" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>{syncStats.religions}</span>
                    </div>
                                          <div className="flex justify-between items-center p-3 sm:p-4 rounded-lg" 
                           style={{ backgroundColor: darkMode ? '#374151' : '#f8fafc' }}>
                        <span className="text-sm sm:text-base" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Topics</span>
                        <span className="font-semibold text-sm sm:text-base" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>{syncStats.topics}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 sm:p-4 rounded-lg" 
                           style={{ backgroundColor: darkMode ? '#374151' : '#f8fafc' }}>
                        <span className="text-sm sm:text-base" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Content Items</span>
                        <span className="font-semibold text-sm sm:text-base" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>{syncStats.topicDetails}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 sm:p-4 rounded-lg" 
                           style={{ backgroundColor: darkMode ? '#374151' : '#f8fafc' }}>
                        <span className="text-sm sm:text-base" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Total Size</span>
                        <span className="font-semibold text-sm sm:text-base" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>{syncStats.totalSize}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 sm:p-4 rounded-lg" 
                           style={{ backgroundColor: darkMode ? '#374151' : '#f8fafc' }}>
                        <span className="text-sm sm:text-base" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Last Updated</span>
                        <span className="font-semibold text-xs sm:text-sm" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                          {new Date(syncStats.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Recent Changes Section */}
                      {syncStats.recentChanges && (
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: darkMode ? '#4b5563' : '#e5e7eb' }}>
                          <h4 className="text-sm font-medium mb-3" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Recent Changes (24h)</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 rounded" 
                                 style={{ backgroundColor: darkMode ? '#4b5563' : '#f1f5f9' }}>
                              <span className="text-xs" style={{ color: darkMode ? '#d1d5db' : '#64748b' }}>Religions</span>
                              <span className="text-xs font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>+{syncStats.recentChanges.religions}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded" 
                                 style={{ backgroundColor: darkMode ? '#4b5563' : '#f1f5f9' }}>
                              <span className="text-xs" style={{ color: darkMode ? '#d1d5db' : '#64748b' }}>Topics</span>
                              <span className="text-xs font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>+{syncStats.recentChanges.topics}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded" 
                                 style={{ backgroundColor: darkMode ? '#4b5563' : '#f1f5f9' }}>
                              <span className="text-xs" style={{ color: darkMode ? '#d1d5db' : '#64748b' }}>Content Items</span>
                              <span className="text-xs font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>+{syncStats.recentChanges.details}</span>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Loading statistics...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sync Actions */}
            <div className="rounded-lg transition-all duration-300" 
                 style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
              <div className="px-4 sm:px-6 py-4 border-b" 
                   style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Sync Actions</h3>
                <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Manage synchronization</p>
              </div>
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                                 {/* Trigger Sync */}
                                   <button
                    onClick={triggerSync}
                    disabled={syncStatus.isRunning}
                    className="w-full p-3 sm:p-4 border rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                   style={{ 
                     backgroundColor: syncStatus.currentStatus === 'completed' ? (darkMode ? '#064e3b' : '#f0fdf4') :
                              syncStatus.currentStatus === 'failed' ? (darkMode ? '#7f1d1d' : '#fef2f2') :
                              (darkMode ? '#1f2937' : '#ffffff'),
                     borderColor: syncStatus.currentStatus === 'completed' ? (darkMode ? '#065f46' : '#bbf7d0') :
                               syncStatus.currentStatus === 'failed' ? (darkMode ? '#991b1b' : '#fecaca') :
                               (darkMode ? '#374151' : '#e5e7eb')
                   }}
                 >
                   <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-3">
                       {syncStatus.isRunning ? (
                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                       ) : syncStatus.currentStatus === 'completed' ? (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              style={{ color: darkMode ? '#6ee7b7' : '#16a34a' }}>
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                         </svg>
                       ) : syncStatus.currentStatus === 'failed' ? (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                         </svg>
                       ) : (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              style={{ color: darkMode ? '#60a5fa' : '#2563eb' }}>
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                         </svg>
                       )}
                       <div className="text-left">
                         <h4 className="font-medium" style={{ 
                           color: syncStatus.currentStatus === 'completed' ? (darkMode ? '#6ee7b7' : '#16a34a') :
                                    syncStatus.currentStatus === 'failed' ? (darkMode ? '#fca5a5' : '#dc2626') :
                                    (darkMode ? '#f9fafb' : '#111827')
                         }}>
                           {syncStatus.currentStatus === 'completed' ? '✅ Sync Complete' :
                            syncStatus.currentStatus === 'failed' ? '❌ Sync Failed' :
                            syncStatus.isRunning ? '🔄 Syncing...' : '🔄 Trigger Sync'}
                         </h4>
                         <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                           {syncStatus.statusMessage}
                         </p>
                       </div>
                     </div>
                   </div>
                 </button>

                {/* Download Sync Data */}
                <button
                  onClick={downloadSyncData}
                  className="w-full p-4 border rounded-lg transition-all duration-300"
                  style={{ 
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    borderColor: darkMode ? '#374151' : '#e5e7eb'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                           style={{ color: darkMode ? '#10b981' : '#059669' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="text-left">
                        <h4 className="font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Download Sync Data</h4>
                        <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Export content for mobile apps</p>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Check Sync Status */}
                <button
                  onClick={checkSyncStatus}
                  className="w-full p-4 border rounded-lg transition-all duration-300"
                  style={{ 
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    borderColor: darkMode ? '#374151' : '#e5e7eb'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                           style={{ color: darkMode ? '#f59e0b' : '#d97706' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-left">
                        <h4 className="font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Check Status</h4>
                        <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Check for available updates</p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Sync History */}
          <div className="mt-6 rounded-lg transition-all duration-300" 
               style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
            <div className="px-4 sm:px-6 py-4 border-b" 
                 style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
              <h3 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Sync History</h3>
              <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Recent synchronization activity</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg" 
                     style={{ backgroundColor: darkMode ? '#374151' : '#f8fafc' }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: darkMode ? '#10b981' : '#059669' }}></div>
                    <div>
                      <p className="font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Sync Operations</p>
                      <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                        Total: {syncStatus.syncCount}
                      </p>
                    </div>
                  </div>
                </div>
                
                                 {syncStatus.lastSync && (
                   <div className="flex items-center justify-between p-4 rounded-lg" 
                        style={{ backgroundColor: darkMode ? '#374151' : '#f8fafc' }}>
                     <div className="flex items-center space-x-3">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: darkMode ? '#3b82f6' : '#2563eb' }}></div>
                       <div>
                         <p className="font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Last Sync</p>
                         <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                           {new Date(syncStatus.lastSync).toLocaleString()}
                         </p>
                         <p className="text-xs" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
                           {Math.round((Date.now() - new Date(syncStatus.lastSync).getTime()) / 1000 / 60)} minutes ago
                         </p>
                       </div>
                     </div>
                   </div>
                 )}

                 <div className="flex items-center justify-between p-4 rounded-lg" 
                      style={{ backgroundColor: darkMode ? '#374151' : '#f8fafc' }}>
                   <div className="flex items-center space-x-3">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: darkMode ? '#8b5cf6' : '#7c3aed' }}></div>
                     <div>
                       <p className="font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>Sync Status</p>
                       <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                         {syncStatus.currentStatus === 'idle' ? 'Ready for sync' :
                          syncStatus.currentStatus === 'checking' ? 'Checking for updates' :
                          syncStatus.currentStatus === 'syncing' ? 'Currently syncing' :
                          syncStatus.currentStatus === 'completed' ? 'Last sync successful' :
                          'Last sync failed'}
                       </p>
                     </div>
                   </div>
                 </div>

                {syncStatus.errors.length > 0 && (
                  <div className="flex items-center justify-between p-4 rounded-lg" 
                       style={{ backgroundColor: darkMode ? '#7f1d1d' : '#fef2f2' }}>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: darkMode ? '#ef4444' : '#dc2626' }}></div>
                      <div>
                        <p className="font-medium" style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>Errors</p>
                        <p className="text-sm" style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>
                          {syncStatus.errors.length} error(s) encountered
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

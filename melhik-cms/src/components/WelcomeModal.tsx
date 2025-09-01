'use client'

import { useState } from 'react'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  username: string
  role: string
}

export default function WelcomeModal({ isOpen, onClose, username, role }: WelcomeModalProps) {
  const { darkMode } = useDarkMode()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  if (!isOpen) return null

  const steps = [
    {
      title: 'Welcome to Melhik CMS!',
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👋</span>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
              Welcome, {username}!
            </h3>
            <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
              Your account has been successfully created and you're now part of the Melhik CMS team.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm" style={{ color: darkMode ? '#bfdbfe' : '#1e40af' }}>
              <strong>Role:</strong> {role === 'admin' ? 'Administrator' : 'Content Manager'}
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Getting Started',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold" style={{ color: darkMode ? '#6ee7b7' : '#059669' }}>1</span>
              </div>
              <div>
                <h4 className="text-sm font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                  Change Your Password
                </h4>
                <p className="text-xs" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  You'll be prompted to change your temporary password on the next screen.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold" style={{ color: darkMode ? '#93c5fd' : '#2563eb' }}>2</span>
              </div>
              <div>
                <h4 className="text-sm font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                  Explore the Dashboard
                </h4>
                <p className="text-xs" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  Navigate through the sidebar to access different sections based on your permissions.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold" style={{ color: darkMode ? '#c4b5fd' : '#7c3aed' }}>3</span>
              </div>
              <div>
                <h4 className="text-sm font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                  Start Managing Content
                </h4>
                <p className="text-xs" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  Begin creating and managing religions, topics, and content.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Security & Best Practices',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2" style={{ color: darkMode ? '#fbbf24' : '#d97706' }}>
                🔒 Security Reminders
              </h4>
              <ul className="text-xs space-y-1" style={{ color: darkMode ? '#fcd34d' : '#92400e' }}>
                <li>• Choose a strong, unique password</li>
                <li>• Never share your credentials</li>
                <li>• Log out when using shared devices</li>
                <li>• Report any suspicious activity</li>
              </ul>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2" style={{ color: darkMode ? '#10b981' : '#059669' }}>
                💡 Tips for Success
              </h4>
              <ul className="text-xs space-y-1" style={{ color: darkMode ? '#6ee7b7' : '#047857' }}>
                <li>• Use descriptive titles for content</li>
                <li>• Organize content with proper categories</li>
                <li>• Save your work frequently</li>
                <li>• Reach out to admins for help</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
    }
  }

  const handleSkip = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(2px)' }}>
      <div className="rounded-lg shadow-xl max-w-md w-full" style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium" style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
              {steps[currentStep - 1].title}
            </h2>
            <button
              onClick={handleSkip}
              className="text-sm px-3 py-1 rounded transition-colors"
              style={{
                backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                color: darkMode ? '#d1d5db' : '#374151'
              }}
            >
              Skip
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex space-x-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full flex-1 transition-colors ${
                    i < currentStep 
                      ? 'bg-blue-600' 
                      : darkMode ? 'bg-gray-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs mt-1" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {steps[currentStep - 1].content}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t flex justify-between" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-sm rounded-md transition-colors"
            style={{
              backgroundColor: darkMode ? '#374151' : '#f3f4f6',
              color: darkMode ? '#d1d5db' : '#374151'
            }}
          >
            Skip Tour
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {currentStep === totalSteps ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}


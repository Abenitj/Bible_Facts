'use client'

import { useState, useRef } from 'react'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface ContentBlock {
  id?: string
  blockType: 'text' | 'image' | 'mixed' | 'gallery'
  contentData: any
  orderIndex?: number
}

interface ContentBlockEditorProps {
  block: ContentBlock
  onUpdate: (block: ContentBlock) => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
}

export default function ContentBlockEditor({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false
}: ContentBlockEditorProps) {
  const { darkMode } = useDarkMode()
  const [isEditing, setIsEditing] = useState(false)
  const [localContent, setLocalContent] = useState(block.contentData)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    onUpdate({
      ...block,
      contentData: localContent
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setLocalContent(block.contentData)
    setIsEditing(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('alt', localContent.alt || '')
      formData.append('caption', localContent.caption || '')

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cms_token')}`
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        setLocalContent({
          ...localContent,
          url: result.data.url,
          fileName: result.data.fileName,
          size: result.data.size,
          type: result.data.type
        })
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    }
  }

  const handleExternalUrlChange = async (url: string) => {
    if (!url) {
      setLocalContent({ ...localContent, url: '' })
      return
    }

    try {
      const response = await fetch('/api/images/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('cms_token')}`
        },
        body: JSON.stringify({ url, alt: localContent.alt || '', caption: localContent.caption || '' })
      })

      if (response.ok) {
        const result = await response.json()
        setLocalContent({
          ...localContent,
          url: result.data.url,
          accessible: result.data.accessible,
          warning: result.data.warning
        })
      } else {
        const error = await response.json()
        alert(`URL validation failed: ${error.error}`)
      }
    } catch (error) {
      console.error('URL validation error:', error)
      setLocalContent({ ...localContent, url })
    }
  }

  const renderBlockContent = () => {
    switch (block.blockType) {
      case 'text':
        return (
          <div className="space-y-3">
            <textarea
              value={localContent.text || ''}
              onChange={(e) => setLocalContent({ ...localContent, text: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: darkMode ? '#374151' : '#ffffff',
                borderColor: darkMode ? '#4b5563' : '#d1d5db',
                color: darkMode ? '#ffffff' : '#000000'
              }}
              placeholder="Enter text content..."
            />
          </div>
        )

      case 'image':
        return (
          <div className="space-y-3">
            {/* Image URL Input */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                Image URL
              </label>
              <input
                type="url"
                value={localContent.url || ''}
                onChange={(e) => handleExternalUrlChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                  color: darkMode ? '#ffffff' : '#000000'
                }}
                placeholder="Enter image URL or upload file below"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                Or Upload File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-3 py-2 border-2 border-dashed rounded-md transition-colors"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#f9fafb',
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                  color: darkMode ? '#d1d5db' : '#374151'
                }}
              >
                Click to upload image
              </button>
            </div>

            {/* Image Preview */}
            {localContent.url && (
              <div className="mt-3">
                <img
                  src={localContent.url}
                  alt={localContent.alt || ''}
                  className="max-w-full h-auto max-h-64 rounded-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                {localContent.warning && (
                  <p className="text-sm text-yellow-600 mt-1">{localContent.warning}</p>
                )}
              </div>
            )}

            {/* Alt Text */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                Alt Text (for accessibility)
              </label>
              <input
                type="text"
                value={localContent.alt || ''}
                onChange={(e) => setLocalContent({ ...localContent, alt: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                  color: darkMode ? '#ffffff' : '#000000'
                }}
                placeholder="Describe the image for accessibility"
              />
            </div>

            {/* Caption */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                Caption
              </label>
              <input
                type="text"
                value={localContent.caption || ''}
                onChange={(e) => setLocalContent({ ...localContent, caption: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                  color: darkMode ? '#ffffff' : '#000000'
                }}
                placeholder="Image caption (optional)"
              />
            </div>
          </div>
        )

      case 'mixed':
        return (
          <div className="space-y-4">
            {/* Text Content */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                Text Content
              </label>
              <textarea
                value={localContent.text || ''}
                onChange={(e) => setLocalContent({ ...localContent, text: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                  color: darkMode ? '#ffffff' : '#000000'
                }}
                placeholder="Enter text content..."
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                Images
              </label>
              <div className="space-y-2">
                {(localContent.images || []).map((image: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2 p-2 border rounded-md" style={{ borderColor: darkMode ? '#4b5563' : '#d1d5db' }}>
                    <input
                      type="url"
                      value={image.url || ''}
                      onChange={(e) => {
                        const newImages = [...(localContent.images || [])]
                        newImages[index] = { ...newImages[index], url: e.target.value }
                        setLocalContent({ ...localContent, images: newImages })
                      }}
                      className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={{
                        backgroundColor: darkMode ? '#374151' : '#ffffff',
                        borderColor: darkMode ? '#4b5563' : '#d1d5db',
                        color: darkMode ? '#ffffff' : '#000000'
                      }}
                      placeholder="Image URL"
                    />
                    <input
                      type="text"
                      value={image.caption || ''}
                      onChange={(e) => {
                        const newImages = [...(localContent.images || [])]
                        newImages[index] = { ...newImages[index], caption: e.target.value }
                        setLocalContent({ ...localContent, images: newImages })
                      }}
                      className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={{
                        backgroundColor: darkMode ? '#374151' : '#ffffff',
                        borderColor: darkMode ? '#4b5563' : '#d1d5db',
                        color: darkMode ? '#ffffff' : '#000000'
                      }}
                      placeholder="Caption"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = (localContent.images || []).filter((_: any, i: number) => i !== index)
                        setLocalContent({ ...localContent, images: newImages })
                      }}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newImages = [...(localContent.images || []), { url: '', caption: '' }]
                    setLocalContent({ ...localContent, images: newImages })
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Image
                </button>
              </div>
            </div>
          </div>
        )

      case 'gallery':
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              {(localContent.images || []).map((image: any, index: number) => (
                <div key={index} className="flex items-center space-x-2 p-2 border rounded-md" style={{ borderColor: darkMode ? '#4b5563' : '#d1d5db' }}>
                  <input
                    type="url"
                    value={image.url || ''}
                    onChange={(e) => {
                      const newImages = [...(localContent.images || [])]
                      newImages[index] = { ...newImages[index], url: e.target.value }
                      setLocalContent({ ...localContent, images: newImages })
                    }}
                    className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    style={{
                      backgroundColor: darkMode ? '#374151' : '#ffffff',
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                      color: darkMode ? '#ffffff' : '#000000'
                    }}
                    placeholder="Image URL"
                  />
                  <input
                    type="text"
                    value={image.caption || ''}
                    onChange={(e) => {
                      const newImages = [...(localContent.images || [])]
                      newImages[index] = { ...newImages[index], caption: e.target.value }
                      setLocalContent({ ...localContent, images: newImages })
                    }}
                    className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    style={{
                      backgroundColor: darkMode ? '#374151' : '#ffffff',
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                      color: darkMode ? '#ffffff' : '#000000'
                    }}
                    placeholder="Caption"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = (localContent.images || []).filter((_: any, i: number) => i !== index)
                      setLocalContent({ ...localContent, images: newImages })
                    }}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newImages = [...(localContent.images || []), { url: '', caption: '' }]
                  setLocalContent({ ...localContent, images: newImages })
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Image
              </button>
            </div>
          </div>
        )

      default:
        return <div>Unknown block type</div>
    }
  }

  return (
    <div className="border rounded-lg p-4" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium px-2 py-1 rounded" style={{ 
            backgroundColor: darkMode ? '#374151' : '#f3f4f6',
            color: darkMode ? '#d1d5db' : '#374151'
          }}>
            {block.blockType.charAt(0).toUpperCase() + block.blockType.slice(1)} Block
          </span>
          {block.orderIndex && (
            <span className="text-xs text-gray-500">#{block.orderIndex}</span>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {canMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1 text-gray-600 hover:text-gray-800"
              title="Move up"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
          {canMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1 text-gray-600 hover:text-gray-800"
              title="Move down"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title={isEditing ? "Preview" : "Edit"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isEditing ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              )}
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete block"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          {renderBlockContent()}
          <div className="flex space-x-2 pt-3">
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
          {block.blockType === 'text' && (
            <div className="whitespace-pre-wrap">{localContent.text || 'No text content'}</div>
          )}
          {block.blockType === 'image' && (
            <div>
              {localContent.url ? (
                <div>
                  <img src={localContent.url} alt={localContent.alt || ''} className="max-w-full h-auto max-h-32 rounded" />
                  {localContent.caption && <p className="mt-1 italic">{localContent.caption}</p>}
                </div>
              ) : (
                <p>No image URL provided</p>
              )}
            </div>
          )}
          {block.blockType === 'mixed' && (
            <div>
              {localContent.text && <div className="mb-2 whitespace-pre-wrap">{localContent.text}</div>}
              {localContent.images && localContent.images.length > 0 && (
                <div className="space-y-1">
                  {localContent.images.map((img: any, index: number) => (
                    <div key={index} className="text-xs">
                      {img.url ? (
                        <div>
                          <img src={img.url} alt={img.caption || ''} className="max-w-full h-auto max-h-16 rounded" />
                          {img.caption && <p className="italic">{img.caption}</p>}
                        </div>
                      ) : (
                        <p>Image {index + 1}: No URL</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {block.blockType === 'gallery' && (
            <div>
              {localContent.images && localContent.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {localContent.images.map((img: any, index: number) => (
                    <div key={index}>
                      {img.url ? (
                        <div>
                          <img src={img.url} alt={img.caption || ''} className="w-full h-auto max-h-16 object-cover rounded" />
                          {img.caption && <p className="text-xs italic mt-1">{img.caption}</p>}
                        </div>
                      ) : (
                        <div className="w-full h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                          No image
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No images in gallery</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}


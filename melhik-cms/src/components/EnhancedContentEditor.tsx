'use client'

import { useState, useEffect } from 'react'
import { useDarkMode } from '@/contexts/DarkModeContext'
import ContentBlockEditor from './ContentBlockEditor'

interface ContentBlock {
  id?: string
  blockType: 'text' | 'image' | 'mixed' | 'gallery' | 'title' | 'subtitle' | 'list'
  contentData: any
  orderIndex?: number
}

interface TopicDetail {
  id: number
  topicId: number
  version: number
  useBlocks: boolean
  contentBlocks?: ContentBlock[]
}

interface EnhancedContentEditorProps {
  topicId: number
  initialContent?: TopicDetail
  onSave: (content: any) => void
  onCancel: () => void
}

export default function EnhancedContentEditor({
  topicId,
  initialContent,
  onSave,
  onCancel
}: EnhancedContentEditorProps) {
  const { darkMode } = useDarkMode()
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialContent && initialContent.contentBlocks) {
      setBlocks(initialContent.contentBlocks.map(block => ({
        ...block,
        contentData: typeof block.contentData === 'string' 
          ? JSON.parse(block.contentData) 
          : block.contentData
      })))
    }
  }, [initialContent])

  const addBlock = (blockType: 'text' | 'image' | 'mixed' | 'gallery' | 'title' | 'subtitle' | 'list') => {
    const newBlock: ContentBlock = {
      id: `block_${Date.now()}`,
      blockType,
      contentData: getDefaultContentData(blockType),
      orderIndex: blocks.length + 1
    }
    setBlocks([...blocks, newBlock])
  }

  const getDefaultContentData = (blockType: string) => {
    switch (blockType) {
      case 'text':
        return { text: '' }
      case 'image':
        return { url: '', alt: '', caption: '' }
      case 'mixed':
        return { text: '', images: [] }
      case 'gallery':
        return { images: [] }
      case 'title':
        return { text: '' }
      case 'subtitle':
        return { text: '' }
      case 'list':
        return { items: [''] }
      default:
        return {}
    }
  }

  const updateBlock = (index: number, updatedBlock: ContentBlock) => {
    const newBlocks = [...blocks]
    newBlocks[index] = { ...updatedBlock, orderIndex: index + 1 }
    setBlocks(newBlocks)
  }

  const deleteBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index)
    // Reorder remaining blocks
    newBlocks.forEach((block, i) => {
      block.orderIndex = i + 1
    })
    setBlocks(newBlocks)
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex >= 0 && targetIndex < newBlocks.length) {
      [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]]
      // Update order indices
      newBlocks.forEach((block, i) => {
        block.orderIndex = i + 1
      })
      setBlocks(newBlocks)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Save using content blocks API
      const response = await fetch(`/api/topics/${topicId}/content/blocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('cms_token')}`
        },
        body: JSON.stringify({
          blocks: blocks.map(block => ({
            blockType: block.blockType,
            contentData: block.contentData
          })),
          useBlocks: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save content blocks')
      }

      const result = await response.json()
      onSave(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="space-y-6" style={{ color: darkMode ? '#ffffff' : '#000000' }}>
      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Block-based Content Editor */}
      <div className="space-y-4">
        {/* Add Block Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addBlock('title')}
            className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            + Title
          </button>
          <button
            type="button"
            onClick={() => addBlock('subtitle')}
            className="px-3 py-2 text-sm bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors"
          >
            + Subtitle
          </button>
          <button
            type="button"
            onClick={() => addBlock('text')}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            + Text Block
          </button>
          <button
            type="button"
            onClick={() => addBlock('list')}
            className="px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            + List Block
          </button>
          <button
            type="button"
            onClick={() => addBlock('image')}
            className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            + Image Block
          </button>
          <button
            type="button"
            onClick={() => addBlock('mixed')}
            className="px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            + Mixed Block
          </button>
          <button
            type="button"
            onClick={() => addBlock('gallery')}
            className="px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
          >
            + Gallery Block
          </button>
        </div>

        {/* Content Blocks */}
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <ContentBlockEditor
              key={block.id || index}
              block={block}
              onUpdate={(updatedBlock) => updateBlock(index, updatedBlock)}
              onDelete={() => deleteBlock(index)}
              onMoveUp={index > 0 ? () => moveBlock(index, 'up') : undefined}
              onMoveDown={index < blocks.length - 1 ? () => moveBlock(index, 'down') : undefined}
              canMoveUp={index > 0}
              canMoveDown={index < blocks.length - 1}
            />
          ))}
        </div>

        {blocks.length === 0 && (
          <div className="text-center py-8 text-gray-500" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
            No content blocks yet. Add your first block to get started.
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          style={{
            backgroundColor: darkMode ? '#374151' : '#ffffff',
            borderColor: darkMode ? '#4b5563' : '#d1d5db',
            color: darkMode ? '#d1d5db' : '#374151'
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Content'}
        </button>
      </div>
    </div>
  )
}

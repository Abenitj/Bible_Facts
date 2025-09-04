'use client'

import React, { useState, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent } from './ui/card'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from './ui/alert'

interface ImageUploadProps {
  value?: string
  altText?: string
  onImageChange: (imageUrl: string, altText: string) => void
  onRemove?: () => void
  disabled?: boolean
  label?: string
  description?: string
}

export default function ImageUpload({
  value,
  altText = '',
  onImageChange,
  onRemove,
  disabled = false,
  label = 'Image',
  description
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)
  const [altTextValue, setAltTextValue] = useState(altText)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WebP, or SVG)')
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError('File size must be less than 5MB')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      if (result.success) {
        const imageUrl = result.data.url
        setPreviewUrl(imageUrl)
        onImageChange(imageUrl, altTextValue)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlChange = (url: string) => {
    setPreviewUrl(url)
    onImageChange(url, altTextValue)
  }

  const handleAltTextChange = (text: string) => {
    setAltTextValue(text)
    onImageChange(previewUrl || '', text)
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    setAltTextValue('')
    onImageChange('', '')
    if (onRemove) {
      onRemove()
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image-upload" className="text-sm font-medium">
          {label}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-4">
          {previewUrl ? (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt={altTextValue || 'Preview'}
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemove}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  type="url"
                  value={previewUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alt-text">Alt Text (for accessibility)</Label>
                <Input
                  id="alt-text"
                  type="text"
                  value={altTextValue}
                  onChange={(e) => handleAltTextChange(e.target.value)}
                  placeholder="Describe the image for screen readers"
                  disabled={disabled}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload an image or enter an image URL
              </p>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUploadClick}
                  disabled={disabled || isUploading}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </Button>
                
                <div className="text-xs text-muted-foreground">
                  Or enter an image URL below
                </div>
                
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  onChange={(e) => handleUrlChange(e.target.value)}
                  disabled={disabled}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </div>
  )
}

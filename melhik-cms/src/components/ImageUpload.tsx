'use client'

import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent } from './ui/card'
import { X, Image as ImageIcon, AlertCircle } from 'lucide-react'
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
  label = 'Image URL',
  description
}: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)
  const [altTextValue, setAltTextValue] = useState(altText)

  const handleUrlChange = (url: string) => {
    setError(null)
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
  }

  const validateUrl = (url: string) => {
    if (!url) return true
    try {
      new URL(url)
      return true
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com/image.jpg)')
      return false
    }
  }

  const handleUrlBlur = (url: string) => {
    if (url && !validateUrl(url)) {
      return
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image-url" className="text-sm font-medium">
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
                  onError={() => {
                    setError('Failed to load image. Please check the URL.')
                  }}
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
                  onBlur={(e) => handleUrlBlur(e.target.value)}
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
                Enter an image URL
              </p>
              <div className="space-y-2">
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onBlur={(e) => handleUrlBlur(e.target.value)}
                  disabled={disabled}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a direct URL to an image file
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

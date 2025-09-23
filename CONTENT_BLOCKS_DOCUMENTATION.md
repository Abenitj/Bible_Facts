# Enhanced Content System Documentation

## Overview

The enhanced content system allows for flexible, block-based content creation with support for multiple content types including text, images, mixed content, and galleries. This system provides both traditional content editing and modern block-based editing capabilities.

## Features

### Content Modes

1. **Traditional Mode**: The original content system with single explanation text, bible verses, key points, and references
2. **Block-based Mode**: New flexible system with multiple content blocks that can be arranged in any order

### Content Block Types

#### 1. Text Block
- **Purpose**: Display text content with rich formatting
- **Data Structure**: `{ text: string }`
- **Use Case**: Main explanations, descriptions, or any text content

#### 2. Image Block
- **Purpose**: Display a single image with caption and alt text
- **Data Structure**: 
  ```json
  {
    "url": "string",
    "alt": "string",
    "caption": "string"
  }
  ```
- **Use Case**: Illustrations, diagrams, or explanatory images
- **Image Sources**: External URLs or uploaded files

#### 3. Mixed Block
- **Purpose**: Combine text and multiple images in one block
- **Data Structure**:
  ```json
  {
    "text": "string",
    "images": [
      {
        "url": "string",
        "caption": "string"
      }
    ]
  }
  ```
- **Use Case**: Content that needs both text explanation and supporting images

#### 4. Gallery Block
- **Purpose**: Display multiple images in a grid layout
- **Data Structure**:
  ```json
  {
    "images": [
      {
        "url": "string",
        "caption": "string"
      }
    ]
  }
  ```
- **Use Case**: Photo galleries, step-by-step illustrations, or multiple related images

## Database Schema

### ContentBlock Table
```sql
CREATE TABLE "content_blocks" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "topicDetailId" INTEGER NOT NULL,
  "blockType" TEXT NOT NULL,
  "contentData" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("topicDetailId") REFERENCES "topic_details" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
```

### TopicDetail Table Updates
- Added `useBlocks` boolean field to indicate if content uses block-based system
- Existing content remains compatible with traditional system

## API Endpoints

### Content Blocks Management
- `GET /api/topics/[id]/content/blocks` - Get all content blocks for a topic
- `POST /api/topics/[id]/content/blocks` - Create new content blocks
- `PUT /api/topics/[id]/content/blocks` - Update existing content blocks
- `DELETE /api/topics/[id]/content/blocks` - Delete all content blocks

### Image Management
- `POST /api/images/upload` - Upload image file to server
- `POST /api/images/validate` - Validate external image URL

## Usage Examples

### Creating Content with Blocks

1. **Text Block**:
   ```json
   {
     "blockType": "text",
     "contentData": {
       "text": "This is the main explanation of the topic..."
     }
   }
   ```

2. **Image Block**:
   ```json
   {
     "blockType": "image",
     "contentData": {
       "url": "https://example.com/image.jpg",
       "alt": "Description for accessibility",
       "caption": "Image caption text"
     }
   }
   ```

3. **Mixed Block**:
   ```json
   {
     "blockType": "mixed",
     "contentData": {
       "text": "Here's the explanation with supporting images:",
       "images": [
         {
           "url": "https://example.com/image1.jpg",
           "caption": "First supporting image"
         },
         {
           "url": "https://example.com/image2.jpg",
           "caption": "Second supporting image"
         }
       ]
     }
   }
   ```

4. **Gallery Block**:
   ```json
   {
     "blockType": "gallery",
     "contentData": {
       "images": [
         {
           "url": "https://example.com/photo1.jpg",
           "caption": "Photo 1"
         },
         {
           "url": "https://example.com/photo2.jpg",
           "caption": "Photo 2"
         },
         {
           "url": "https://example.com/photo3.jpg",
           "caption": "Photo 3"
         }
       ]
     }
   }
   ```

## Migration Strategy

### Backward Compatibility
- Existing content continues to work with the traditional system
- New content can use either traditional or block-based system
- The `useBlocks` field determines which system to use

### Content Migration
- Traditional content can be converted to block-based by creating a text block with the existing explanation
- No automatic migration is performed to preserve existing content structure

## Mobile App Integration

### ContentBlockRenderer Component
- Renders different block types appropriately on mobile devices
- Handles image loading and error states
- Supports both light and dark themes
- Responsive design for different screen sizes

### TopicDetailScreen Updates
- Automatically detects content mode (traditional vs block-based)
- Renders content blocks when available
- Falls back to traditional content display
- Updated share functionality to include block content

## Best Practices

### Content Creation
1. Use text blocks for main explanations
2. Use image blocks for single supporting images
3. Use mixed blocks when text and images are closely related
4. Use gallery blocks for multiple related images
5. Maintain consistent order and flow

### Image Management
1. Use descriptive alt text for accessibility
2. Provide meaningful captions
3. Optimize images for mobile viewing
4. Consider using external URLs for large images
5. Upload files for images that need to be permanently available

### Performance Considerations
1. Limit the number of images per block
2. Use appropriate image sizes
3. Consider lazy loading for large galleries
4. Cache frequently accessed images

## Future Enhancements

### Planned Features
1. Video block support
2. Audio block support
3. Interactive content blocks
4. Advanced text formatting
5. Content templates
6. Bulk content operations

### Technical Improvements
1. Image optimization and compression
2. CDN integration for uploaded files
3. Advanced caching strategies
4. Content versioning and history
5. Collaborative editing features

## Troubleshooting

### Common Issues
1. **Images not loading**: Check URL validity and network connectivity
2. **Content not displaying**: Verify block data structure and order
3. **Upload failures**: Check file size limits and supported formats
4. **Performance issues**: Optimize image sizes and reduce block count

### Debug Information
- Check browser console for JavaScript errors
- Verify API responses in network tab
- Check database for correct content structure
- Validate JSON data format

## Support

For technical support or feature requests, please refer to the development team or create an issue in the project repository.


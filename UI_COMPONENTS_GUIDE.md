# Modern UI Components Guide

## Overview

This guide covers the modern UI components added to enhance the mobile app, especially the Topic Detail page.

## 🎨 New Components

### 1. ImageCarousel Component

A modern, feature-rich image carousel component with swipe gestures, pagination, and full-screen viewing.

**Location**: `components/ImageCarousel.js`

**Features**:
- ✅ Swipeable images with smooth animations
- ✅ Pagination dots with animated indicators
- ✅ Full-screen image viewer
- ✅ Loading states with activity indicators
- ✅ Error handling with fallback UI
- ✅ Dark mode support
- ✅ Image counter badge
- ✅ Caption support
- ✅ Auto-play option (optional)
- ✅ Single image support with full-screen capability

**Usage**:

```jsx
import ImageCarousel from '../components/ImageCarousel';

// Basic usage
<ImageCarousel 
  images={imageArray}
  height={400}
  showPagination={true}
  showFullScreen={true}
/>

// With auto-play
<ImageCarousel 
  images={imageArray}
  height={400}
  autoPlay={true}
  autoPlayInterval={3000}
/>

// Single image with full-screen
<ImageCarousel 
  images={[singleImage]}
  height={400}
  showPagination={false}
  showFullScreen={true}
/>
```

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `array` | `[]` | Array of image objects or URLs |
| `height` | `number` | `300` | Carousel height in pixels |
| `showPagination` | `boolean` | `true` | Show pagination dots |
| `showFullScreen` | `boolean` | `true` | Enable full-screen viewer |
| `autoPlay` | `boolean` | `false` | Auto-play carousel |
| `autoPlayInterval` | `number` | `3000` | Auto-play interval in ms |
| `style` | `object` | `undefined` | Additional styles |

**Image Object Format**:

```javascript
{
  url: 'https://example.com/image.jpg',
  imageUrl: 'https://example.com/image.jpg', // Alternative
  caption: 'Image caption text',
  altText: 'Alternative text' // Alternative caption
}
```

### 2. Enhanced ContentBlockRenderer

The ContentBlockRenderer now uses the ImageCarousel for better image display.

**Improvements**:
- ✅ Images use carousel component
- ✅ Galleries use carousel with pagination
- ✅ Mixed content blocks use carousel for images
- ✅ All text uses AmharicText component
- ✅ Better typography with AmharicText variants

**Supported Block Types**:
- `text` - Text content with AmharicText
- `image` - Single image with carousel
- `gallery` - Multiple images with carousel
- `mixed` - Text + images with carousel
- `title` - Title with AmharicText heading variant
- `subtitle` - Subtitle with AmharicText subheading variant
- `list` - Bulleted list

### 3. Enhanced TopicDetailScreen

The Topic Detail screen has been completely modernized with:

**UI Improvements**:
- ✅ SafeAreaView for proper screen insets
- ✅ All text uses AmharicText component
- ✅ Amharic translations for all UI text
- ✅ Better error states with AmharicText
- ✅ Improved loading states
- ✅ Modern hero section
- ✅ Enhanced question card
- ✅ Better content section header

**Amharic Translations**:
- "Loading..." → "ይጠብቃል..."
- "Error Loading Content" → "ስህተት ተፈጥሯል"
- "Try Again" → "እንደገና ሞክር"
- "Topic Not Found" → "ርዕስ አልተገኘም"
- "Go Back" → "ተመለስ"
- "What is this topic about?" → "ይህ ርዕስ ስለ ምን ነው?"
- "Content" → "ይዘት"
- "content blocks" → "የይዘት ክፍሎች"
- "No Content Available" → "ይዘት የለም"

## 🎯 Usage Examples

### Using ImageCarousel in Content Blocks

The carousel is automatically used when rendering:
- `image` block types
- `gallery` block types  
- `mixed` block types with images

### Custom Image Carousel

```jsx
import ImageCarousel from '../components/ImageCarousel';

const MyComponent = () => {
  const images = [
    { url: 'https://example.com/img1.jpg', caption: 'First image' },
    { url: 'https://example.com/img2.jpg', caption: 'Second image' },
    { url: 'https://example.com/img3.jpg' },
  ];

  return (
    <ImageCarousel
      images={images}
      height={400}
      showPagination={true}
      showFullScreen={true}
      autoPlay={false}
    />
  );
};
```

### Full-Screen Image Viewer

The carousel automatically provides a full-screen viewer:
1. Tap any image in the carousel
2. View in full-screen mode
3. Swipe between images
4. See image counter
5. View captions
6. Tap close button to exit

## 🎨 Styling

### ImageCarousel Styles

The carousel adapts to:
- Dark mode automatically
- Screen dimensions
- Safe area insets
- Platform-specific styling (iOS/Android)

### Custom Styling

```jsx
<ImageCarousel
  images={images}
  style={{
    borderRadius: 12,
    marginVertical: 16,
  }}
/>
```

## 🔧 Technical Details

### Performance
- Uses `Animated.ScrollView` for smooth scrolling
- Lazy loading for images
- Optimized re-renders
- Native driver animations

### Accessibility
- Proper touch targets
- Loading indicators
- Error states
- Caption support

### Platform Support
- ✅ iOS
- ✅ Android
- ✅ Web (with limitations)

## 📱 User Experience

### Image Carousel Features
1. **Swipe Gestures**: Natural swipe to navigate
2. **Pagination Dots**: Visual indicator of current image
3. **Image Counter**: Shows "1 / 5" format
4. **Full-Screen**: Tap to view full-screen
5. **Captions**: Display image captions
6. **Loading States**: Smooth loading indicators
7. **Error Handling**: Graceful error fallbacks

### Topic Detail Page Features
1. **Hero Section**: Beautiful gradient header
2. **Question Card**: Elevated card with topic description
3. **Content Blocks**: Rendered with carousel for images
4. **Smooth Animations**: Fade and slide animations
5. **Amharic Support**: Full Amharic interface
6. **Dark Mode**: Complete dark mode support

## 🚀 Best Practices

1. **Image Sizes**: Use optimized images (recommended: 800-1200px width)
2. **Image Format**: Use WebP or JPEG for better performance
3. **Captions**: Keep captions concise (1-2 lines)
4. **Image Count**: Limit galleries to 10-15 images for best performance
5. **Loading States**: Always show loading indicators
6. **Error Handling**: Provide meaningful error messages

## 🐛 Troubleshooting

### Images Not Loading
- Check image URLs are valid
- Verify network connectivity
- Check image format support
- Review error console for details

### Carousel Not Scrolling
- Ensure multiple images are provided
- Check image array is not empty
- Verify ScrollView is properly configured

### Full-Screen Not Working
- Ensure `showFullScreen={true}`
- Check Modal permissions
- Verify image URLs are accessible

## 📚 Related Components

- `AmharicText` - Enhanced text component
- `ContentBlockRenderer` - Content block renderer
- `TopicDetailScreen` - Topic detail screen
- `ImageSlider` - Home screen image slider

---

**Note**: All components are optimized for React Native and Expo, with full support for Amharic language and dark mode.





# ImageCard Component - Professional Image Display

## Overview

The `ImageCard` component is a modern, professional image display component for React Native with smooth animations, caching support, and beautiful UI.

## Features

✅ **Modern Design** - Professional card with shadows and rounded corners  
✅ **Smooth Animations** - Fade-in and scale animations on load  
✅ **Loading States** - Shimmer effect and loading indicator  
✅ **Error Handling** - Graceful error states with Amharic text  
✅ **Image Caching** - Automatic local image caching  
✅ **Caption Support** - Beautiful caption display  
✅ **Full-Screen Ready** - Tap to view full-screen  
✅ **Dark Mode** - Full dark mode support  
✅ **Touch Feedback** - Smooth press animations  

## Usage

### Basic Usage

```jsx
import ImageCard from '../components/ImageCard';

<ImageCard
  imageUrl="http://192.168.0.122:3000/uploads/content/image.jpg"
  height={300}
/>
```

### With Caption

```jsx
<ImageCard
  imageUrl="http://192.168.0.122:3000/uploads/content/image.jpg"
  caption="ይህ ምስል ስለ ክርስትና ያስረዳል"
  height={400}
/>
```

### Custom Styling

```jsx
<ImageCard
  imageUrl={imageUrl}
  height={350}
  borderRadius={20}
  style={{ marginVertical: 16 }}
  containerStyle={{ paddingHorizontal: 16 }}
/>
```

### With Callbacks

```jsx
<ImageCard
  imageUrl={imageUrl}
  onPress={() => console.log('Image pressed')}
  onLongPress={() => console.log('Image long pressed')}
  height={300}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imageUrl` | `string` | Required | Image URL to display |
| `caption` | `string` | `undefined` | Image caption text |
| `altText` | `string` | `undefined` | Alternative text (used if no caption) |
| `height` | `number` | `300` | Image card height |
| `borderRadius` | `number` | `16` | Border radius for card |
| `onPress` | `function` | `undefined` | Callback when image is pressed |
| `onLongPress` | `function` | `undefined` | Callback when image is long pressed |
| `showCaption` | `boolean` | `true` | Show/hide caption |
| `showFullScreen` | `boolean` | `true` | Show full-screen indicator |
| `style` | `object` | `undefined` | Additional card styles |
| `containerStyle` | `object` | `undefined` | Container styles |

## Features Explained

### 1. Smooth Animations
- **Fade-in**: Image fades in when loaded
- **Scale**: Subtle scale animation on load
- **Shimmer**: Loading shimmer effect

### 2. Loading States
- Shimmer animation while loading
- Activity indicator with Amharic text
- Smooth transitions

### 3. Error Handling
- Beautiful error state with icon
- Amharic error messages
- Graceful fallback

### 4. Image Caching
- Automatically uses cached images
- Downloads and caches in background
- Works offline after initial cache

### 5. Caption Display
- Professional caption container
- Icon indicator
- Supports Amharic text
- Multi-line support

### 6. Full-Screen Indicator
- Badge showing full-screen available
- Tap to view full-screen
- Smooth transitions

## Examples

### Single Image Card

```jsx
<ImageCard
  imageUrl="http://192.168.0.122:3000/uploads/content/image.jpg"
  caption="ይህ ምስል ስለ ክርስትና ያስረዳል"
  height={400}
  borderRadius={16}
/>
```

### Image in List

```jsx
<FlatList
  data={images}
  renderItem={({ item }) => (
    <ImageCard
      imageUrl={item.url}
      caption={item.caption}
      height={250}
      style={{ marginBottom: 16 }}
    />
  )}
/>
```

### Custom Height

```jsx
<ImageCard
  imageUrl={imageUrl}
  height={500}
  borderRadius={20}
  showCaption={false}
/>
```

## Integration

### With ImageCarousel

The ImageCarousel automatically uses ImageCard for better display:

```jsx
<ImageCarousel
  images={imageArray}
  height={400}
  showFullScreen={true}
/>
```

### With ContentBlockRenderer

Content blocks automatically use ImageCard:

```jsx
// In content blocks
{
  blockType: 'image',
  contentData: {
    url: 'http://...',
    caption: 'Image caption'
  }
}
```

## Styling

### Custom Border Radius

```jsx
<ImageCard
  imageUrl={imageUrl}
  borderRadius={0}  // Square corners
  height={300}
/>
```

### Custom Container

```jsx
<ImageCard
  imageUrl={imageUrl}
  containerStyle={{
    paddingHorizontal: 20,
    marginVertical: 10,
  }}
/>
```

## Dark Mode

The component automatically adapts to dark mode:

```jsx
// Automatically uses theme colors
<ImageCard
  imageUrl={imageUrl}
  height={300}
/>
```

## Performance

- **Lazy Loading**: Images load on demand
- **Caching**: Uses cached images when available
- **Optimized**: Smooth 60fps animations
- **Memory Efficient**: Proper cleanup

## Best Practices

1. **Use Appropriate Heights**: Match content needs
2. **Provide Captions**: Better user experience
3. **Handle Errors**: Component handles gracefully
4. **Use Caching**: Images cache automatically
5. **Test Offline**: Verify cached images work

## Troubleshooting

### Image Not Loading

1. Check image URL is valid
2. Verify network connection
3. Check cache status
4. Review error logs

### Caption Not Showing

1. Ensure `showCaption={true}` (default)
2. Provide `caption` or `altText` prop
3. Check text is not empty

### Animation Issues

1. Ensure native driver is enabled
2. Check for performance issues
3. Verify React Native version

## Files

- `components/ImageCard.js` - Main component
- `components/ImageCarousel.js` - Uses ImageCard
- `components/ContentBlockRenderer.js` - Uses ImageCard

---

**Status**: ✅ Ready - Professional image card component with modern design





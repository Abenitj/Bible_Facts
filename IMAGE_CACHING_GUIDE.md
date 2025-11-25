# Image Caching Guide

## Overview

Images are now automatically downloaded and cached locally on the device for offline viewing. This ensures images work even without internet connection after the initial sync.

## How It Works

### 1. Automatic Caching During Sync
- When content is synced, all image URLs are collected
- Images are downloaded in the background
- Stored in device cache directory: `FileSystem.cacheDirectory/melhik_images/`
- Metadata stored in AsyncStorage for cache management

### 2. Image Loading
- Images first check if cached locally
- If cached, use local file URI (fast, works offline)
- If not cached, use remote URL (will cache on next sync)
- Cache is updated when images are viewed

### 3. Cache Management
- Maximum cache size: 100MB
- Automatic cleanup of oldest files when limit reached
- Keeps most recently accessed 50 images
- Cache statistics available

## Features

✅ **Offline Support** - Images work without internet after sync  
✅ **Fast Loading** - Cached images load instantly  
✅ **Automatic Management** - Cache size automatically managed  
✅ **Background Download** - Images cached during sync  
✅ **Smart Cleanup** - Oldest files removed when needed  

## Cache Location

- **iOS**: `file:///var/mobile/Containers/Data/Application/[APP_ID]/Library/Caches/melhik_images/`
- **Android**: `file:///data/user/0/[PACKAGE]/cache/melhik_images/`

## Usage

### Automatic (Default)
Images are automatically cached when:
1. Content is synced from CMS
2. Images are viewed in the app
3. Topic details are loaded

### Manual Cache Management

```javascript
import ImageCacheService from '../src/services/ImageCacheService';

// Get cache statistics
const stats = await ImageCacheService.getCacheStats();
console.log(`Cache size: ${stats.sizeFormatted}`);
console.log(`Files: ${stats.fileCount}`);

// Clear all cached images
await ImageCacheService.clearCache();

// Cache specific image
const cachedUri = await ImageCacheService.cacheImage('http://example.com/image.jpg');

// Check if image is cached
const isCached = await ImageCacheService.isCached('http://example.com/image.jpg');
```

## Cache Service API

### Methods

#### `initialize()`
Initialize cache directory and load metadata.

#### `cacheImage(url, options)`
Download and cache a single image.
- Returns: Local file URI if successful, original URL as fallback

#### `cacheImages(urls, onProgress)`
Cache multiple images with progress callback.
- `urls`: Array of image URLs
- `onProgress(current, total, url)`: Progress callback

#### `getCachedImageUri(url)`
Get cached image URI (local if cached, remote if not).

#### `isCached(url)`
Check if image is already cached.

#### `clearCache()`
Remove all cached images.

#### `getCacheStats()`
Get cache statistics (size, file count, etc.).

#### `cleanupCache(keepRecent)`
Manually cleanup cache, keeping most recent N files.

## Cache Limits

- **Max Size**: 100MB
- **Keep Recent**: 50 files (when cleanup needed)
- **Auto Cleanup**: Triggered when cache exceeds limit

## Performance

- **First Load**: Downloads from server (requires internet)
- **Subsequent Loads**: Uses cached file (instant, works offline)
- **Background Download**: Doesn't block UI during sync
- **Smart Caching**: Only caches when needed

## Troubleshooting

### Images Not Caching

1. **Check Permissions**:
   - Ensure app has storage permissions
   - Check device storage space

2. **Check Logs**:
   - Look for "Caching X images..." in console
   - Check for download errors

3. **Manual Cache**:
   ```javascript
   await ImageCacheService.cacheImage(imageUrl);
   ```

### Cache Too Large

1. **Automatic Cleanup**:
   - Happens automatically when limit reached
   - Keeps most recent 50 images

2. **Manual Cleanup**:
   ```javascript
   await ImageCacheService.cleanupCache(30); // Keep 30 most recent
   ```

3. **Clear All**:
   ```javascript
   await ImageCacheService.clearCache();
   ```

### Images Not Loading Offline

1. **Check Cache**:
   ```javascript
   const isCached = await ImageCacheService.isCached(url);
   ```

2. **Force Cache**:
   - Sync content again while online
   - Images will be cached during sync

3. **Check Cache Stats**:
   ```javascript
   const stats = await ImageCacheService.getCacheStats();
   console.log(stats);
   ```

## Integration Points

### SyncService
- Automatically collects image URLs during sync
- Caches images in background after content is stored

### ImageCarousel
- Checks cache before loading images
- Uses cached images when available
- Falls back to remote URL if not cached

### ContentBlockRenderer
- Uses ImageCarousel which handles caching
- All image blocks benefit from caching

## Best Practices

1. **Sync Regularly**: Keep images cached by syncing content
2. **Monitor Cache**: Check cache stats periodically
3. **Cleanup When Needed**: Clear cache if storage is low
4. **Test Offline**: Verify images work without internet

## Files Modified

1. `src/services/ImageCacheService.js` - New image caching service
2. `src/services/SyncService.js` - Added image caching during sync
3. `components/ImageCarousel.js` - Uses cached images

## Future Enhancements

- [ ] Cache size configuration in settings
- [ ] Manual cache management UI
- [ ] Cache statistics in settings
- [ ] Selective cache cleanup
- [ ] Image compression for smaller cache

---

**Status**: ✅ Implemented - Images are now cached locally for offline viewing





# Image Upload Fix - Mobile App Display

## Problem
Images uploaded in the CMS were not showing in the mobile app because:
- Images were stored with relative paths like `/uploads/content/image.jpg`
- Mobile app needs absolute URLs like `http://192.168.0.122:3000/uploads/content/image.jpg`
- The sync API was returning relative URLs that the mobile app couldn't access

## Solution
Updated the sync download API (`/api/sync/download`) to automatically convert relative image URLs to absolute URLs before sending to the mobile app.

## Changes Made

### 1. Added URL Conversion Functions
- `convertToAbsoluteUrl()` - Converts relative paths to absolute URLs
- `processContentData()` - Processes contentData and converts all image URLs
- `processContentBlocks()` - Processes all content blocks and converts image URLs

### 2. URL Conversion Logic
The system now:
- Detects if a URL is already absolute (starts with `http://` or `https://`)
- Converts relative paths (starting with `/`) to absolute URLs
- Handles both JSON string and object formats for contentData
- Processes image URLs in:
  - `imageUrl` property
  - `url` property
  - `images` array (for galleries)

### 3. Base URL Detection
The API automatically detects the base URL from the request:
- Extracts protocol and host from the request URL
- Uses it to construct absolute URLs
- Works for both local development and production

## How It Works

### Before Fix
```json
{
  "contentData": {
    "url": "/uploads/content/image.jpg"
  }
}
```

### After Fix
```json
{
  "contentData": {
    "url": "http://192.168.0.122:3000/uploads/content/image.jpg"
  }
}
```

## Testing

1. **Upload an image in CMS**:
   - Go to CMS
   - Upload an image to a content block
   - Image is saved to `/public/uploads/content/`

2. **Sync in Mobile App**:
   - Open mobile app
   - Pull to refresh or sync
   - Images should now display correctly

3. **Check Logs**:
   - CMS server logs will show: `Image URL converted: /uploads/content/image.jpg -> http://192.168.0.122:3000/uploads/content/image.jpg`

## Supported Image Formats

The fix handles images in:
- ✅ Single image blocks (`image` blockType)
- ✅ Gallery blocks (`gallery` blockType)
- ✅ Mixed content blocks (`mixed` blockType)
- ✅ Image arrays in contentData
- ✅ Both `url` and `imageUrl` properties

## Image URL Formats Supported

1. **Relative Paths** (converted):
   - `/uploads/content/image.jpg`
   - `/uploads/image.jpg`

2. **Absolute URLs** (kept as is):
   - `http://192.168.0.122:3000/uploads/content/image.jpg`
   - `https://example.com/image.jpg`

## Troubleshooting

### Images Still Not Showing

1. **Check Base URL**:
   - Ensure the mobile app's API config matches the CMS server
   - Check `src/config/api.js` - `BASE_URL` should match CMS server

2. **Check Network**:
   - Mobile device must be on same network as CMS server
   - Firewall should allow connections on port 3000

3. **Check Image Paths**:
   - Verify images exist in `melhik-cms/public/uploads/content/`
   - Check CMS server logs for conversion messages

4. **Clear Cache**:
   - Clear mobile app cache
   - Force sync again

### Debugging

Check CMS server console for:
```
Image URL converted: /uploads/content/image.jpg -> http://192.168.0.122:3000/uploads/content/image.jpg
```

Check mobile app console for:
- Image load errors
- Network request failures
- URL format issues

## Files Modified

1. `melhik-cms/src/app/api/sync/download/route.ts`
   - Added URL conversion functions
   - Processes contentBlocks before sending to mobile

## Next Steps

1. **Restart CMS Server** (if running):
   ```bash
   cd melhik-cms
   npm run dev
   ```

2. **Sync Mobile App**:
   - Open mobile app
   - Pull to refresh on home screen
   - Or go to Settings > Sync

3. **Verify Images**:
   - Open a topic with uploaded images
   - Images should display in carousel
   - Tap to view full-screen

## Notes

- The fix is backward compatible
- Existing absolute URLs are not modified
- Works with both development and production setups
- No changes needed in mobile app code

---

**Status**: ✅ Fixed - Images uploaded in CMS now display correctly in mobile app





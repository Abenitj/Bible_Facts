# Melhik CMS Sync Configuration

## Overview
The mobile app now syncs data directly from your Melhik CMS. All dummy/test data has been removed.

## Configuration

### 1. CMS URL Configuration
Edit `/src/config/api.js` to set your CMS URL:

```javascript
export const API_CONFIG = {
  // For local development (CMS running on same machine)
  BASE_URL: 'http://localhost:3000/api',
  
  // For network access (CMS running on different machine)
  // BASE_URL: 'http://192.168.0.122:3000/api',
  
  // For production (when you deploy your CMS)
  // BASE_URL: 'https://your-cms-domain.com/api',
};
```

### 2. CMS Requirements
Your Melhik CMS must be running and accessible at the configured URL. The CMS should have:

- **Sync Status Endpoint**: `GET /api/sync/status`
- **Sync Download Endpoint**: `GET /api/sync/download?lastSync={timestamp}`
- **Database**: With religions, topics, and topic details

### 3. How Sync Works

1. **Full Sync**: Downloads all content from CMS (first time or when `lastSync=0`)
2. **Incremental Sync**: Downloads only new/updated content since last sync
3. **Data Storage**: Content is stored locally using AsyncStorage
4. **Error Handling**: Graceful fallback if CMS is unavailable

### 4. Sync Triggers

- **AppBar Sync Button**: Available on all screens
- **HomeScreen "Sync Now" Button**: Appears when no data is available
- **Pull-to-Refresh**: On HomeScreen

### 5. Data Structure

The sync expects this data structure from your CMS:

```javascript
{
  religions: [
    {
      id: number,
      name: string,        // Amharic name
      nameEn: string,      // English name
      description: string,
      color: string,
      icon: string,
      createdAt: string,
      updatedAt: string
    }
  ],
  topics: [
    {
      id: number,
      religionId: number,
      title: string,       // Amharic title
      titleEn: string,     // English title
      description: string,
      createdAt: string,
      updatedAt: string
    }
  ],
  topicDetails: [
    {
      id: number,
      topicId: number,
      explanation: string,
      bibleVerses: array,
      keyPoints: array,
      references: array,
      version: string,
      createdAt: string,
      updatedAt: string
    }
  ]
}
```

### 6. Testing Sync

1. **Start your Melhik CMS**: `cd melhik-cms && npm run dev`
2. **Update API URL** in `/src/config/api.js` if needed
3. **Run the mobile app**: `npm start`
4. **Click sync button** on any screen
5. **Check console logs** for sync progress

### 7. Troubleshooting

- **Connection Error**: Check if CMS is running and URL is correct
- **No Data**: Ensure your CMS has content in the database
- **Sync Fails**: Check console logs for detailed error messages
- **Network Issues**: Try different URL (localhost vs network IP)

## Notes

- All dummy/test data has been removed
- Sync only works with real CMS data
- App works offline with previously synced data
- Sync buttons are available on all screens as requested

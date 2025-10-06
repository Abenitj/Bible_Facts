# Clear Data Feature - Mobile App

## Overview
Added a "Clear All Data" functionality to the mobile app's Settings screen with proper warning dialogs to prevent accidental data loss.

## Features Implemented

### 1. Clear Data Button
- **Location**: Settings Screen > Data Management Section
- **Icon**: Trash icon with red destructive styling
- **Action**: Clears all cached content and sync history

### 2. Warning Dialog
When user taps "Clear All Data", they see a warning alert with:
- ⚠️ Clear warning icon
- Detailed explanation of what will be deleted:
  - All religions and topics
  - Downloaded content
  - Sync history
- Information that they'll need to sync again
- Two options:
  - **Cancel**: Dismisses the dialog (safe action)
  - **Clear Data**: Proceeds with deletion (destructive action in red)

### 3. Success Confirmation
After clearing data, user sees:
- Success message
- Instructions to pull down to refresh and sync new content

### 4. Error Handling
If clearing fails:
- Shows error alert
- Suggests trying again
- Logs error details for debugging

## User Flow

1. User opens Settings
2. Scrolls to "Data Management" section
3. Taps "Clear All Data" (red trash icon)
4. Sees warning dialog explaining consequences
5. Can either:
   - Cancel and keep data
   - Confirm and clear all data
6. If confirmed:
   - Data is cleared
   - Success message shown
   - User can pull to refresh to sync fresh content

## Technical Implementation

### Settings Screen Updates
- Added `handleClearData()` function
- Integrated with `SyncService.clearStoredContent()`
- Added destructive styling for clear data button
- Implemented two-step confirmation for safety

### Data Cleared
The clear operation removes:
- `@melhik_religions` (AsyncStorage)
- `@melhik_topics` (AsyncStorage)
- `@melhik_topic_details` (AsyncStorage)
- `@melhik_last_sync` (AsyncStorage)
- `@melhik_content_version` (AsyncStorage)

### User Preferences Preserved
The following are NOT cleared (preserved across clear data):
- `@bible_facts_theme` (light/dark mode preference)
- `@bible_facts_daily` (daily fact)
- Text size preference

## Use Cases

### When to Use Clear Data
1. **Duplicate Data**: When seeing duplicate or stale content
2. **Sync Issues**: When content is not updating properly
3. **Corruption**: When cached data appears corrupted
4. **Testing**: When testing fresh sync scenarios
5. **Storage**: When freeing up storage space

### Safety Features
- **Two-step confirmation**: Prevents accidental deletion
- **Clear warning message**: Users know exactly what will happen
- **Destructive styling**: Visual indicator of dangerous action
- **Cancel option**: Easy way to back out
- **Success feedback**: Confirms action completed
- **Recovery instructions**: Tells user how to restore content

## Example Scenario

**Problem**: User sees duplicate religions in the mobile app that don't exist in CMS

**Solution**:
1. Go to Settings > Data Management
2. Tap "Clear All Data"
3. Read warning, confirm deletion
4. Pull down on home screen to refresh
5. Fresh content syncs from CMS
6. Duplicates are gone, only current CMS data shown

## Benefits

✅ **User Control**: Users can manually clear problematic cache
✅ **Safety**: Multiple warnings prevent accidents
✅ **Recovery**: Easy to restore via sync
✅ **Testing**: Useful for debugging sync issues
✅ **Clean State**: Ensures fresh start when needed

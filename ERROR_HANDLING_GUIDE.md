# Error Handling Guide

## Overview

The app now has comprehensive error handling to prevent crashes and provide better user experience when errors occur.

## Error Handling Features

### 1. **ErrorBoundary Component**
- Catches React component errors
- Shows user-friendly error messages in Amharic
- Provides retry functionality
- Logs errors for debugging
- Supports multiple retry attempts with app reload option

### 2. **Safe CSS Import**
- CSS import is wrapped in try-catch
- App won't crash if CSS fails to load
- NativeWind will still work in most cases

### 3. **Safe Context Providers**
- Each context provider is wrapped in error handling
- If a provider fails, the app continues with limited functionality
- Prevents cascading failures

### 4. **Safe Navigation Container**
- Navigation errors are caught and displayed
- App shows error screen instead of crashing
- Provides recovery options

### 5. **App Reload Mechanism**
- After max retries, app can be fully reloaded
- Uses key-based remounting for clean restart
- Preserves user data where possible

## Error Recovery Flow

```
Error Occurs
    ↓
ErrorBoundary catches it
    ↓
Show user-friendly error screen
    ↓
User clicks "Retry"
    ↓
Attempt to recover (up to 3 times)
    ↓
If still failing → Show "Reload App" button
    ↓
Full app reload with clean state
```

## Error Types Handled

### 1. **Component Errors**
- Rendered component crashes
- Missing props or invalid data
- State update errors

### 2. **Context Provider Errors**
- DarkModeProvider failures
- TextSizeProvider failures
- ReadingProgressProvider failures
- BookmarksProvider failures

### 3. **Navigation Errors**
- Navigation container initialization failures
- Route navigation errors
- Stack navigator errors

### 4. **Import Errors**
- CSS import failures
- Module import failures
- Asset loading errors

## Usage Examples

### ErrorBoundary with Custom Handlers

```jsx
<ErrorBoundary
  onReload={() => {
    // Custom reload logic
    setAppKey(prev => prev + 1);
  }}
  onMaxRetries={() => {
    // Called after max retries
    console.log('Max retries reached');
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### Safe Context Provider

```jsx
<SafeContextProvider 
  Provider={DarkModeProvider} 
  name="DarkMode"
>
  <YourApp />
</SafeContextProvider>
```

## Error Messages

All error messages are displayed in Amharic for better user experience:

- **ስህተት ተፈጥሯል** - "An error occurred"
- **እንደገና ሞክር** - "Try again"
- **አፕ እንደገና ይጀምሩ** - "Reload app"

## Development vs Production

### Development Mode (`__DEV__`)
- Shows detailed error messages
- Displays error stack traces
- Logs all errors to console
- Shows component stack

### Production Mode
- Shows user-friendly messages only
- Hides technical details
- Minimal error logging
- Focus on recovery options

## Best Practices

1. **Always wrap risky components** in ErrorBoundary
2. **Use SafeContextProvider** for all context providers
3. **Handle async errors** with try-catch
4. **Provide fallback UI** for error states
5. **Log errors** for debugging but don't expose to users
6. **Test error scenarios** during development

## Testing Error Handling

To test error handling:

1. **Simulate component error:**
```jsx
throw new Error('Test error');
```

2. **Simulate provider error:**
```jsx
// In context provider
if (someCondition) {
  throw new Error('Provider error');
}
```

3. **Simulate navigation error:**
```jsx
// Force navigation error
navigation.navigate('NonExistentRoute');
```

## Monitoring

Errors are logged to:
- Console (development)
- ErrorBoundary state (for UI display)
- Component error handlers

## Future Improvements

- [ ] Error reporting service integration
- [ ] Error analytics
- [ ] Automatic error recovery
- [ ] User feedback mechanism
- [ ] Error history tracking

---

**Note**: Error handling is designed to be non-intrusive. The app will continue to function even if some features fail, providing the best possible user experience.


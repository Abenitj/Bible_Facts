# Push Notification Testing Guide for Bible Facts App

## Overview
This guide explains how to test push notifications in your Bible Facts app, both in development and production.

## Current Setup
✅ **Local Notifications**: Work in Expo Go and production
✅ **Push Notifications**: Work in development builds and production
❌ **Push Notifications**: Don't work in Expo Go (SDK 53 limitation)

## Testing Options

### Option 1: Test Local Notifications (Expo Go)
- Works immediately in Expo Go
- Test daily verse reminders
- Test content update alerts
- No additional setup required

### Option 2: Test Push Notifications (Development Build)
- Requires creating a development build
- Full push notification support
- Can test webhook integration

## Testing Local Notifications

1. **Start your app** with `npx expo start`
2. **Navigate to Settings** → **Notification Settings**
3. **Toggle notifications on/off**
4. **Test notification** using the "Send Test Notification" button
5. **Set daily verse time** and wait for the scheduled notification

## Testing Push Notifications

### Step 1: Create Development Build

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to your Expo account
eas login

# Configure EAS Build
eas build:configure

# Create development build for Android
eas build --profile development --platform android

# Or for iOS
eas build --profile development --platform ios
```

### Step 2: Install Development Build
1. Download the APK/IPA file from EAS Build
2. Install it on your device
3. Open the app and grant notification permissions

### Step 3: Test Push Notifications
1. **Navigate to Settings** → **Push Notification Tester**
2. **Click "Initialize Push Notifications"**
3. **Copy the push token** that appears
4. **Use the test buttons** to send notifications

## Webhook Testing

### Step 1: Start Webhook Server

```bash
cd webhook-server
npm install
npm start
```

### Step 2: Test Webhook Endpoints

#### Register Push Token
```bash
curl -X POST http://localhost:3000/api/push-tokens \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_PUSH_TOKEN_HERE",
    "userId": "user123",
    "deviceType": "Android",
    "appVersion": "1.0.0"
  }'
```

#### Send Test Notification
```bash
curl -X POST http://localhost:3000/api/test-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "title": "Test Bible Fact",
    "body": "Here is an interesting Bible fact!",
    "data": {"type": "bible_fact", "factId": "123"}
  }'
```

#### Send Daily Verse Notification
```bash
curl -X POST http://localhost:3000/webhook/notification \
  -H "Content-Type: application/json" \
  -d '{
    "type": "daily_verse",
    "title": "Daily Bible Verse",
    "body": "Start your day with wisdom from the Bible",
    "data": {"verseId": "123", "reference": "John 3:16"},
    "userId": "user123"
  }'
```

## Production Setup

### 1. Update Server URL
In `src/services/PushNotificationService.js`, update:
```javascript
const response = await fetch('https://your-production-server.com/api/push-tokens', {
  // ... rest of the code
});
```

### 2. Deploy Webhook Server
- Deploy to your preferred hosting service (Heroku, AWS, etc.)
- Update the server URL in your app
- Set up proper authentication and security

### 3. Integrate with Your CMS
- Send webhooks when new content is added
- Send webhooks for user reminders
- Send webhooks for daily verses

## Troubleshooting

### Common Issues

#### "No projectId found"
- This is normal in Expo Go
- Will work in development builds and production

#### "Push notifications not working"
- Make sure you're using a development build
- Check notification permissions
- Verify push token is registered

#### "Webhook not receiving notifications"
- Check server is running
- Verify endpoint URLs
- Check CORS settings
- Verify request payload format

### Debug Steps

1. **Check console logs** for error messages
2. **Verify push token** is generated and stored
3. **Test webhook endpoints** with Postman or curl
4. **Check notification permissions** on device
5. **Verify server connectivity** and response codes

## Testing Checklist

- [ ] Local notifications work in Expo Go
- [ ] Development build created and installed
- [ ] Push notification permissions granted
- [ ] Push token generated and displayed
- [ ] Test notifications received on device
- [ ] Webhook server running and accessible
- [ ] Push tokens registered with server
- [ ] Webhook notifications received by app
- [ ] Different notification types working
- [ ] Notification data properly handled

## Next Steps

1. **Test local notifications** in Expo Go
2. **Create development build** for push notification testing
3. **Set up webhook server** for integration testing
4. **Deploy to production** when ready
5. **Monitor and optimize** notification delivery

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all dependencies are installed
3. Ensure proper permissions are granted
4. Test with different devices if possible
5. Check Expo documentation for SDK 53 changes

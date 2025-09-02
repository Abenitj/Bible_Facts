// Simple Webhook Server Example for Bible Facts App
// This is a Node.js server that can send push notifications to your app

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Store push tokens (in production, use a database)
const pushTokens = new Map();

// Webhook endpoint to receive notifications
app.post('/webhook/notification', async (req, res) => {
  try {
    const { type, title, body, data, userId } = req.body;
    
    console.log(`Received webhook: ${type} - ${title}`);
    
    // Get user's push token
    const pushToken = pushTokens.get(userId);
    if (!pushToken) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Send push notification using Expo's push service
    const notificationResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: pushToken,
        title,
        body,
        data: { type, ...data },
        sound: 'default',
        priority: 'high',
      }),
    });
    
    if (notificationResponse.ok) {
      console.log(`Push notification sent successfully to user ${userId}`);
      res.json({ success: true, message: 'Notification sent' });
    } else {
      console.error('Failed to send push notification');
      res.status(500).json({ error: 'Failed to send notification' });
    }
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to register push tokens
app.post('/api/push-tokens', (req, res) => {
  try {
    const { token, userId, deviceType, appVersion } = req.body;
    
    console.log(`Registering push token for user ${userId}`);
    console.log(`Device: ${deviceType}, App Version: ${appVersion}`);
    
    // Store the push token
    pushTokens.set(userId, token);
    
    res.json({ success: true, message: 'Push token registered' });
  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({ error: 'Failed to register token' });
  }
});

// Endpoint to send test notifications
app.post('/api/test-notification', async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;
    
    const pushToken = pushTokens.get(userId);
    if (!pushToken) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const notificationResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: pushToken,
        title: title || 'Test Notification',
        body: body || 'This is a test notification',
        data: { type: 'test', ...data },
        sound: 'default',
        priority: 'high',
      }),
    });
    
    if (notificationResponse.ok) {
      res.json({ success: true, message: 'Test notification sent' });
    } else {
      res.status(500).json({ error: 'Failed to send test notification' });
    }
    
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to list all registered tokens
app.get('/api/push-tokens', (req, res) => {
  const tokens = Array.from(pushTokens.entries()).map(([userId, token]) => ({
    userId,
    token: token.substring(0, 20) + '...',
    deviceType: 'Unknown',
    appVersion: 'Unknown'
  }));
  
  res.json({ tokens });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    registeredUsers: pushTokens.size
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🔔 Webhook endpoint: http://localhost:${PORT}/webhook/notification`);
  console.log(`📝 API docs: http://localhost:${PORT}/api/push-tokens`);
});

// Example webhook payloads you can test with:

/*
1. Daily Bible Verse:
POST /webhook/notification
{
  "type": "daily_verse",
  "title": "Daily Bible Verse",
  "body": "Start your day with wisdom from the Bible",
  "data": { "verseId": "123", "reference": "John 3:16" },
  "userId": "user123"
}

2. New Content Alert:
POST /webhook/notification
{
  "type": "new_content",
  "title": "New Bible Facts Available",
  "body": "Discover new insights about Christianity",
  "data": { "contentType": "bible_fact", "count": 5 },
  "userId": "user123"
}

3. Reminder:
POST /webhook/notification
{
  "type": "reminder",
  "title": "Bible Study Reminder",
  "body": "Time for your daily Bible study",
  "data": { "reminderType": "daily_study", "time": "20:00" },
  "userId": "user123"
}
*/

// To test this server:
// 1. Install dependencies: npm install express cors
// 2. Run: node webhook-server-example.js
// 3. Send POST requests to test endpoints
// 4. Use tools like Postman or curl to test webhooks

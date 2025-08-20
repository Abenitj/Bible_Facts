# Melhik Mobile App & Sync Documentation

## 📱 **Mobile App Overview**

### **Purpose**
Melhik is an offline-first evangelism tool mobile app that helps users answer questions about Christianity from different religions. The app works offline but syncs content when online.

### **Architecture**
- **Framework**: React Native + Expo
- **Navigation**: React Navigation (Drawer + Stack)
- **State Management**: React Hooks + Context
- **Storage**: AsyncStorage for local data
- **UI**: Custom components with Amharic support
- **Sync**: REST API integration for content updates

## 🏗️ **App Structure**

### **Screens**
```
App Navigation:
├── HomeScreen (Drawer)
│   ├── Religion List
│   ├── Welcome Section
│   └── Pull-to-refresh
├── TopicsScreen (Stack)
│   ├── Topic List by Religion
│   ├── Topic Count Display
│   └── Animated Cards
├── TopicDetailScreen (Stack)
│   ├── Question Section
│   ├── Detailed Explanation
│   ├── Bible Verse Integration
│   ├── Share Functionality
│   └── Back Navigation
└── SettingsScreen (Drawer)
    ├── App Settings
    ├── Data Management
    └── About Information
```

### **Components**
```
Components:
├── AppBar
│   ├── Title Display
│   ├── Back Button
│   ├── Menu Button
│   └── Navigation Controls
├── AmharicText
│   ├── Amharic Typography
│   ├── Font Variants
│   └── Text Styling
├── ClickableBibleVerse
│   ├── Verse Display
│   ├── Modal Popup
│   ├── Verse Text
│   └── Explanation
├── TextWithBibleVerses
│   ├── Text Parsing
│   ├── Verse Detection
│   ├── Clickable Integration
│   └── Mock Data Support
└── CustomDrawerContent
    ├── Navigation Items
    ├── Amharic Labels
    └── Styling
```

## 🎨 **UI/UX Features**

### **Design System**
```css
Color Palette:
- Primary: #654321 (Dark Brown)
- Secondary: #8B4513 (Saddle Brown)
- Background: #F0E6D2 (Light Beige)
- Card Background: #F5F0E0 (Off-White)
- Accent: #DEB887 (Burlywood)

Typography:
- Amharic Font: System default
- Font Sizes: 14px, 16px, 18px, 24px
- Line Heights: 20px, 24px, 26px
- Font Weights: normal, bold, 600
```

### **Animations**
- **Entrance Animations**: Fade and slide effects
- **Staggered Animations**: Sequential card animations
- **Press Animations**: Scale effects on touch
- **Loading States**: Smooth transitions

### **Navigation**
- **Drawer Navigation**: Home and Settings
- **Stack Navigation**: Topics and TopicDetail
- **Back Button**: Professional arrow icon
- **Menu Button**: Hamburger icon for drawer

## 📊 **Data Management**

### **Local Data Structure**
```javascript
// Local Storage Keys
const STORAGE_KEYS = {
  RELIGIONS: 'melhik_religions',
  TOPICS: 'melhik_topics',
  TOPIC_DETAILS: 'melhik_topic_details',
  LAST_SYNC: 'melhik_last_sync',
  APP_VERSION: 'melhik_app_version',
  USER_SETTINGS: 'melhik_user_settings'
};

// Data Models
interface Religion {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  color: string;
}

interface Topic {
  id: string;
  religionId: string;
  title: string;
  titleEn: string;
  description: string;
}

interface TopicDetail {
  id: string;
  topicId: string;
  explanation: string;
  bibleVerses: string[];
  keyPoints: string[];
  references: Reference[];
  version: number;
}

interface Reference {
  verse: string;
  text: string;
  explanation: string;
}
```

### **Fallback Data System**
```javascript
// Simple Data Layer
class SimpleDataLayer {
  async getReligions() {
    // Try local storage first
    // Fallback to in-memory data
    // Return formatted data
  }
  
  async getTopicsByReligion(religionId) {
    // Filter topics by religion
    // Return with animations
  }
  
  async getTopicById(topicId) {
    // Get topic details
    // Include Bible verse data
    // Return formatted content
  }
}
```

## 🔄 **Sync System**

### **Sync Architecture**
```
Sync Flow:
1. App Startup → Check for updates
2. Network Available → Sync content
3. Download Updates → Store locally
4. Update UI → Show new content
5. Background Sync → Periodic checks
```

### **Sync API Endpoints**
```javascript
// Sync API Integration
const SYNC_ENDPOINTS = {
  CHECK_UPDATES: '/api/sync/check',
  DOWNLOAD_CONTENT: '/api/sync/download',
  GET_VERSION: '/api/sync/version',
  REPORT_STATUS: '/api/sync/status'
};

// Sync Service
class SyncService {
  async checkForUpdates() {
    const response = await fetch(SYNC_ENDPOINTS.CHECK_UPDATES);
    return response.json();
  }
  
  async downloadContent() {
    const response = await fetch(SYNC_ENDPOINTS.DOWNLOAD_CONTENT);
    return response.json();
  }
  
  async saveToLocalStorage(content) {
    await AsyncStorage.setItem(STORAGE_KEYS.RELIGIONS, JSON.stringify(content.religions));
    await AsyncStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(content.topics));
    await AsyncStorage.setItem(STORAGE_KEYS.TOPIC_DETAILS, JSON.stringify(content.topicDetails));
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  }
}
```

### **Sync Process Implementation**
```javascript
// Sync Implementation
const performSync = async () => {
  try {
    // Check if online
    if (!isOnline()) {
      console.log('Offline mode - using local data');
      return;
    }
    
    // Check for updates
    const updateCheck = await syncService.checkForUpdates();
    
    if (updateCheck.hasUpdates) {
      // Download new content
      const newContent = await syncService.downloadContent();
      
      // Save to local storage
      await syncService.saveToLocalStorage(newContent);
      
      // Update app state
      updateAppContent(newContent);
      
      console.log('Sync completed successfully');
    }
  } catch (error) {
    console.error('Sync failed:', error);
    // Continue with local data
  }
};
```

## 📱 **Mobile App Features**

### **Offline-First Design**
- **Local Data**: All content stored locally
- **Offline Functionality**: App works without internet
- **Background Sync**: Updates when online
- **Graceful Degradation**: Falls back to local data

### **Bible Verse Integration**
- **Verse Detection**: Regex patterns for Bible verses
- **Clickable Verses**: Tap to view verse details
- **Modal Display**: Popup with verse text and explanation
- **Mock Data**: Sample verses for testing

### **Content Management**
- **Religion Categories**: Organized by religion
- **Topic Lists**: Topics within each religion
- **Detailed Explanations**: Rich content with formatting
- **Bible References**: Verse numbers and explanations

### **User Experience**
- **Amharic Language**: Full Amharic support
- **Professional UI**: Clean, modern design
- **Smooth Navigation**: Intuitive navigation flow
- **Loading States**: Proper loading indicators

## 🔧 **Technical Implementation**

### **Navigation Setup**
```javascript
// App Navigation Structure
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function MainApp() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Topics" component={TopicsScreen} options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="TopicDetail" component={TopicDetailScreen} options={{ drawerItemStyle: { display: 'none' } }} />
    </Drawer.Navigator>
  );
}
```

### **Data Layer Architecture**
```javascript
// Data Layer Pattern
class DataManager {
  constructor() {
    this.syncService = new SyncService();
    this.localStorage = new LocalStorage();
  }
  
  async initialize() {
    // Load local data
    // Check for updates
    // Sync if needed
  }
  
  async getReligions() {
    return await this.localStorage.getReligions();
  }
  
  async getTopics(religionId) {
    return await this.localStorage.getTopicsByReligion(religionId);
  }
  
  async getTopicDetails(topicId) {
    return await this.localStorage.getTopicById(topicId);
  }
}
```

### **Component Architecture**
```javascript
// Component Structure
const TopicDetailScreen = ({ navigation, route }) => {
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadTopic();
  }, []);
  
  const loadTopic = async () => {
    try {
      const topicData = await dataManager.getTopicDetails(route.params.topicId);
      setTopic(topicData);
    } catch (error) {
      console.error('Error loading topic:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Render component
};
```

## 📊 **Sync Data Format**

### **Sync Request/Response**
```json
// Sync Check Request
{
  "appVersion": "1.0.0",
  "lastSync": "2024-01-15T10:30:00Z",
  "localVersion": 1
}

// Sync Check Response
{
  "success": true,
  "data": {
    "hasUpdates": true,
    "currentVersion": 2,
    "lastUpdated": "2024-01-15T10:30:00Z",
    "updateSize": "15.2KB",
    "changes": {
      "religions": ["added", "updated"],
      "topics": ["added"],
      "topicDetails": ["updated"]
    }
  }
}

// Full Content Download
{
  "success": true,
  "data": {
    "version": 2,
    "lastUpdated": "2024-01-15T10:30:00Z",
    "religions": [...],
    "topics": [...],
    "topicDetails": [...]
  }
}
```

## 🚀 **Deployment & Distribution**

### **Build Process**
```bash
# Development
npm start
expo start

# Production Build
expo build:android
expo build:ios

# EAS Build
eas build --platform android
eas build --platform ios
```

### **App Store Distribution**
- **Google Play Store**: Android APK/AAB
- **Apple App Store**: iOS IPA
- **Expo Updates**: OTA updates for content

### **Environment Configuration**
```javascript
// Environment Variables
const CONFIG = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.melhik.app',
  SYNC_INTERVAL: 300000, // 5 minutes
  MAX_RETRY_ATTEMPTS: 3,
  CACHE_DURATION: 86400000 // 24 hours
};
```

## 🔐 **Security & Privacy**

### **Data Security**
- **Local Storage**: Encrypted AsyncStorage
- **API Communication**: HTTPS only
- **Content Validation**: Input sanitization
- **Error Handling**: Secure error messages

### **Privacy Features**
- **No User Data**: App doesn't collect personal data
- **Offline Privacy**: All data stays on device
- **Optional Sync**: User controls sync behavior
- **Data Retention**: Local data only

## 📈 **Performance Optimization**

### **App Performance**
- **Lazy Loading**: Load content on demand
- **Image Optimization**: Compressed images
- **Memory Management**: Proper cleanup
- **Bundle Optimization**: Reduced app size

### **Sync Performance**
- **Incremental Updates**: Only download changes
- **Background Sync**: Non-blocking updates
- **Retry Logic**: Automatic retry on failure
- **Cache Management**: Efficient data storage

## 🧪 **Testing Strategy**

### **Unit Testing**
- **Component Testing**: React Native Testing Library
- **Service Testing**: Jest for data layer
- **Navigation Testing**: Navigation testing utilities

### **Integration Testing**
- **API Integration**: Mock API responses
- **Sync Testing**: Test sync scenarios
- **Offline Testing**: Test offline functionality

### **User Testing**
- **Amharic Content**: Native speaker review
- **UI/UX Testing**: User experience validation
- **Performance Testing**: Load testing

## 📋 **Development Workflow**

### **Feature Development**
1. **Plan Feature**: Define requirements
2. **Implement**: Code the feature
3. **Test**: Unit and integration tests
4. **Review**: Code review process
5. **Deploy**: Build and distribute

### **Content Management**
1. **Create Content**: Use CMS
2. **Review Content**: Quality assurance
3. **Publish**: Make content available
4. **Sync**: Mobile app updates
5. **Monitor**: Track usage and feedback

This documentation provides a comprehensive overview of the Melhik mobile app and sync system, covering all aspects from development to deployment.

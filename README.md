# Melhik - Evangelism Tool

A React Native mobile app for evangelism, designed to help users answer questions about Christianity from different religions. The app works offline-first and syncs content when online.

## 🚀 **Quick Start**

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Bible_Facts

# Install dependencies
npm install

# Start the development server
npm start
```

### Running the App
```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

## 📱 **App Features**

### **Core Features**
- **Offline-First**: Works without internet connection
- **Amharic Language Support**: Full Amharic interface and content
- **Religion Categories**: Organized content by religion
- **Topic Management**: Detailed explanations for each topic
- **Bible Verse Integration**: Clickable Bible verses with explanations
- **Content Sync**: Automatic content updates when online
- **Professional UI**: Clean, modern design with smooth animations

### **Navigation**
- **Drawer Navigation**: Home and Settings
- **Stack Navigation**: Topics and Topic Details
- **Back Navigation**: Proper stack-based navigation

### **Content Structure**
```
Religions
├── Islam (እስልምና)
├── Judaism (ይሁዳዊነት)
├── Hinduism (ሂንዱዊነት)
└── Buddhism (ቡዲስትነት)
    └── Topics
        ├── Topic 1
        ├── Topic 2
        └── Topic 3
            └── Detailed Explanation
                ├── Question
                ├── Answer
                └── Bible Verses
```

## 🏗️ **Project Structure**

```
Bible_Facts/
├── App.js                          # Main app entry point
├── babel.config.js                 # Babel configuration
├── package.json                    # Dependencies and scripts
├── components/                     # Reusable components
│   ├── AppBar.js                   # App bar component
│   ├── AmharicText.js              # Amharic text component
│   ├── ClickableBibleVerse.js      # Bible verse modal
│   ├── CustomDrawerContent.js      # Drawer navigation
│   ├── TextWithBibleVerses.js      # Bible verse detection
│   ├── TopicCard.js                # Topic card component
│   └── ZoomableText.js             # Text zoom functionality
├── screens/                        # App screens
│   ├── HomeScreen.js               # Main religion list
│   ├── TopicsScreen.js             # Topics by religion
│   ├── TopicDetailScreen.js        # Topic details
│   ├── SettingsScreen.js           # App settings
│   └── SplashScreen.js             # Loading screen
├── src/                            # Source code
│   ├── components/                 # Source components
│   ├── database/                   # Data layer
│   │   ├── schema.js               # SQLite schema (bypassed)
│   │   ├── simpleData.js           # Simple data layer
│   │   ├── fallbackData.js         # Fallback data
│   │   └── mockBibleVerses.js      # Mock Bible verses
│   └── services/                   # Services
│       └── SyncService.js          # Content sync service
├── utils/                          # Utilities
│   └── storage.js                  # Local storage utilities
└── scripts/                        # Build scripts
    └── cleanup.js                  # Production cleanup
```

## 🔧 **Technical Stack**

### **Frontend**
- **React Native**: Mobile app framework
- **Expo**: Development platform
- **React Navigation**: Navigation library
- **React Native Gesture Handler**: Gesture support
- **React Native Reanimated**: Animations

### **Data Management**
- **AsyncStorage**: Local data storage
- **Simple Data Layer**: In-memory data management
- **Fallback Data**: Offline content
- **Sync Service**: Content synchronization

### **UI/UX**
- **Custom Components**: Amharic text, Bible verses
- **Vector Icons**: Professional iconography
- **Animations**: Smooth transitions and effects
- **Responsive Design**: Works on all screen sizes

## 📊 **Data Flow**

### **Offline-First Architecture**
1. **App Startup**: Load local data from AsyncStorage
2. **Fallback Data**: Use in-memory data if storage is empty
3. **Content Display**: Show content immediately
4. **Background Sync**: Check for updates when online
5. **Content Update**: Download and store new content

### **Sync Process**
1. **Check Updates**: Call sync API endpoint
2. **Download Content**: Get new content if available
3. **Store Locally**: Save to AsyncStorage
4. **Update UI**: Refresh app content
5. **Background Sync**: Periodic checks

## 🎨 **Design System**

### **Color Palette**
- **Primary**: #654321 (Dark Brown)
- **Secondary**: #8B4513 (Saddle Brown)
- **Background**: #F0E6D2 (Light Beige)
- **Card Background**: #F5F0E0 (Off-White)
- **Accent**: #DEB887 (Burlywood)

### **Typography**
- **Amharic Font**: System default
- **Font Sizes**: 14px, 16px, 18px, 24px
- **Line Heights**: 20px, 24px, 26px
- **Font Weights**: normal, bold, 600

## 🔄 **Content Management**

### **Current System**
- **Local Data**: Stored in AsyncStorage
- **Fallback Data**: In-memory sample data
- **Bible Verses**: Mock data with explanations
- **Content Structure**: Religions → Topics → Details

### **Future CMS Integration**
- **Web CMS**: Next.js + Prisma + PostgreSQL
- **Content Sync**: REST API integration
- **Admin Interface**: Content management dashboard
- **Version Control**: Content versioning system

## 🚀 **Deployment**

### **Development**
```bash
# Start development server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web
```

### **Production Build**
```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios

# EAS Build (recommended)
eas build --platform android
eas build --platform ios
```

### **App Store Distribution**
- **Google Play Store**: Android APK/AAB
- **Apple App Store**: iOS IPA
- **Expo Updates**: Over-the-air updates

## 🧪 **Testing**

### **Manual Testing**
- **Navigation**: Test all navigation flows
- **Content**: Verify all content displays correctly
- **Offline**: Test offline functionality
- **Sync**: Test content synchronization
- **UI/UX**: Test on different screen sizes

### **Automated Testing**
```bash
# Run tests (when implemented)
npm test

# Run specific tests
npm run test:unit
npm run test:integration
```

## 🔧 **Development Workflow**

### **Feature Development**
1. **Plan**: Define requirements and design
2. **Implement**: Code the feature
3. **Test**: Manual and automated testing
4. **Review**: Code review process
5. **Deploy**: Build and distribute

### **Content Updates**
1. **Create**: Add new content to fallback data
2. **Test**: Verify content displays correctly
3. **Deploy**: Update app with new content
4. **Monitor**: Track usage and feedback

## 📚 **Documentation**

### **Available Documentation**
- **CMS Documentation**: `CMS_DOCUMENTATION.md`
- **Mobile App & Sync**: `MOBILE_APP_AND_SYNC_DOCUMENTATION.md`
- **API Documentation**: Available in CMS docs
- **Component Documentation**: Inline code comments

### **Additional Resources**
- [React Native Documentation](https://reactnative.dev/docs)
- [Expo Documentation](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org/docs)

## 🐛 **Known Issues**

### **Current Issues**
- **Console Logs**: Many debug console.log statements (use cleanup script)
- **SQLite Bypass**: Using simple data layer instead of SQLite
- **Sync Service**: Currently mocked, needs real API integration

### **Future Improvements**
- **Real CMS Integration**: Connect to web CMS
- **Performance Optimization**: Lazy loading and caching
- **Advanced Features**: Search, favorites, user preferences
- **Multi-language**: Support for additional languages

## 🤝 **Contributing**

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### **Code Standards**
- **ESLint**: Follow linting rules
- **Prettier**: Consistent code formatting
- **Comments**: Document complex logic
- **Testing**: Add tests for new features

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 **Acknowledgments**

- **Amharic Content**: Native speakers for content review
- **UI/UX Design**: Modern, professional design principles
- **Open Source**: Built with amazing open source libraries

---

**Note**: This is a living document. For the latest updates, please refer to the project repository and documentation files.

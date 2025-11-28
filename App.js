import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DarkModeProvider, useDarkMode } from './src/contexts/DarkModeContext';
import { TextSizeProvider } from './src/contexts/TextSizeContext';
import { ReadingProgressProvider } from './src/contexts/ReadingProgressContext';
import { BookmarksProvider } from './src/contexts/BookmarksContext';
import ErrorBoundary from './components/ErrorBoundary';

// Screens
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import BookmarksScreen from './screens/BookmarksScreen';
import TopicsScreen from './screens/TopicsScreen';
import TopicDetailScreen from './screens/TopicDetailScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


// Main App with Bottom Tab Navigation
function MainApp() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useDarkMode();
  
  
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Bookmarks') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: isDarkMode ? '#60A5FA' : '#2563EB',
        tabBarInactiveTintColor: isDarkMode ? '#6B7280' : '#9CA3AF',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#111827' : '#F9FAFB',
          borderTopWidth: 0,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 12,
          height: 70 + Math.max(insets.bottom, 8),
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        cardStyle: { 
          backgroundColor: isDarkMode ? '#111827' : '#F9FAFB',
        },
        animationEnabled: true,
        gestureEnabled: true,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'ዋና ገጽ',
          tabBarLabel: 'መነሻ',
        }}
      />
      <Tab.Screen 
        name="Bookmarks" 
        component={BookmarksScreen}
        options={{
          title: 'መዝገቦች',
          tabBarLabel: 'መዝገቦች',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'ቅንብሮች',
          tabBarLabel: 'ቅንብሮች',
        }}
      />
    </Tab.Navigator>
  );
}

// Safe Navigation Container wrapper
function SafeNavigationContainer({ children }) {
  const [navigationError, setNavigationError] = React.useState(null);

  if (navigationError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827', padding: 20 }}>
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text style={{ color: '#F9FAFB', fontSize: 18, fontWeight: 'bold', marginTop: 16, textAlign: 'center' }}>
          Navigation Error
        </Text>
        <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
          Please restart the app
        </Text>
      </View>
    );
  }

  try {
    return (
      <NavigationContainer
        onError={(error) => {
          console.error('Navigation error:', error);
          setNavigationError(error);
        }}
        theme={{
          dark: true,
          colors: {
            primary: '#60A5FA',
            background: '#111827',
            card: '#1F2937',
            text: '#F9FAFB',
            border: '#374151',
            notification: '#EF4444',
          },
        }}
      >
        {children}
      </NavigationContainer>
    );
  } catch (error) {
    console.error('NavigationContainer initialization error:', error);
    setNavigationError(error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' }}>
        <Text style={{ color: '#F9FAFB' }}>Navigation failed to initialize</Text>
      </View>
    );
  }
}

// Safe context provider wrapper
function SafeContextProvider({ children, Provider, name }) {
  try {
    return <Provider>{children}</Provider>;
  } catch (error) {
    console.error(`Error in ${name} provider:`, error);
    // Return children without provider if provider fails
    return <>{children}</>;
  }
}

// Root Stack Navigator
export default function App() {
  const [appKey, setAppKey] = React.useState(0);

  const handleReload = React.useCallback(() => {
    // Force remount by changing key
    setAppKey(prev => prev + 1);
  }, []);

  return (
    <ErrorBoundary 
      key={appKey}
      onReload={handleReload}
      onMaxRetries={handleReload}
    >
      <SafeContextProvider Provider={DarkModeProvider} name="DarkMode">
        <SafeContextProvider Provider={TextSizeProvider} name="TextSize">
          <SafeContextProvider Provider={ReadingProgressProvider} name="ReadingProgress">
            <SafeContextProvider Provider={BookmarksProvider} name="Bookmarks">
              <SafeAreaProvider style={{ backgroundColor: '#111827' }}>
                <SafeNavigationContainer>
                  <Stack.Navigator
                    initialRouteName="Splash"
                    screenOptions={{
                      headerShown: false,
                      cardStyle: { backgroundColor: '#111827' },
                      cardOverlayEnabled: false,
                      animationEnabled: true,
                      gestureEnabled: true,
                    }}
                  >
                    <Stack.Screen 
                      name="Splash" 
                      component={SplashScreen}
                      options={{
                        animationEnabled: false,
                      }}
                    />
                    <Stack.Screen 
                      name="MainApp" 
                      component={MainApp}
                    />
                    <Stack.Screen 
                      name="ReligionTopics" 
                      component={TopicsScreen}
                      options={{
                        title: 'ርዕሰ መልእክቶች',
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen 
                      name="TopicDetail" 
                      component={TopicDetailScreen}
                      options={{
                        title: 'ዝርዝር መረጃ',
                        headerShown: false,
                      }}
                    />
                  </Stack.Navigator>
                </SafeNavigationContainer>
              </SafeAreaProvider>
            </SafeContextProvider>
          </SafeContextProvider>
        </SafeContextProvider>
      </SafeContextProvider>
    </ErrorBoundary>
  );
}

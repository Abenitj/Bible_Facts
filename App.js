import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DarkModeProvider, useDarkMode } from './src/contexts/DarkModeContext';
import { TextSizeProvider } from './src/contexts/TextSizeContext';
import { ReadingProgressProvider } from './src/contexts/ReadingProgressContext';
import { BookmarksProvider } from './src/contexts/BookmarksContext';

// Screens
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

// Root Stack Navigator
export default function App() {

  return (
    <DarkModeProvider>
      <TextSizeProvider>
        <ReadingProgressProvider>
          <BookmarksProvider>
            <SafeAreaProvider style={{ backgroundColor: '#111827' }}>
        <NavigationContainer
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
          <Stack.Navigator
            initialRouteName="MainApp"
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#111827' },
              cardOverlayEnabled: false,
              animationEnabled: true,
              gestureEnabled: true,
            }}
          >
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
        </NavigationContainer>
            </SafeAreaProvider>
          </BookmarksProvider>
        </ReadingProgressProvider>
      </TextSizeProvider>
    </DarkModeProvider>
  );
}

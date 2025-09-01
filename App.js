import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-gesture-handler';

// Import database
import { initDatabase } from './src/database/simpleData';

// Import contexts
import { DarkModeProvider, useDarkMode } from './src/contexts/DarkModeContext';

// Import screens
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
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
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: isDarkMode ? '#60A5FA' : '#3B82F6',
        tabBarInactiveTintColor: isDarkMode ? '#9CA3AF' : '#6B7280',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: isDarkMode ? '#374151' : '#E5E7EB',
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 8,
          height: 50 + Math.max(insets.bottom, 10),
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: '#000000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 4,
        },
        tabBarBackground: () => (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }} />
        ),
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
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
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'ቅንብሮች',
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

// Loading component
const LoadingScreen = () => {
  const { isDarkMode } = useDarkMode();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB' }}>
      <ActivityIndicator size="large" color={isDarkMode ? '#9CA3AF' : '#3B82F6'} />
      <Text style={{ marginTop: 16, color: isDarkMode ? '#D1D5DB' : '#374151', fontSize: 16 }}>ይዘት እያደረገ ነው...</Text>
    </View>
  );
};

// Root Stack Navigator
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Starting app initialization...');
        // Initialize database
        await initDatabase();
        console.log('Database initialized successfully');
        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        // Even if database fails, we should still show the app
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Initialization timeout, proceeding anyway');
      setIsLoading(false);
      setIsInitialized(true);
    }, 5000);

    initializeApp().finally(() => {
      clearTimeout(timeout);
    });
  }, []);

  if (isLoading) {
    return (
      <DarkModeProvider>
        <LoadingScreen />
      </DarkModeProvider>
    );
  }

  return (
    <DarkModeProvider>
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
            initialRouteName={isInitialized ? "MainApp" : "Splash"}
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
        </NavigationContainer>
      </SafeAreaProvider>
    </DarkModeProvider>
  );
}

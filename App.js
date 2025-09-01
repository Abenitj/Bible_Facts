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
  
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Topics') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: Math.max(insets.bottom, 20),
          paddingTop: 10,
          height: 60 + Math.max(insets.bottom, 20),
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
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarBackground: () => (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#FFFFFF',
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
          fontSize: 12,
          fontWeight: '500',
        },
        cardStyle: { backgroundColor: '#F9FAFB' },
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
        name="Topics" 
        component={TopicsScreen}
        options={{
          title: 'ርዕሰ መልእክቶች',
          tabBarLabel: 'Topics',
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
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
    <ActivityIndicator size="large" color="#3B82F6" />
    <Text style={{ marginTop: 16, color: '#374151', fontSize: 16 }}>ይዘት እያደረገ ነው...</Text>
  </View>
);

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
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={isInitialized ? "MainApp" : "Splash"}
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#F9FAFB' }
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
            name="TopicDetail" 
            component={TopicDetailScreen}
            options={{
              title: 'ዝርዝር መረጃ',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

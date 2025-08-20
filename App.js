import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, ActivityIndicator } from 'react-native';
import 'react-native-gesture-handler';

// Import database
import { initDatabase } from './src/database/simpleData';

// Import screens
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import TopicsScreen from './screens/TopicsScreen';
import TopicDetailScreen from './screens/TopicDetailScreen';
import SettingsScreen from './screens/SettingsScreen';

// Import custom drawer content
import CustomDrawerContent from './components/CustomDrawerContent';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Main App with Drawer Navigation only
function MainApp() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F0E6D2' },
        drawerStyle: {
          backgroundColor: '#F0E6D2',
          width: 280,
        },
        drawerActiveBackgroundColor: '#D2B48C',
        drawerActiveTintColor: '#654321',
        drawerInactiveTintColor: '#8B4513',
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'ዋና ገጽ',
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'ቅንብሮች',
        }}
      />
      <Drawer.Screen 
        name="Topics" 
        component={TopicsScreen}
        options={{
          title: 'ርዕሰ መልእክቶች',
          drawerItemStyle: { display: 'none' }
        }}
      />
      <Drawer.Screen 
        name="TopicDetail" 
        component={TopicDetailScreen}
        options={{
          title: 'ዝርዝር መረጃ',
          drawerItemStyle: { display: 'none' }
        }}
      />
    </Drawer.Navigator>
  );
}



// Loading component
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0E6D2' }}>
    <ActivityIndicator size="large" color="#654321" />
    <Text style={{ marginTop: 16, color: '#654321', fontSize: 16 }}>ይዘት እያደረገ ነው...</Text>
  </View>
);

// Root Stack Navigator
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
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
            cardStyle: { backgroundColor: '#F0E6D2' }
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
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

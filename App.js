import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';

// Import screens
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import TopicsScreen from './screens/TopicsScreen';
import TopicDetailScreen from './screens/TopicDetailScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import SearchScreen from './screens/SearchScreen';
import SettingsScreen from './screens/SettingsScreen';

// Import custom drawer content
import CustomDrawerContent from './components/CustomDrawerContent';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Main App with Drawer Navigation
function MainApp() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F5F5DC' },
        drawerStyle: {
          backgroundColor: '#F5F5DC',
          width: 280,
        },
        drawerActiveBackgroundColor: '#D2B48C',
        drawerActiveTintColor: '#8B4513',
        drawerInactiveTintColor: '#A0522D',
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Evangelism Tool'
        }}
      />
      <Drawer.Screen 
        name="Topics" 
        component={TopicsScreen}
        options={{
          title: 'Topics',
          drawerItemStyle: { display: 'none' }
        }}
      />
      <Drawer.Screen 
        name="TopicDetail" 
        component={TopicDetailScreen}
        options={{
          title: 'Topic Detail',
          drawerItemStyle: { display: 'none' }
        }}
      />
      <Drawer.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{
          title: 'Favorites'
        }}
      />
      <Drawer.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          title: 'Search'
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings'
        }}
      />
    </Drawer.Navigator>
  );
}

// Root Stack Navigator
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#F5F5DC' }
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

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

const CustomDrawerContent = (props) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const navigateToScreen = (screenName) => {
    props.navigation.navigate(screenName);
    props.navigation.closeDrawer();
  };

  const menuItems = [
    { name: 'Home', icon: '⌂', screen: 'Home' },
    { name: 'Favorites', icon: '♡', screen: 'Favorites' },
    { name: 'Search', icon: '⌕', screen: 'Search' },
    { name: 'Settings', icon: '⚙', screen: 'Settings' },
  ];

  return (
    <DrawerContentScrollView 
      {...props}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* App Branding */}
      <Animated.View 
        style={[
          styles.brandingSection,
          { opacity: fadeAnim }
        ]}
      >
        <Text style={styles.appName}>Biblical Facts</Text>
        <Text style={styles.appSubtitle}>Evangelism Tool</Text>
      </Animated.View>

      {/* Navigation Menu */}
      <Animated.View 
        style={[
          styles.navigationSection,
          { opacity: fadeAnim }
        ]}
      >
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigateToScreen(item.screen)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  brandingSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D2B48C',
    marginBottom: 30,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#A0522D',
    fontStyle: 'italic',
  },
  navigationSection: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  menuIcon: {
    fontSize: 20,
    color: '#8B4513',
    width: 30,
    textAlign: 'center',
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '500',
  },
});

export default CustomDrawerContent;

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
    props.navigation.navigate('TabNavigator', { screen: screenName });
    props.navigation.closeDrawer();
  };

  const menuItems = [
    { name: 'Home', icon: '⌂', screen: 'Home' },
    { name: 'Favorites', icon: '♡', screen: 'Favorites' },
    { name: 'Settings', icon: '⊛', screen: 'Settings' },
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
          <View key={index}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateToScreen(item.screen)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuText}>{item.name}</Text>
            </TouchableOpacity>
            {index < menuItems.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </Animated.View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0E6D2',
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
    marginHorizontal: 16,
    marginTop: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#654321',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#8B4513',
    fontStyle: 'italic',
  },
  navigationSection: {
    paddingHorizontal: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  menuIcon: {
    fontSize: 20,
    color: '#654321',
    width: 30,
    textAlign: 'center',
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#654321',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#D2B48C',
    marginHorizontal: 32,
    opacity: 0.3,
  },
});

export default CustomDrawerContent;

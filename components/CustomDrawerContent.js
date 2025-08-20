import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import AmharicText from '../src/components/AmharicText';

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
    { name: 'ዋና ገጽ', icon: '⌂', screen: 'Home' },
    { name: 'ቅንብሮች', icon: '⊛', screen: 'Settings' },
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
        <AmharicText variant="heading" style={styles.appName}>Melhik</AmharicText>
        <AmharicText variant="caption" style={styles.appSubtitle}>የሃይማኖት መሳሪያ</AmharicText>
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
              <AmharicText style={styles.menuIcon}>{item.icon}</AmharicText>
              <AmharicText variant="body" style={styles.menuText}>{item.name}</AmharicText>
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

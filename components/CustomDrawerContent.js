import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';

const CustomDrawerContent = (props) => {
  const menuItems = [
    {
      id: 'home',
      title: 'Home',
      icon: '🏠',
      screen: 'Home'
    },
    {
      id: 'favorites',
      title: 'Favorites',
      icon: '❤️',
      screen: 'Favorites'
    },
    {
      id: 'search',
      title: 'Search',
      icon: '🔍',
      screen: 'Search'
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: '⚙️',
      screen: 'Settings'
    }
  ];

  const handleNavigation = (screenName) => {
    props.navigation.navigate(screenName);
    props.navigation.closeDrawer();
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.appIconContainer}>
            <Text style={styles.appIcon}>✝️</Text>
          </View>
          <Text style={styles.appName}>Biblical Facts</Text>
          <Text style={styles.appSubtitle}>Evangelism Tool</Text>
        </View>

        {/* Navigation Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                props.state.index === props.state.routes.findIndex(route => route.name === item.screen) && styles.activeMenuItem
              ]}
              onPress={() => handleNavigation(item.screen)}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[
                styles.menuTitle,
                props.state.index === props.state.routes.findIndex(route => route.name === item.screen) && styles.activeMenuTitle
              ]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "Always be prepared to give an answer"
          </Text>
          <Text style={styles.footerReference}>1 Peter 3:15</Text>
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DEB887',
    backgroundColor: '#FFFFFF',
  },
  appIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#8B4513',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appIcon: {
    fontSize: 30,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#A0522D',
  },
  menuContainer: {
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  activeMenuItem: {
    backgroundColor: '#8B4513',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
  },
  activeMenuTitle: {
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#DEB887',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#A0522D',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  footerReference: {
    fontSize: 12,
    color: '#CD853F',
    fontWeight: 'bold',
  },
});

export default CustomDrawerContent;

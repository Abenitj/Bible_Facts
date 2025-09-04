import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AmharicText from '../src/components/AmharicText';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import { getColors } from '../src/theme/colors';

const BottomTabNavigator = ({ state, descriptors, navigation }) => {
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);

  const getTabIcon = (routeName, focused) => {
    switch (routeName) {
      case 'Home':
        return focused ? 'home' : 'home-outline';
      case 'Bookmarks':
        return focused ? 'bookmark' : 'bookmark-outline';
      case 'Topics':
        return focused ? 'library' : 'library-outline';
      case 'Settings':
        return focused ? 'settings' : 'settings-outline';
      default:
        return 'circle-outline';
    }
  };

  const getTabLabel = (routeName) => {
    switch (routeName) {
      case 'Home':
        return 'መነሻ';
      case 'Bookmarks':
        return 'መዝገቦች';
      case 'Topics':
        return 'ርዕሶች';
      case 'Settings':
        return 'ቅንብሮች';
      default:
        return routeName;
    }
  };

  const getTabColor = (focused) => {
    return focused ? colors.primary : colors.textSecondary;
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(55, 65, 81, 0.05)',
      borderTopWidth: 0.5,
      borderTopColor: 'rgba(0, 0, 0, 0.1)'
    }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = getTabLabel(route.name);
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <Ionicons
                name={getTabIcon(route.name, isFocused)}
                size={24}
                color={getTabColor(isFocused)}
              />
              <AmharicText
                variant="caption"
                style={[
                  styles.tabLabel,
                  {
                    color: getTabColor(isFocused),
                    fontWeight: isFocused ? '600' : '500'
                  }
                ]}
              >
                {label}
              </AmharicText>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default BottomTabNavigator;

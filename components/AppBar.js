import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AmharicText from '../src/components/AmharicText';

const AppBar = ({ 
  title, 
  showBack = false, 
  onBackPress, 
  showMenu = false, 
  onMenuPress 
}) => {
  return (
    <View style={styles.appBar}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.6}
          >
            <AmharicText style={styles.backIcon}>‹</AmharicText>
          </TouchableOpacity>
        )}
        {showMenu && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onMenuPress}
            activeOpacity={0.6}
          >
            <View style={styles.menuIcon}>
              <View style={[styles.menuLine, { marginBottom: 4 }]} />
              <View style={[styles.menuLine, { marginBottom: 4 }]} />
              <View style={styles.menuLine} />
            </View>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.titleSection}>
        <AmharicText variant="subheading" style={styles.title}>{title}</AmharicText>
        <View style={styles.titleIndicator} />
      </View>
      
      <View style={styles.rightSection}>
        {/* Placeholder for future right-side buttons */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#654321',
    borderBottomWidth: 1,
    borderBottomColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    position: 'relative',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  backIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: -2,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  menuIcon: {
    width: 20,
    height: 16,
    justifyContent: 'space-between',
  },
  menuLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  titleSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  titleIndicator: {
    width: 20,
    height: 2,
    backgroundColor: '#F5F5DC',
    borderRadius: 1,
    alignSelf: 'center',
  },
  rightSection: {
    minWidth: 40,
  },
});

export default AppBar;

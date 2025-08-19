import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share
} from 'react-native';
import { StorageService } from '../utils/storage';

const FactCard = ({ fact, onFavoriteChange }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, [fact.id]);

  const checkFavoriteStatus = async () => {
    const favorite = await StorageService.isFavorite(fact.id);
    setIsFavorite(favorite);
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await StorageService.removeFromFavorites(fact.id);
        setIsFavorite(false);
      } else {
        await StorageService.addToFavorites(fact.id);
        setIsFavorite(true);
      }
      if (onFavoriteChange) {
        onFavoriteChange();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const shareFact = async () => {
    try {
      const shareMessage = `${fact.title}\n\n${fact.fact}\n\nReference: ${fact.reference}`;
      await Share.share({
        message: shareMessage,
        title: fact.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share fact');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{fact.title}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={shareFact} style={styles.actionButton}>
            <Text style={styles.actionText}>📤</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFavorite} style={styles.actionButton}>
            <Text style={styles.actionText}>
              {isFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.factText}>{fact.fact}</Text>
      
      <View style={styles.footer}>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>{fact.category}</Text>
        </View>
        <Text style={styles.reference}>{fact.reference}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  actionText: {
    fontSize: 20,
  },
  factText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495e',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  reference: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
});

export default FactCard;

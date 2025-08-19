import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FactCard from '../components/FactCard';
import { getFactsByCategory, searchFacts, categories } from '../data/biblicalFacts';
import { StorageService } from '../utils/storage';

const FactsScreen = ({ navigation, route }) => {
  const [facts, setFacts] = useState([]);
  const [filteredFacts, setFilteredFacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const category = route.params?.category || 'all';
    setSelectedCategory(category);
    loadFacts(category);
    loadFavorites();
  }, [route.params?.category]);

  useEffect(() => {
    filterFacts();
  }, [searchQuery, facts]);

  const loadFacts = (category) => {
    const categoryFacts = getFactsByCategory(category);
    setFacts(categoryFacts);
    setFilteredFacts(categoryFacts);
  };

  const loadFavorites = async () => {
    const userFavorites = await StorageService.getFavorites();
    setFavorites(userFavorites);
  };

  const filterFacts = () => {
    if (searchQuery.trim() === '') {
      setFilteredFacts(facts);
    } else {
      const searchResults = searchFacts(searchQuery);
      setFilteredFacts(searchResults);
    }
  };

  const handleFavoriteChange = () => {
    loadFavorites();
  };

  const renderFact = ({ item }) => (
    <FactCard fact={item} onFavoriteChange={handleFavoriteChange} />
  );

  const renderCategoryButton = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.selectedCategoryButton
      ]}
      onPress={() => {
        setSelectedCategory(item.id);
        setSearchQuery('');
        loadFacts(item.id);
      }}
    >
      <Text style={styles.categoryButtonIcon}>{item.icon}</Text>
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === item.id && styles.selectedCategoryButtonText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Biblical Facts</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search facts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#95a5a6"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryButton}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Facts List */}
      <FlatList
        data={filteredFacts}
        renderItem={renderFact}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.factsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📖</Text>
            <Text style={styles.emptyTitle}>No facts found</Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? `No facts match "${searchQuery}"`
                : 'Try selecting a different category'}
            </Text>
          </View>
        }
        ListHeaderComponent={
          filteredFacts.length > 0 ? (
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {filteredFacts.length} fact{filteredFacts.length !== 1 ? 's' : ''} found
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#3498db',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSpacer: {
    width: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2c3e50',
  },
  clearButton: {
    marginLeft: 8,
    padding: 8,
  },
  clearButtonText: {
    color: '#95a5a6',
    fontSize: 16,
  },
  categoryContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
  },
  selectedCategoryButton: {
    backgroundColor: '#3498db',
  },
  categoryButtonIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  selectedCategoryButtonText: {
    color: '#ffffff',
  },
  factsList: {
    paddingBottom: 20,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default FactsScreen;

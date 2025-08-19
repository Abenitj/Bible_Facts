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
import { searchFacts, biblicalFacts, categories } from '../data/biblicalFacts';
import { StorageService } from '../utils/storage';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
    } else {
      const results = searchFacts(searchQuery);
      if (selectedCategory !== 'all') {
        const filteredResults = results.filter(fact => 
          fact.category.toLowerCase() === selectedCategory
        );
        setSearchResults(filteredResults);
      } else {
        setSearchResults(results);
      }
    }
  }, [searchQuery, selectedCategory]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() !== '' && !recentSearches.includes(query)) {
      const newRecentSearches = [query, ...recentSearches.slice(0, 4)];
      setRecentSearches(newRecentSearches);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleFavoriteChange = () => {
    // Refresh search results to update favorite status
    if (searchQuery.trim() !== '') {
      const results = searchFacts(searchQuery);
      if (selectedCategory !== 'all') {
        const filteredResults = results.filter(fact => 
          fact.category.toLowerCase() === selectedCategory
        );
        setSearchResults(filteredResults);
      } else {
        setSearchResults(results);
      }
    }
  };

  const renderFact = ({ item }) => (
    <FactCard fact={item} onFavoriteChange={handleFavoriteChange} />
  );

  const renderRecentSearch = ({ item }) => (
    <TouchableOpacity
      style={styles.recentSearchItem}
      onPress={() => handleSearch(item)}
    >
      <Text style={styles.recentSearchText}>🔍 {item}</Text>
    </TouchableOpacity>
  );

  const renderCategoryButton = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.selectedCategoryButton
      ]}
      onPress={() => setSelectedCategory(item.id)}
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
        <Text style={styles.headerTitle}>Search Facts</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search biblical facts..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#95a5a6"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
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

      {/* Content */}
      {searchQuery.trim() === '' ? (
        <View style={styles.initialContainer}>
          <Text style={styles.initialIcon}>🔍</Text>
          <Text style={styles.initialTitle}>Search Biblical Facts</Text>
          <Text style={styles.initialText}>
            Search by title, content, or biblical reference
          </Text>
          
          {recentSearches.length > 0 && (
            <View style={styles.recentSearchesContainer}>
              <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
              <FlatList
                data={recentSearches}
                renderItem={renderRecentSearch}
                keyExtractor={(item, index) => index.toString()}
                style={styles.recentSearchesList}
              />
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderFact}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyText}>
                No facts match "{searchQuery}"
              </Text>
              <Text style={styles.emptySuggestion}>
                Try different keywords or check your spelling
              </Text>
            </View>
          }
          ListHeaderComponent={
            searchResults.length > 0 ? (
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsText}>
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                </Text>
              </View>
            ) : null
          }
        />
      )}
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
    backgroundColor: '#27ae60',
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
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#95a5a6',
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#2c3e50',
  },
  clearButton: {
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
    backgroundColor: '#27ae60',
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
  initialContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  initialIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  initialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  initialText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  recentSearchesContainer: {
    width: '100%',
  },
  recentSearchesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  recentSearchesList: {
    maxHeight: 200,
  },
  recentSearchItem: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  recentSearchText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  resultsList: {
    paddingBottom: 20,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
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
    marginBottom: 4,
  },
  emptySuggestion: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
});

export default SearchScreen;

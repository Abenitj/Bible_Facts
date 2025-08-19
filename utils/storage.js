import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@bible_facts_favorites';
const THEME_KEY = '@bible_facts_theme';
const DAILY_FACT_KEY = '@bible_facts_daily';

export const StorageService = {
  // Favorites management
  async getFavorites() {
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  },

  async addToFavorites(factId) {
    try {
      const favorites = await this.getFavorites();
      if (!favorites.includes(factId)) {
        favorites.push(factId);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
      return favorites;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return [];
    }
  },

  async removeFromFavorites(factId) {
    try {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter(id => id !== factId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      return updatedFavorites;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return [];
    }
  },

  async isFavorite(factId) {
    try {
      const favorites = await this.getFavorites();
      return favorites.includes(factId);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  },

  // Theme management
  async getTheme() {
    try {
      const theme = await AsyncStorage.getItem(THEME_KEY);
      return theme || 'light';
    } catch (error) {
      console.error('Error getting theme:', error);
      return 'light';
    }
  },

  async setTheme(theme) {
    try {
      await AsyncStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  },

  // Daily fact management
  async getDailyFact() {
    try {
      const dailyFact = await AsyncStorage.getItem(DAILY_FACT_KEY);
      return dailyFact ? JSON.parse(dailyFact) : null;
    } catch (error) {
      console.error('Error getting daily fact:', error);
      return null;
    }
  },

  async setDailyFact(fact) {
    try {
      const dailyFactData = {
        fact: fact,
        date: new Date().toDateString()
      };
      await AsyncStorage.setItem(DAILY_FACT_KEY, JSON.stringify(dailyFactData));
    } catch (error) {
      console.error('Error setting daily fact:', error);
    }
  },

  async shouldUpdateDailyFact() {
    try {
      const dailyFact = await this.getDailyFact();
      if (!dailyFact) return true;
      
      const today = new Date().toDateString();
      return dailyFact.date !== today;
    } catch (error) {
      console.error('Error checking daily fact update:', error);
      return true;
    }
  }
};

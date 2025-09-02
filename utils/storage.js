import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys for sync functionality
export const STORAGE_KEYS = {
  THEME: '@bible_facts_theme',
  DAILY_FACT: '@bible_facts_daily',
  LAST_SYNC: '@melhik_last_sync',
  CONTENT_VERSION: '@melhik_content_version',
  RELIGIONS: '@melhik_religions',
  TOPICS: '@melhik_topics',
  TOPIC_DETAILS: '@melhik_topic_details'
};

const THEME_KEY = STORAGE_KEYS.THEME;
const DAILY_FACT_KEY = STORAGE_KEYS.DAILY_FACT;

export const StorageService = {

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

// Sync-related storage functions
export const clearAllAppData = async () => {
  try {
    await AsyncStorage.clear();
    console.log('All app data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing app data:', error);
    throw error;
  }
};

export const getStorageInfo = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const appData = allKeys.filter(key => key.startsWith('@melhik_')).length;
    const syncData = allKeys.filter(key => key.startsWith('@melhik_')).length;
    const userPreferences = allKeys.filter(key => key.startsWith('@bible_facts_')).length;
    
    return {
      appData: `${appData} items`,
      syncData: `${syncData} items`,
      userPreferences: `${userPreferences} items`
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return {
      appData: 'Unknown',
      syncData: 'Unknown',
      userPreferences: 'Unknown'
    };
  }
};

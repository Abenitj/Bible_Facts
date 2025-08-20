import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@bible_facts_theme';
const DAILY_FACT_KEY = '@bible_facts_daily';

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

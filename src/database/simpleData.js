// Simple data layer that bypasses SQLite completely
import { initializeFallbackData, getReligionsFallback, getTopicsByReligionFallback, getTopicByIdFallback, getReligionByIdFallback } from './fallbackData';

// Initialize data immediately
try {
  initializeFallbackData();
} catch (error) {
  console.error('Error initializing fallback data:', error);
}

// Simple wrapper functions that always use fallback data
export const initDatabase = () => {
  console.log('Simple data layer: Database initialization skipped');
  return Promise.resolve();
};

export const getReligions = () => {
  try {
    console.log('Simple data layer: Getting religions from fallback');
    return getReligionsFallback();
  } catch (error) {
    console.error('Error getting religions:', error);
    return Promise.resolve([]);
  }
};

export const getTopicsByReligion = (religionId) => {
  try {
    console.log('Simple data layer: Getting topics for religion', religionId);
    return getTopicsByReligionFallback(religionId);
  } catch (error) {
    console.error('Error getting topics by religion:', error);
    return Promise.resolve([]);
  }
};

export const getTopicById = (id) => {
  try {
    console.log('Simple data layer: Getting topic by id', id);
    return getTopicByIdFallback(id);
  } catch (error) {
    console.error('Error getting topic by id:', error);
    return Promise.resolve(null);
  }
};

export const getReligionById = (id) => {
  try {
    console.log('Simple data layer: Getting religion by id', id);
    return getReligionByIdFallback(id);
  } catch (error) {
    console.error('Error getting religion by id:', error);
    return Promise.resolve(null);
  }
};

export const insertReligion = (religion) => {
  console.log('Simple data layer: Religion insert skipped');
  return Promise.resolve();
};

export const insertTopic = (topic) => {
  console.log('Simple data layer: Topic insert skipped');
  return Promise.resolve();
};

export const initializeSampleData = () => {
  console.log('Simple data layer: Sample data already initialized');
  return Promise.resolve();
};

export const getSetting = (key) => {
  console.log('Simple data layer: Getting setting', key);
  return Promise.resolve(null);
};

export const setSetting = (key, value) => {
  console.log('Simple data layer: Setting', key, 'to', value);
  return Promise.resolve();
};

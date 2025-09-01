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

export const getReligions = async () => {
  try {
    console.log('Simple data layer: Getting religions from fallback');
    const religions = await getReligionsFallback();
    return religions || [];
  } catch (error) {
    console.error('Error getting religions:', error);
    return [];
  }
};

export const getTopicsByReligion = async (religionId) => {
  try {
    console.log('Simple data layer: Getting topics for religion', religionId);
    const topics = await getTopicsByReligionFallback(religionId);
    return topics || [];
  } catch (error) {
    console.error('Error getting topics by religion:', error);
    return [];
  }
};

export const getTopicById = async (id) => {
  try {
    console.log('Simple data layer: Getting topic by id', id);
    const topic = await getTopicByIdFallback(id);
    return topic || null;
  } catch (error) {
    console.error('Error getting topic by id:', error);
    return null;
  }
};

export const getReligionById = async (id) => {
  try {
    console.log('Simple data layer: Getting religion by id', id);
    const religion = await getReligionByIdFallback(id);
    return religion || null;
  } catch (error) {
    console.error('Error getting religion by id:', error);
    return null;
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

// Simple data layer that bypasses SQLite completely
import { initializeFallbackData, getReligionsFallback, getTopicsByReligionFallback, getTopicByIdFallback } from './fallbackData';

// Initialize data immediately
initializeFallbackData();

// Simple wrapper functions that always use fallback data
export const initDatabase = () => {
  console.log('Simple data layer: Database initialization skipped');
  return Promise.resolve();
};

export const getReligions = () => {
  console.log('Simple data layer: Getting religions from fallback');
  return getReligionsFallback();
};

export const getTopicsByReligion = (religionId) => {
  console.log('Simple data layer: Getting topics for religion', religionId);
  return getTopicsByReligionFallback(religionId);
};

export const getTopicById = (id) => {
  console.log('Simple data layer: Getting topic by id', id);
  return getTopicByIdFallback(id);
};

export const getReligionById = (id) => {
  console.log('Simple data layer: Getting religion by id', id);
  return getReligionByIdFallback(id);
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

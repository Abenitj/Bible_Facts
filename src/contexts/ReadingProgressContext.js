import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ReadingProgressContext = createContext();

export const useReadingProgress = () => {
  const context = useContext(ReadingProgressContext);
  if (!context) {
    throw new Error('useReadingProgress must be used within a ReadingProgressProvider');
  }
  return context;
};

export const ReadingProgressProvider = ({ children }) => {
  const [readingProgress, setReadingProgress] = useState({});
  const [lastReadTopics, setLastReadTopics] = useState([]);

  // Load reading progress on app start
  useEffect(() => {
    loadReadingProgress();
  }, []);

  const loadReadingProgress = async () => {
    try {
      const savedProgress = await AsyncStorage.getItem('readingProgress');
      const savedLastRead = await AsyncStorage.getItem('lastReadTopics');
      
      if (savedProgress) {
        setReadingProgress(JSON.parse(savedProgress));
      }
      
      if (savedLastRead) {
        setLastReadTopics(JSON.parse(savedLastRead));
      }
    } catch (error) {
      console.error('Error loading reading progress:', error);
    }
  };

  const markTopicAsRead = async (topicId, religionId) => {
    try {
      const newProgress = {
        ...readingProgress,
        [topicId]: {
          read: true,
          readAt: new Date().toISOString(),
          religionId,
        }
      };
      
      setReadingProgress(newProgress);
      await AsyncStorage.setItem('readingProgress', JSON.stringify(newProgress));
      
      // Update last read topics (keep only last 10)
      const newLastRead = [
        { topicId, religionId, readAt: new Date().toISOString() },
        ...lastReadTopics.filter(item => item.topicId !== topicId)
      ].slice(0, 10);
      
      setLastReadTopics(newLastRead);
      await AsyncStorage.setItem('lastReadTopics', JSON.stringify(newLastRead));
      
    } catch (error) {
      console.error('Error saving reading progress:', error);
    }
  };

  const markTopicAsUnread = async (topicId) => {
    try {
      const newProgress = { ...readingProgress };
      delete newProgress[topicId];
      
      setReadingProgress(newProgress);
      await AsyncStorage.setItem('readingProgress', JSON.stringify(newProgress));
      
      // Remove from last read topics
      const newLastRead = lastReadTopics.filter(item => item.topicId !== topicId);
      setLastReadTopics(newLastRead);
      await AsyncStorage.setItem('lastReadTopics', JSON.stringify(newLastRead));
      
    } catch (error) {
      console.error('Error removing reading progress:', error);
    }
  };

  const isTopicRead = (topicId) => {
    return readingProgress[topicId]?.read || false;
  };

  const getTopicReadDate = (topicId) => {
    return readingProgress[topicId]?.readAt;
  };

  const getReadingStats = () => {
    const totalRead = Object.keys(readingProgress).length;
    const lastRead = lastReadTopics[0];
    
    return {
      totalRead,
      lastReadTopic: lastRead ? {
        topicId: lastRead.topicId,
        religionId: lastRead.religionId,
        readAt: lastRead.readAt
      } : null
    };
  };

  const getReligionProgress = (religionId) => {
    const religionTopics = Object.entries(readingProgress)
      .filter(([_, progress]) => progress.religionId === religionId);
    
    return {
      readCount: religionTopics.length,
      totalTopics: religionTopics.length, // This will be updated when we have topic counts
    };
  };

  const clearAllProgress = async () => {
    try {
      setReadingProgress({});
      setLastReadTopics([]);
      await AsyncStorage.removeItem('readingProgress');
      await AsyncStorage.removeItem('lastReadTopics');
    } catch (error) {
      console.error('Error clearing reading progress:', error);
    }
  };

  const value = {
    readingProgress,
    lastReadTopics,
    markTopicAsRead,
    markTopicAsUnread,
    isTopicRead,
    getTopicReadDate,
    getReadingStats,
    getReligionProgress,
    clearAllProgress,
  };

  return (
    <ReadingProgressContext.Provider value={value}>
      {children}
    </ReadingProgressContext.Provider>
  );
};

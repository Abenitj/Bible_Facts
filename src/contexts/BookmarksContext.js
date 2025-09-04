import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookmarksContext = createContext();

export const useBookmarks = () => {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarksProvider');
  }
  return context;
};

export const BookmarksProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]);

  // Load bookmarks on app start
  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const savedBookmarks = await AsyncStorage.getItem('bookmarks');
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const addBookmark = async (topic) => {
    try {
      const bookmark = {
        id: topic.id,
        title: topic.title,
        description: topic.description,
        religionId: topic.religionId,
        religionName: topic.religionName,
        bookmarkedAt: new Date().toISOString(),
      };

      const newBookmarks = [bookmark, ...bookmarks.filter(b => b.id !== topic.id)];
      setBookmarks(newBookmarks);
      await AsyncStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
      
      console.log(`Bookmarked topic: ${topic.title}`);
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  };

  const removeBookmark = async (topicId) => {
    try {
      const newBookmarks = bookmarks.filter(b => b.id !== topicId);
      setBookmarks(newBookmarks);
      await AsyncStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
      
      console.log(`Removed bookmark for topic: ${topicId}`);
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const toggleBookmark = async (topic) => {
    if (isBookmarked(topic.id)) {
      await removeBookmark(topic.id);
    } else {
      await addBookmark(topic);
    }
  };

  const isBookmarked = (topicId) => {
    return bookmarks.some(b => b.id === topicId);
  };

  const getBookmark = (topicId) => {
    return bookmarks.find(b => b.id === topicId);
  };

  const getBookmarksByReligion = (religionId) => {
    return bookmarks.filter(b => b.religionId === religionId);
  };

  const clearAllBookmarks = async () => {
    try {
      setBookmarks([]);
      await AsyncStorage.removeItem('bookmarks');
      console.log('Cleared all bookmarks');
    } catch (error) {
      console.error('Error clearing bookmarks:', error);
    }
  };

  const getBookmarksCount = () => {
    return bookmarks.length;
  };

  const getRecentBookmarks = (limit = 5) => {
    return bookmarks
      .sort((a, b) => new Date(b.bookmarkedAt) - new Date(a.bookmarkedAt))
      .slice(0, limit);
  };

  const value = {
    bookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    getBookmark,
    getBookmarksByReligion,
    clearAllBookmarks,
    getBookmarksCount,
    getRecentBookmarks,
  };

  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  );
};

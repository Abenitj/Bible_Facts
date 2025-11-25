import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_CONFIG } from '../config/api';

// Get cache directory with fallback
const getCacheDir = () => {
  if (!FileSystem.cacheDirectory) {
    console.error('FileSystem.cacheDirectory is not available');
    return null;
  }
  return `${FileSystem.cacheDirectory}melhik_images/`;
};

// Get base URL from API config (without /api)
const getBaseUrl = () => {
  const baseUrl = API_CONFIG.BASE_URL || 'http://192.168.0.122:3000/api';
  // Remove /api from the end to get the server base URL
  return baseUrl.replace(/\/api\/?$/, '');
};

// Convert localhost URLs to IP address from API config
const normalizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  try {
    // If URL contains localhost or 127.0.0.1, replace with IP from API config
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      const baseUrl = getBaseUrl();
      
      // Try to parse as URL
      try {
        const urlObj = new URL(url);
        const path = urlObj.pathname + urlObj.search;
        // Replace with IP address
        const normalizedUrl = `${baseUrl}${path}`;
        console.log(`Normalized image URL: ${url} -> ${normalizedUrl}`);
        return normalizedUrl;
      } catch (urlError) {
        // If URL parsing fails, try simple string replacement
        const normalizedUrl = url
          .replace(/http:\/\/localhost:\d+/, baseUrl)
          .replace(/http:\/\/127\.0\.0\.1:\d+/, baseUrl)
          .replace(/localhost/, baseUrl.replace('http://', '').split(':')[0])
          .replace(/127\.0\.0\.1/, baseUrl.replace('http://', '').split(':')[0]);
        
        if (normalizedUrl !== url) {
          console.log(`Normalized image URL (simple): ${url} -> ${normalizedUrl}`);
        }
        return normalizedUrl;
      }
    }
  } catch (error) {
    console.warn('Error normalizing URL:', error);
    return url; // Return original on error
  }
  
  return url;
};

const CACHE_METADATA_KEY = '@melhik_image_cache_metadata';
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB max cache size

/**
 * Image Cache Service
 * 
 * Downloads and caches images locally for offline viewing
 * - Downloads images from CMS server
 * - Stores in device cache directory
 * - Returns local file URI for cached images
 * - Manages cache size and cleanup
 */
class ImageCacheService {
  constructor() {
    this.cacheMetadata = null;
    this.initialized = false;
  }

  /**
   * Initialize cache directory and load metadata
   */
  async initialize() {
    if (this.initialized) return;

    try {
      const CACHE_DIR = getCacheDir();
      if (!CACHE_DIR) {
        console.warn('Image cache directory not available, caching disabled');
        this.initialized = true; // Mark as initialized to prevent retries
        return;
      }

      // Create cache directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
        console.log('Image cache directory created');
      }

      // Load cache metadata
      await this.loadCacheMetadata();
      this.initialized = true;
      console.log('Image cache service initialized');
    } catch (error) {
      console.error('Error initializing image cache:', error);
      this.initialized = true; // Mark as initialized to prevent infinite retries
    }
  }

  /**
   * Load cache metadata from AsyncStorage
   */
  async loadCacheMetadata() {
    try {
      const metadataJson = await AsyncStorage.getItem(CACHE_METADATA_KEY);
      this.cacheMetadata = metadataJson ? JSON.parse(metadataJson) : {};
    } catch (error) {
      console.error('Error loading cache metadata:', error);
      this.cacheMetadata = {};
    }
  }

  /**
   * Save cache metadata to AsyncStorage
   */
  async saveCacheMetadata() {
    try {
      await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(this.cacheMetadata));
    } catch (error) {
      console.error('Error saving cache metadata:', error);
    }
  }

  /**
   * Generate cache filename from URL
   */
  getCacheFileName(url) {
    if (!url || typeof url !== 'string') return null;
    
    try {
      // Create a hash from the URL
      let urlHash = 0;
      for (let i = 0; i < url.length; i++) {
        const char = url.charCodeAt(i);
        urlHash = ((urlHash << 5) - urlHash) + char;
        urlHash = urlHash & urlHash; // Convert to 32-bit integer
      }
      
      // Get file extension from URL
      const urlParts = url.split('?')[0].split('.');
      const extension = urlParts.length > 1 ? urlParts.pop() : 'jpg';
      const safeExtension = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension.toLowerCase()) 
        ? extension.toLowerCase() 
        : 'jpg';
      
      return `${Math.abs(urlHash)}.${safeExtension}`;
    } catch (error) {
      console.error('Error generating cache filename:', error);
      // Fallback: use a simple hash
      const simpleHash = url.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return `${Math.abs(simpleHash)}.jpg`;
    }
  }

  /**
   * Get local file URI for cached image
   */
  getLocalFileUri(fileName) {
    const CACHE_DIR = getCacheDir();
    if (!CACHE_DIR || !fileName) return null;
    return `${CACHE_DIR}${fileName}`;
  }

  /**
   * Check if image is cached
   */
  async isCached(url) {
    if (!url) return false;
    
    // If URL is already a local file, check if it exists
    if (url.startsWith('file://')) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(url);
        return fileInfo.exists === true;
      } catch (error) {
        return false;
      }
    }
    
    // Normalize URL first
    const normalizedUrl = normalizeImageUrl(url);
    
    // Check again after normalization
    if (normalizedUrl.startsWith('file://')) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(normalizedUrl);
        return fileInfo.exists === true;
      } catch (error) {
        return false;
      }
    }
    
    await this.initialize();
    const fileName = this.getCacheFileName(normalizedUrl);
    if (!fileName) return false;
    
    const localUri = this.getLocalFileUri(fileName);
    if (!localUri) return false;
    
    try {
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      return fileInfo.exists === true;
    } catch (error) {
      console.error('Error checking if image is cached:', error);
      return false;
    }
  }

  /**
   * Get cached image URI (local if cached, remote if not)
   */
  async getCachedImageUri(url) {
    if (!url) return null;
    
    // If URL is already a local file, return it directly
    if (url.startsWith('file://')) {
      return url;
    }
    
    // Normalize URL (convert localhost to IP)
    const normalizedUrl = normalizeImageUrl(url);
    
    // Check again after normalization
    if (normalizedUrl.startsWith('file://')) {
      return normalizedUrl;
    }
    
    await this.initialize();
    
    // Check if already cached (use normalized URL for cache key)
    const isCached = await this.isCached(normalizedUrl);
    if (isCached) {
      const fileName = this.getCacheFileName(normalizedUrl);
      const localUri = this.getLocalFileUri(fileName);
      console.log(`Using cached image: ${normalizedUrl} -> ${localUri}`);
      return localUri;
    }
    
    // Return normalized remote URL (will be cached on next download)
    return normalizedUrl;
  }

  /**
   * Download and cache image
   */
  async cacheImage(url, options = {}) {
    if (!url || typeof url !== 'string') {
      console.warn('ImageCacheService: No valid URL provided');
      return null;
    }

    // If URL is already a local file, return it directly
    if (url.startsWith('file://')) {
      console.log('ImageCacheService: URL is already a local file, skipping cache');
      return url;
    }

    // Normalize URL (convert localhost to IP)
    const normalizedUrl = normalizeImageUrl(url);

    // Check again after normalization
    if (normalizedUrl.startsWith('file://')) {
      return normalizedUrl;
    }

    await this.initialize();
    
    const CACHE_DIR = getCacheDir();
    if (!CACHE_DIR) {
      console.warn('ImageCacheService: Cache directory not available');
      return normalizedUrl; // Return normalized URL as fallback
    }

    // Skip if already cached (use normalized URL)
    if (await this.isCached(normalizedUrl)) {
      return await this.getCachedImageUri(normalizedUrl);
    }

    try {
      const fileName = this.getCacheFileName(normalizedUrl);
      if (!fileName) {
        console.warn('ImageCacheService: Could not generate filename');
        return normalizedUrl;
      }
      
      const localUri = this.getLocalFileUri(fileName);
      if (!localUri) {
        console.warn('ImageCacheService: Could not generate local URI');
        return normalizedUrl;
      }

      console.log(`Downloading image: ${normalizedUrl} -> ${localUri}`);

      // Download image (use normalized URL)
      const downloadResult = await FileSystem.downloadAsync(normalizedUrl, localUri, {
        cache: false, // Don't use system cache, we manage our own
      });

      if (downloadResult.status === 200) {
        // Get file info for metadata
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        
        // Update cache metadata (store both original and normalized URLs)
        this.cacheMetadata[normalizedUrl] = {
          fileName,
          localUri,
          url: normalizedUrl,
          originalUrl: url, // Keep original for reference
          size: fileInfo.size || 0,
          cachedAt: Date.now(),
          lastAccessed: Date.now(),
        };
        
        // Also map original URL to same cache entry
        if (url !== normalizedUrl) {
          this.cacheMetadata[url] = this.cacheMetadata[normalizedUrl];
        }

        await this.saveCacheMetadata();
        
        // Check cache size and cleanup if needed
        await this.cleanupCacheIfNeeded();

        console.log(`Image cached successfully: ${normalizedUrl}`);
        return localUri;
      } else {
        console.warn(`Failed to download image: ${normalizedUrl}, status: ${downloadResult.status}`);
        return normalizedUrl; // Return normalized URL as fallback
      }
    } catch (error) {
      console.error(`Error caching image ${normalizedUrl}:`, error);
      return normalizedUrl; // Return normalized URL as fallback
    }
  }

  /**
   * Pre-cache multiple images
   */
  async cacheImages(urls, onProgress) {
    if (!Array.isArray(urls) || urls.length === 0) return;

    await this.initialize();

    const results = [];
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        // Skip if already a local file
        if (url && typeof url === 'string' && url.startsWith('file://')) {
          results.push({ url, normalizedUrl: url, cachedUri: url, success: true, skipped: true });
          if (onProgress) {
            onProgress(i + 1, urls.length, url);
          }
          continue;
        }
        
        // Normalize URL before caching
        const normalizedUrl = normalizeImageUrl(url);
        
        // Skip if normalized URL is a local file
        if (normalizedUrl.startsWith('file://')) {
          results.push({ url, normalizedUrl, cachedUri: normalizedUrl, success: true, skipped: true });
          if (onProgress) {
            onProgress(i + 1, urls.length, normalizedUrl);
          }
          continue;
        }
        
        const cachedUri = await this.cacheImage(normalizedUrl);
        results.push({ url, normalizedUrl, cachedUri, success: !!cachedUri });
        
        if (onProgress) {
          onProgress(i + 1, urls.length, normalizedUrl);
        }
      } catch (error) {
        console.error(`Error caching image ${url}:`, error);
        const normalizedUrl = normalizeImageUrl(url);
        results.push({ url, normalizedUrl, cachedUri: normalizedUrl, success: false });
      }
    }

    return results;
  }

  /**
   * Get cache size
   */
  async getCacheSize() {
    await this.initialize();
    
    const CACHE_DIR = getCacheDir();
    if (!CACHE_DIR) return 0;
    
    try {
      let totalSize = 0;
      const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
      
      for (const file of files) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(`${CACHE_DIR}${file}`);
          if (fileInfo.exists && fileInfo.size) {
            totalSize += fileInfo.size;
          }
        } catch (error) {
          console.warn(`Error getting size for file ${file}:`, error);
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  }

  /**
   * Cleanup cache if size exceeds limit
   */
  async cleanupCacheIfNeeded() {
    try {
      const currentSize = await this.getCacheSize();
      
      if (currentSize > MAX_CACHE_SIZE) {
        console.log(`Cache size (${currentSize}) exceeds limit (${MAX_CACHE_SIZE}), cleaning up...`);
        await this.cleanupCache();
      }
    } catch (error) {
      console.error('Error checking cache size:', error);
    }
  }

  /**
   * Cleanup cache - remove oldest files
   */
  async cleanupCache(keepRecent = 50) {
    try {
      await this.initialize();
      
      const CACHE_DIR = getCacheDir();
      if (!CACHE_DIR) {
        console.warn('Cache directory not available for cleanup');
        return;
      }
      
      // Sort by last accessed time
      const entries = Object.entries(this.cacheMetadata || {})
        .map(([url, data]) => ({ url, ...data }))
        .filter(entry => entry.localUri) // Only entries with valid localUri
        .sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));

      // Keep most recent files
      const toKeep = entries.slice(0, keepRecent);
      const toRemove = entries.slice(keepRecent);

      // Remove old files
      for (const entry of toRemove) {
        try {
          if (entry.localUri) {
            const fileInfo = await FileSystem.getInfoAsync(entry.localUri);
            if (fileInfo.exists) {
              await FileSystem.deleteAsync(entry.localUri, { idempotent: true });
              delete this.cacheMetadata[entry.url];
            }
          }
        } catch (error) {
          console.error(`Error deleting cached file ${entry.localUri}:`, error);
        }
      }

      await this.saveCacheMetadata();
      console.log(`Cache cleanup completed. Removed ${toRemove.length} files, kept ${toKeep.length}`);
    } catch (error) {
      console.error('Error cleaning up cache:', error);
    }
  }

  /**
   * Clear all cached images
   */
  async clearCache() {
    try {
      await this.initialize();
      
      const CACHE_DIR = getCacheDir();
      if (!CACHE_DIR) {
        console.warn('Cache directory not available for clearing');
        return;
      }
      
      // Delete all files in cache directory
      try {
        const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
        for (const file of files) {
          try {
            await FileSystem.deleteAsync(`${CACHE_DIR}${file}`, { idempotent: true });
          } catch (error) {
            console.error(`Error deleting file ${file}:`, error);
          }
        }
      } catch (error) {
        console.error('Error reading cache directory:', error);
      }

      // Clear metadata
      this.cacheMetadata = {};
      await AsyncStorage.removeItem(CACHE_METADATA_KEY);
      
      console.log('Image cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Update last accessed time for an image
   */
  async updateLastAccessed(url) {
    if (this.cacheMetadata[url]) {
      this.cacheMetadata[url].lastAccessed = Date.now();
      await this.saveCacheMetadata();
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    await this.initialize();
    
    const size = await this.getCacheSize();
    const fileCount = Object.keys(this.cacheMetadata).length;
    
    return {
      size,
      sizeFormatted: this.formatBytes(size),
      fileCount,
      maxSize: MAX_CACHE_SIZE,
      maxSizeFormatted: this.formatBytes(MAX_CACHE_SIZE),
    };
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export default new ImageCacheService();


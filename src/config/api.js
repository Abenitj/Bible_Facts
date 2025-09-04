// Melhik CMS API Configuration
export const API_CONFIG = {
  // Choose one of these URLs based on your setup:
  
  // For local development (CMS running on same machine)
  // BASE_URL: 'http://localhost:3000/api',
  
  // For network access (CMS running on different machine) - USE THIS FOR MOBILE APP
  BASE_URL: 'http://192.168.0.122:3000/api',
  
  // For production (when you deploy your CMS)
  // BASE_URL: 'https://your-cms-domain.com/api',
  
  // API Endpoints
  ENDPOINTS: {
    SYNC_STATUS: '/sync/status',
    SYNC_DOWNLOAD: '/sync/download',
    SYNC_TRIGGER: '/sync/trigger'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

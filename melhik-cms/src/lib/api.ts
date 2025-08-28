// API utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export const apiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${API_BASE_URL}/${cleanEndpoint}`
}

export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = apiUrl(endpoint)
  
  // Add default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

export const authenticatedApiCall = async (
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> => {
  return apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  })
}


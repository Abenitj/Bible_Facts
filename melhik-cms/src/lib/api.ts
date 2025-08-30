// API utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

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
  method: string = 'GET',
  token: string,
  body?: any
): Promise<any> => {
  const url = apiUrl(endpoint)
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  }

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, options)
    const data = await response.json()

    return {
      success: response.ok,
      data: data,
      error: data.error || null
    }
  } catch (error) {
    console.error('API call failed:', error);
    return {
      success: false,
      data: null,
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}


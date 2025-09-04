// API utility functions

// Get the current port from environment or default to 3000
const getCurrentPort = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use the current window location port
    return window.location.port || '3000'
  }
  // Server-side: use environment variable or default
  return process.env.PORT || '3000'
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || `http://localhost:${getCurrentPort()}`

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
      error: data.error || null,
      response: response // Include response for status checking
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

// Enhanced API call with automatic status checking
export const smartApiCall = async (
  endpoint: string,
  options: RequestInit = {},
  checkStatusOnError?: (response: Response) => Promise<boolean>
): Promise<Response> => {
  const response = await apiCall(endpoint, options)
  
  // Check for inactive user on 401/403 errors
  if (checkStatusOnError && (response.status === 401 || response.status === 403)) {
    const wasLoggedOut = await checkStatusOnError(response)
    if (wasLoggedOut) {
      // User was logged out due to inactive status
      // Return a special response to indicate this
      return new Response(JSON.stringify({
        error: 'Account inactive',
        message: 'Your account has been deactivated. Please contact an administrator.',
        status: 'inactive'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
  
  return response
}


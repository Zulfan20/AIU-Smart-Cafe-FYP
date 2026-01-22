// API Service for Student Dashboard

const API_BASE = '/api';

// Helper to get auth token from localStorage
// This is used by student dashboard, so we use studentToken
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    // Use student-specific token to avoid conflicts with admin sessions
    const token = localStorage.getItem('studentToken') || localStorage.getItem('token'); // fallback for legacy
    if (!token) {
      console.warn('No authentication token found in localStorage');
    }
    return token;
  }
  return null;
};

// Helper to create headers with auth token
const getHeaders = (includeAuth = true) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Menu API
export const menuAPI = {
  // Fetch all menu items with optional filters
  getAll: async (filters?: { category?: string; search?: string; maxPrice?: number }) => {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    
    const response = await fetch(`${API_BASE}/menu?${params.toString()}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to fetch menu items (${response.status})`);
    }
    return response.json();
  },
};

// Orders API
export const ordersAPI = {
  // Place a new order
  create: async (items: { itemId: string; quantity: number }[]) => {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ items }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to place order');
    }
    return response.json();
  },

  // Get user's order history
  getMyOrders: async () => {
    // Check if user has auth token
    const token = getAuthToken();
    if (!token) {
      console.warn('No auth token found for getMyOrders');
      return [];
    }

    const response = await fetch(`${API_BASE}/orders`, {
      headers: getHeaders(true),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      // Return empty array for auth errors instead of throwing
      if (response.status === 401 || response.status === 403) {
        console.warn('Authentication failed for getMyOrders:', error.error);
        return [];
      }
      throw new Error(error.error || `Failed to fetch orders (${response.status})`);
    }
    return response.json();
  },
};

// Feedback API
export const feedbackAPI = {
  // Submit feedback for an order
  create: async (data: { itemId: string; orderId: string; rating: number; textReview?: string }) => {
    const response = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit feedback');
    }
    return response.json();
  },
};

// Recommendations API
export const recommendationsAPI = {
  // Get personalized recommendations
  get: async () => {
    const response = await fetch(`${API_BASE}/recommendations`, {
      headers: getHeaders(true),
    });
    if (!response.ok) {
      // If recommendations fail, return empty array instead of throwing
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.warn('Recommendations API failed:', error.error || response.status);
      return { recommendations: [] };
    }
    return response.json();
  },
};

// Auth API (for profile updates if needed)
export const authAPI = {
  // Get current user profile
  getProfile: async () => {
    // Check if user has auth token
    const token = getAuthToken();
    if (!token) {
      console.warn('No auth token found for getProfile');
      return null;
    }

    const response = await fetch(`${API_BASE}/auth/profile`, {
      headers: getHeaders(true),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      // Return null for auth errors instead of throwing
      if (response.status === 401 || response.status === 403) {
        console.warn('Authentication failed for getProfile:', error.error);
        return null;
      }
      throw new Error(error.error || `Failed to fetch profile (${response.status})`);
    }
    return response.json();
  },

  // Update user profile
  updateProfile: async (data: any) => {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },
};

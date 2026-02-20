const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
  const { token, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
}

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string; role?: string; organization?: string }) =>
    fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  
  login: (data: { email: string; password: string }) =>
    fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  
  getMe: (token: string) =>
    fetchAPI('/auth/me', { token }),
};

// Events API
export interface EventFilters {
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface EventData {
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  category: string;
  contactEmail: string;
  contactPhone?: string;
  maxAttendees?: number;
  registrationLink?: string;
}

export const eventsAPI = {
  getAll: (filters: EventFilters = {}, token?: string) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    return fetchAPI(`/events?${params.toString()}`, { token });
  },
  
  getOne: (id: string) =>
    fetchAPI(`/events/${id}`),
  
  create: (data: EventData, token: string) =>
    fetchAPI('/events', { method: 'POST', body: JSON.stringify(data), token }),
  
  update: (id: string, data: Partial<EventData>, token: string) =>
    fetchAPI(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
  
  updateStatus: (id: string, status: string, token: string) =>
    fetchAPI(`/events/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }), token }),
  
  delete: (id: string, token: string) =>
    fetchAPI(`/events/${id}`, { method: 'DELETE', token }),
};

// Auth helpers
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const getUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const setUser = (user: object) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const removeUser = () => {
  localStorage.removeItem('user');
};

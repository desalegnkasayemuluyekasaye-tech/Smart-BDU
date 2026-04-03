const API_URL = 'http://localhost:4000/api';

const getToken = () => localStorage.getItem('smartbdu_token');

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

export const authService = {
  register: async (userData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },
  login: async (credentials) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res.json();
  },
  getProfile: async () => {
    const res = await fetch(`${API_URL}/auth/profile`, {
      headers: headers()
    });
    return res.json();
  }
};

export const announcementService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/announcements?${query}`, { headers: headers() });
    return res.json();
  }
};

export const scheduleService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/schedule?${query}`, { headers: headers() });
    return res.json();
  }
};

export const courseService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/courses?${query}`, { headers: headers() });
    return res.json();
  }
};

export const assignmentService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/assignments?${query}`, { headers: headers() });
    return res.json();
  },
  getUpcoming: async () => {
    const res = await fetch(`${API_URL}/assignments/upcoming`, { headers: headers() });
    return res.json();
  }
};

export const serviceService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/services?${query}`, { headers: headers() });
    return res.json();
  }
};

export const directoryService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/directory?${query}`, { headers: headers() });
    return res.json();
  }
};

export const aiService = {
  chat: async (message, history = []) => {
    const res = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ message, history })
    });
    return res.json();
  }
};

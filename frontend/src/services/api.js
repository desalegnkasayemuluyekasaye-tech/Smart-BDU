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
  },
  createAnnouncement: async (data) => {
    const res = await fetch(`${API_URL}/announcements`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to create announcement');
    return result;
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
  },
  createCourse: async (data) => {
    const res = await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to create course');
    return result;
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
  chat: async (message, history = [], userData = null) => {
    const res = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ message, history, userData })
    });
    return res.json();
  }
};

export const adminService = {
  createUser: async (userData) => {
    const res = await fetch(`${API_URL}/auth/admin/create-user`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  },
  getUsers: async () => {
    const res = await fetch(`${API_URL}/auth/admin/users`, {
      headers: headers()
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  },
  deleteUser: async (id) => {
    const res = await fetch(`${API_URL}/auth/admin/users/${id}`, {
      method: 'DELETE',
      headers: headers()
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  }
};

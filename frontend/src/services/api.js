// Frontend API Client using the native JavaScript fetch() method

const BASE_URL = 'https://e-vaccine-remainder-1.onrender.com/api';

/**
 * Universal fetch wrapper that sets JSON headers, attaches auth tokens,
 * and handles parsing and errors cleanly.
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('vaxcare_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Fetch Error [${options.method || 'GET'} ${endpoint}]:`, error.message);
    throw error;
  }
}

// ---------------- AUTH API ---------------- //
export const authAPI = {
  login: async (credentials) => {
    return await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData) => {
    return await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getProfile: async () => {
    return await apiFetch('/auth/me', {
      method: 'GET',
    });
  },

  updateProfile: async (profileData) => {
    return await apiFetch('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// ---------------- CHILDREN API (CRUD) ---------------- //
export const childrenAPI = {
  getAll: async () => {
    return await apiFetch('/children', { method: 'GET' });
  },

  getById: async (id) => {
    return await apiFetch(`/children/${id}`, { method: 'GET' });
  },

  create: async (childData) => {
    return await apiFetch('/children', {
      method: 'POST',
      body: JSON.stringify(childData),
    });
  },

  update: async (id, childData) => {
    return await apiFetch(`/children/${id}`, {
      method: 'PUT',
      body: JSON.stringify(childData),
    });
  },

  delete: async (id) => {
    return await apiFetch(`/children/${id}`, {
      method: 'DELETE',
    });
  },
};

// ---------------- VACCINES API (CRUD) ---------------- //
export const vaccinesAPI = {
  getAll: async () => {
    return await apiFetch('/vaccines', { method: 'GET' });
  },

  getById: async (id) => {
    return await apiFetch(`/vaccines/${id}`, { method: 'GET' });
  },

  create: async (vaccineData) => {
    return await apiFetch('/vaccines', {
      method: 'POST',
      body: JSON.stringify(vaccineData),
    });
  },

  update: async (id, vaccineData) => {
    return await apiFetch(`/vaccines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vaccineData),
    });
  },

  delete: async (id) => {
    return await apiFetch(`/vaccines/${id}`, {
      method: 'DELETE',
    });
  },

  seedCatalog: async (force = false) => {
    return await apiFetch(`/vaccines/seed${force ? '?force=true' : ''}`, {
      method: 'POST',
    });
  },
};

// ---------------- VACCINATION RECORDS API (CRUD) ---------------- //
export const recordsAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiFetch(`/records${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  getByChildId: async (childId) => {
    return await apiFetch(`/records/child/${childId}`, { method: 'GET' });
  },

  update: async (id, updateData) => {
    return await apiFetch(`/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  create: async (recordData) => {
    return await apiFetch('/records', {
      method: 'POST',
      body: JSON.stringify(recordData),
    });
  },

  delete: async (id) => {
    return await apiFetch(`/records/${id}`, {
      method: 'DELETE',
    });
  },
};

// ---------------- APPOINTMENTS API (CRUD) ---------------- //
export const appointmentsAPI = {
  getAll: async () => {
    return await apiFetch('/appointments', { method: 'GET' });
  },

  create: async (appointmentData) => {
    return await apiFetch('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  },

  updateStatus: async (id, status, notes) => {
    return await apiFetch(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  },

  delete: async (id) => {
    return await apiFetch(`/appointments/${id}`, {
      method: 'DELETE',
    });
  },
};

// ---------------- REMINDERS API ---------------- //
export const remindersAPI = {
  getAll: async () => {
    return await apiFetch('/reminders', { method: 'GET' });
  },

  markRead: async (id) => {
    return await apiFetch(`/reminders/${id}/read`, {
      method: 'PUT',
    });
  },

  refreshReminders: async () => {
    return await apiFetch('/reminders/refresh', {
      method: 'POST',
    });
  },

  dismiss: async (id) => {
    return await apiFetch(`/reminders/${id}`, {
      method: 'DELETE',
    });
  },
};

// ---------------- STATS & USERS API ---------------- //
export const statsAPI = {
  getDashboard: async () => {
    return await apiFetch('/stats/dashboard', { method: 'GET' });
  },
};

export const usersAPI = {
  getDoctors: async () => {
    return await apiFetch('/users/doctors', { method: 'GET' });
  },

  getAllUsers: async () => {
    return await apiFetch('/users', { method: 'GET' });
  },

  updateRole: async (id, role) => {
    return await apiFetch(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  deleteUser: async (id) => {
    return await apiFetch(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * CollabMind AI - API Client
 * Centralizes all backend calls with JWT auth
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ─── Auth helpers ─────────────────────────────────────────────────────────────
function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('collabmind_token');
}

function setToken(token) {
  localStorage.setItem('collabmind_token', token);
}

function clearToken() {
  localStorage.removeItem('collabmind_token');
  localStorage.removeItem('collabmind_user');
}

function setUser(user) {
  localStorage.setItem('collabmind_user', JSON.stringify(user));
}

function getUser() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('collabmind_user') || 'null');
  } catch {
    return null;
  }
}

// ─── Base fetch ──────────────────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const auth = {
  async register({ email, name, password }) {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
    });
    setToken(data.access_token);
    setUser(data.user);
    return data;
  },

  async login({ email, password }) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.access_token);
    setUser(data.user);
    return data;
  },

  async me() {
    return apiFetch('/auth/me');
  },

  logout() {
    clearToken();
    if (typeof window !== 'undefined') window.location.href = '/login';
  },

  getUser,
  getToken,
  isAuthenticated: () => !!getToken(),
};

// ─── Projects API ─────────────────────────────────────────────────────────────
export const projects = {
  list: () => apiFetch('/projects/'),
  create: (data) => apiFetch('/projects/', { method: 'POST', body: JSON.stringify(data) }),
  get: (id) => apiFetch(`/projects/${id}`),
  update: (id, data) => apiFetch(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/projects/${id}`, { method: 'DELETE' }),
  createShareLink: (id, data) => apiFetch(`/projects/${id}/share`, { method: 'POST', body: JSON.stringify(data) }),
  getShareLinks: (id) => apiFetch(`/projects/${id}/share-links`),
  getShared: (token) => apiFetch(`/projects/shared/${token}`),
};

// ─── Files API ────────────────────────────────────────────────────────────────
export const files = {
  list: (projectId) => apiFetch(`/files/${projectId}`),
  upload: async (projectId, file) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/files/upload/${projectId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },
  download: (fileId) => `${API_URL}/files/download/${fileId}?token=${getToken()}`,
  delete: (fileId) => apiFetch(`/files/${fileId}`, { method: 'DELETE' }),
};

// ─── Chat API ─────────────────────────────────────────────────────────────────
export const chat = {
  sendMessage: (data) => apiFetch('/chat/message', { method: 'POST', body: JSON.stringify(data) }),
  getHistory: (projectId) => apiFetch(`/chat/history/${projectId}`),
  clearHistory: (projectId) => apiFetch(`/chat/history/${projectId}`, { method: 'DELETE' }),
};

// ─── Whiteboard API ───────────────────────────────────────────────────────────
export const whiteboard = {
  get: (projectId) => apiFetch(`/whiteboard/${projectId}`),
  save: (projectId, data) => apiFetch(`/whiteboard/${projectId}`, { method: 'PUT', body: JSON.stringify(data) }),
  clear: (projectId) => apiFetch(`/whiteboard/${projectId}`, { method: 'DELETE' }),
};

// ─── Gallery API ──────────────────────────────────────────────────────────────
export const gallery = {
  list: (projectId) => apiFetch(`/gallery/${projectId}`),
  generate: (data) => apiFetch('/gallery/generate', { method: 'POST', body: JSON.stringify(data) }),
  downloadUrl: (itemId) => `${API_URL}/gallery/download/${itemId}`,
  previewUrl: (itemId) => `${API_URL}/gallery/preview/${itemId}`,
  delete: (itemId) => apiFetch(`/gallery/${itemId}`, { method: 'DELETE' }),
};

// Convenience export
export default { auth, projects, files, chat, whiteboard, gallery };

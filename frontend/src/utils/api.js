const API_URL = process.env.REACT_APP_API_URL || '/api';

class API {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async register(username, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Boxes
  async getBoxes() {
    return this.request('/boxes');
  }

  async getBox(boxId) {
    return this.request(`/boxes/${boxId}`);
  }

  async createBox(boxData) {
    return this.request('/boxes', {
      method: 'POST',
      body: JSON.stringify(boxData),
    });
  }

  async updateBox(boxId, boxData) {
    return this.request(`/boxes/${boxId}`, {
      method: 'PUT',
      body: JSON.stringify(boxData),
    });
  }

  async deleteBox(boxId) {
    return this.request(`/boxes/${boxId}`, {
      method: 'DELETE',
    });
  }

  async shareBox(boxId, userEmail) {
    return this.request(`/boxes/${boxId}/share`, {
      method: 'POST',
      body: JSON.stringify({ user_email: userEmail }),
    });
  }

  async unshareBox(boxId, userId) {
    return this.request(`/boxes/${boxId}/share/${userId}`, {
      method: 'DELETE',
    });
  }

  // Items
  async getItems(boxId = null) {
    const query = boxId ? `?box_id=${boxId}` : '';
    return this.request(`/items${query}`);
  }

  async createItem(itemData) {
    return this.request('/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateItem(itemId, itemData) {
    return this.request(`/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  async deleteItem(itemId) {
    return this.request(`/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Upload
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return await response.json();
  }
}

export default new API();
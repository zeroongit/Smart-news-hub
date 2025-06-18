import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log('API_BASE_URL di frontend:', API_BASE_URL);

if (!API_BASE_URL) {
  console.error('API_BASE_URL is not defined! Periksa Vercel Environment Variables dan .env file.');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (err) {
      console.warn('User info invalid or not available');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===========================
// ==== PUBLIC API ROUTES ====
// ===========================

export const getPublicNews = async (params = {}) => {
  const res = await api.get('/news', { params });
  return res.data;
};

export const getNewsByCategory = async (kategori) => {
  const res = await api.get(`/news/category/${kategori}`);
  return res.data;
};

export const getNewsDetailsByCategoryAndId = async (kategori, id) => {
  const res = await api.get(`/news/category/${kategori}/${id}`);
  return res.data;
};

export const getUniqueCategories = async () => {
  const res = await api.get('/news/categories');
  return res.data;
};

// =============================
// ==== AUTH / USER PROFILE ====
// =============================

export const registerUser = async (userData) => {
  const res = await api.post('/auth/register', userData);
  return res.data;
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    const user = response.data?.user;

    if (user && user.token) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      throw new Error("Login response did not contain expected token or user data");
    }

    return response.data;
  } catch (error) {
    console.error('Error logging in user:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const logoutUser = () => {
  try {
    localStorage.removeItem('user');
    return { success: true, message: 'Logout berhasil!' };
  } catch (err) {
    return { success: false, message: 'Gagal logout.' };
  }
};

export const getUserProfile = async () => {
  const res = await api.get('/users/profile');
  return res.data;
};

export const updateUserProfile = async (profileData) => {
  const res = await api.put('/users/profile', profileData);
  return res.data;
};

// ===========================
// ==== NEWS ROUTES (CRUD) ====
// ===========================

export const createNews = async (newsData) => {
  const res = await api.post('/news', newsData);
  return res.data;
};

export const updateNews = async (id, newsData) => {
  const res = await api.put(`/news/${id}`, newsData);
  return res.data;
};

export const deleteNews = async (id) => {
  const res = await api.delete(`/news/${id}`);
  return res.data;
};

export const requestDeleteNews = async (id) => {
  const res = await api.put(`/news/request-delete/${id}`);
  return res.data;
};

export const getNewsByUserId = async (userId) => {
  const res = await api.get(`/news/user/${userId}`);
  return res.data;
};

// ===========================
// ==== ADMIN ONLY ROUTES ====
// ===========================

export const getNewsByStatus = async (status) => {
  const res = await api.get(`/news/status/${status}`);
  return res.data;
};

export const approveNews = async (id) => {
  const res = await api.put(`/news/approve/${id}`);
  return res.data;
};

export const rejectNews = async (id) => {
  const res = await api.put(`/news/reject/${id}`);
  return res.data;
};

export const getAllNewsForAdmin = async () => {
  const res = await api.get('/news/admin/all');
  return res.data;
};

// ==========================
// ==== UPLOAD IMAGE ====
// ==========================

export const uploadImage = async (formData) => {
  try {
    const res = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error uploading image:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// ===========================
// ==== NOTIFIKASI UI MODAL ====
// ===========================
export const showMessage = (message, type = 'success') => {
  const messageBox = document.createElement('div');
  const colors = {
    success: '#4CAF50',
    error: '#f44336',
    info: '#2196F3',
  };
  const bgColor = colors[type] || colors.success;

  messageBox.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: ${bgColor};
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    font-family: 'Inter', sans-serif;
    text-align: center;
    max-width: 80%;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  `;
  messageBox.textContent = message;
  document.body.appendChild(messageBox);

  setTimeout(() => {
    messageBox.style.opacity = '1';
  }, 10);

  setTimeout(() => {
    messageBox.style.opacity = '0';
    messageBox.addEventListener('transitionend', () => messageBox.remove());
  }, 3000);
};

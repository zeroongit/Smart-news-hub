// smart-news-frontend/src/services/api.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log("API_BASE_URL di frontend:", API_BASE_URL); 

if (!API_BASE_URL) {
  console.error("API_BASE_URL is not defined! Please check Vercel Environment Variables and .env file.");
}


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Fungsi-fungsi API berdasarkan Rute Backend Anda ---

// Rute Publik
export const getPublicNews = async (params = {}) => {
  try {
    const response = await api.get('/news', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching public news:', error);
    throw error;
  }
};

export const getNewsByCategory = async (categoryName) => {
  try {
    const response = await api.get(`/news/category/${categoryName}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching news by category ${categoryName}:`, error);
    throw error;
  }
};

export const getNewsDetailsByCategoryAndId = async (categoryName, id) => {
  try {
    const requestUrl = `/news/category/${categoryName}/${id}`;
    console.log(`Frontend requesting news details from: ${API_BASE_URL}${requestUrl}`);
    const response = await api.get(requestUrl);
    return response.data;
  } catch (error) {
    console.error(`Error fetching news details for ID ${id} in category ${categoryName}:`, error);
    throw error;
  }
};

export const getUniqueCategories = async () => {
  try {
    const response = await api.get('/news/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching unique categories:', error);
    throw error;
  }
};

// Autentikasi
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data && response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    console.error('Error logging in user:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Artikel (Terproteksi)
export const createNews = async (newsData) => {
  try {
    const response = await api.post('/news', newsData);
    return response.data;
  } catch (error) {
    console.error('Error creating news:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const updateNews = async (id, newsData) => {
  try {
    const response = await api.put(`/news/${id}`, newsData);
    return response.data;
  } catch (error) {
    console.error(`Error updating news for ID ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// BARU: Fungsi untuk meminta penghapusan berita (mengubah status menjadi ReviewDelete)
export const requestDeleteNews = async (id) => {
  try {
    const response = await api.put(`/news/request-delete/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error requesting delete for news ID ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};


// Artikel berdasarkan User
export const getNewsByUserId = async (userId) => {
  try {
    const response = await api.get(`/news/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching news by user ID ${userId}:`, error);
    throw error;
  }
};

// Admin
export const getNewsByStatus = async (status) => {
  try {
    const response = await api.get(`/news/status/${status}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching news by status ${status}:`, error);
    throw error;
  }
};

export const approveNews = async (id) => {
  try {
    const response = await api.put(`/news/approve/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error approving news for ID ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const rejectNews = async (id) => {
  try {
    const response = await api.put(`/news/reject/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error rejecting news for ID ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const deleteNews = async (id) => {
  try {
    const response = await api.delete(`/news/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting news for ID ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getAllNewsForAdmin = async () => {
  try {
    const response = await api.get('/news/admin/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all news for admin:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Profil Pengguna
export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Upload Gambar
export const uploadImage = async (formData) => {
  try {
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Menampilkan pesan sebagai modal sederhana.
 * @param {string} message - Pesan yang akan ditampilkan.
 * @param {string} type - Tipe pesan ('success', 'error', 'info'). Default 'success'.
 */
function showMessage(message, type = 'success') {
  const messageBox = document.createElement('div');
  let bgColor = '#4CAF50';
  if (type === 'error') {
    bgColor = '#f44336';
  } else if (type === 'info') {
    bgColor = '#2196F3';
  }

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
}

export { showMessage };

// Fungsi Logout
export const logoutUser = () => {
  try {
    localStorage.removeItem('user');
    return { success: true, message: 'Logout berhasil!' };
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: false, message: 'Gagal logout. Silakan coba lagi.' };
  }
};

// smart-news-frontend/src/pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, showMessage } from '../services/api'; // Path diperbaiki

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);

    try {
      const response = await loginUser({ email, password }); 
      const user = response?.data?.user;

      if (user && user.token && user.username && user._id) {
        localStorage.setItem('user', JSON.stringify(user));
        console.log('User data saved to localStorage:', user);
      } else {
        console.warn('Login response did not contain expected token or user data:', response);
        showMessage('Login gagal. Data user tidak lengkap.', 'error');
        return;
      }

      showMessage(response?.data?.message || 'Login berhasil!', 'success');

      setTimeout(() => {
        console.log('Attempting to navigate to dashboard based on role...');
        navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
      }, 50);

    } catch (err) {
      setError(err.message || 'Login gagal. Silakan coba lagi.');
      showMessage(err.message || 'Login gagal. Silakan coba lagi.', 'error');
      console.error('Login error:', err);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email:
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Kata Sandi:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            >
              Daftar Akun
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;

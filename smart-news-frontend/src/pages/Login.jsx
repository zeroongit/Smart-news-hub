// Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Dapatkan URL API dari environment variable
  // Pastikan Anda telah mengatur VITE_API_URL di Vercel dengan nilai URL Railway Anda
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Optional: Tambahkan log untuk debugging saat development
  // console.log("API Base URL:", API_BASE_URL);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi jika API_BASE_URL belum diatur
    if (!API_BASE_URL) {
      setError('Kesalahan konfigurasi: URL API backend tidak ditemukan.');
      console.error("VITE_API_URL is not defined in environment variables!");
      return;
    }

    try {
      // Gunakan API_BASE_URL dari environment variable
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login gagal');

      // Simpan token & data user ke localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      alert('Login berhasil!');
      navigate('/home');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] text-white">
      <div className="bg-[#161616] p-8 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login ke Portal</h2>

        {error && (
          <div className="bg-red-500 text-white text-sm p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">Email</label>
            <input
              type="email"
              className="w-full p-2 rounded bg-[#1f1f1f] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@test.com"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Password</label>
            <input
              type="password"
              className="w-full p-2 rounded bg-[#1f1f1f] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 transition-colors py-2 rounded text-white font-semibold"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile, showMessage } from '../services/api';


function Profile() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(); // Menggunakan fungsi API untuk mengambil profil
        setUsername(data.username);
        setEmail(data.email);
      } catch (err) {
        setError(err.message || 'Gagal memuat profil pengguna.');
        showMessage(err.message || 'Terjadi kesalahan saat memuat profil.', 'error');
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const updatedProfile = { username, email };
      await updateUserProfile(updatedProfile); 
      
      showMessage('Profil berhasil diperbarui!', 'success');

      // navigate('/dashboard'); 
    } catch (err) {
      setError(err.message || 'Gagal memperbarui profil.');
      showMessage(err.message || 'Gagal memperbarui profil.', 'error');
      console.error('Error updating profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl font-semibold">Memuat Profil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500 text-xl">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Profil Pengguna</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username:
            </label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
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
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memperbarui...' : 'Perbarui Profil'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-block align-baseline font-bold text-sm text-gray-500 hover:text-gray-800"
              disabled={isSubmitting}
            >
              Kembali ke Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;

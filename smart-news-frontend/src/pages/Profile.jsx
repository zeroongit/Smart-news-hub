import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile, showMessage } from '../services/api';

function Profile() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState(''); // State untuk bio
  const [profilePictureUrl, setProfilePictureUrl] = useState(''); // State untuk URL gambar profil
  const [website, setWebsite] = useState(''); // State untuk website
  const [instagram, setInstagram] = useState(''); // State untuk Instagram
  const [linkedin, setLinkedin] = useState(''); // State untuk LinkedIn

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(); 
        setUsername(data.username);
        setEmail(data.email);
        setBio(data.bio || ''); 
        setProfilePictureUrl(data.profilePictureUrl || 'https://placehold.co/100x100/cccccc/333333?text=No+Image'); 
        setWebsite(data.website || '');
        setInstagram(data.socialMedia?.instagram || ''); 
        setLinkedin(data.socialMedia?.linkedin || ''); 
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
      const updatedProfile = {
        username,
        email,
        bio,
        profilePictureUrl, 
        website,
        socialMedia: { 
          instagram,
          linkedin
        }
      };
      await updateUserProfile(updatedProfile); 
      
      showMessage('Profil berhasil diperbarui!', 'success');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-8">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">Profil Pengguna</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gambar Profil */}
          <div className="flex flex-col items-center mb-6">
            <img 
              src={profilePictureUrl} 
              alt="Profil Pengguna" 
              className="w-24 h-24 rounded-full object-cover border-4 border-indigo-200 shadow-md"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1" htmlFor="username">
              Username:
            </label>
            <input
              type="text"
              id="username"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1" htmlFor="email">
              Email:
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1" htmlFor="bio">
              Bio:
            </label>
            <textarea
              id="bio"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm resize-y focus:ring-indigo-500 focus:border-indigo-500"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength="500"
              placeholder="Ceritakan sedikit tentang diri Anda (maks 500 karakter)"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1" htmlFor="website">
              Website:
            </label>
            <input
              type="url"
              id="website"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>

          {/* Social Media */}
          <div className="space-y-4 pt-2 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Media Sosial</h3>
            {/* Instagram */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1" htmlFor="instagram">
                Instagram (username):
              </label>
              <input
                type="text"
                id="instagram"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="misal: john_doe_official"
              />
            </div>
            {/* LinkedIn */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1" htmlFor="linkedin">
                LinkedIn (URL profil):
              </label>
              <input
                type="url"
                id="linkedin"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="misal: https://linkedin.com/in/johndoe"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

          <div className="flex justify-between items-center mt-6">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-md shadow transition disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memperbarui...' : 'Perbarui Profil'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-800 font-medium"
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

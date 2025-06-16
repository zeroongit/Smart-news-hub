// smart-news-frontend/src/pages/news/NewsEdit.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNewsDetailsByCategoryAndId, updateNews, uploadImage, showMessage, getUniqueCategories } from '../../services/api';

function NewsEdit() {
  const { id, categoryName } = useParams();
  const navigate = useNavigate();
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [kategori, setKategori] = useState('Umum');
  const [gambarUrl, setGambarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getUniqueCategories();
        if (!data.includes('Umum')) data.unshift('Umum');
        setAvailableCategories(data);
        if (kategori && !data.includes(kategori)) {
          setAvailableCategories(prev => [...prev, kategori]);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, [kategori]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNewsDetailsByCategoryAndId(categoryName, id);
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser.role !== 'admin' && data.user_id !== currentUser._id) {
          showMessage('Anda tidak memiliki izin untuk mengedit berita ini.', 'error');
          navigate('/dashboard');
          return;
        }
        setJudul(data.judul);
        setDeskripsi(data.deskripsi);
        setKategori(data.kategori);
        setGambarUrl(data.gambar);
      } catch (err) {
        setError(err.message || 'Gagal memuat berita untuk diedit.');
        showMessage(err.message || 'Terjadi kesalahan saat memuat berita.', 'error');
        if (err.response && (err.response.status === 404 || err.response.status === 403)) {
          navigate('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id && categoryName) {
      fetchNews();
    } else {
      setError('ID Berita atau Kategori tidak ditemukan.');
      showMessage('ID Berita atau Kategori tidak ditemukan.', 'error');
      setLoading(false);
    }
  }, [id, categoryName, navigate]);

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setKategori(val);
    setShowNewCategoryInput(val === 'new-category-option');
    if (val !== 'new-category-option') setNewCategory('');
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    let finalKategori = kategori;
    if (showNewCategoryInput) {
      if (!newCategory.trim()) {
        showMessage('Kategori baru tidak boleh kosong.', 'error');
        setIsSubmitting(false);
        return;
      }
      finalKategori = newCategory.trim();
    }

    if (!deskripsi.trim()) {
      showMessage('Deskripsi tidak boleh kosong.', 'error');
      setIsSubmitting(false);
      return;
    }

    let newGambarUrl = gambarUrl;

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const uploadResponse = await uploadImage(formData);
        newGambarUrl = uploadResponse.imageUrl;
      }

      const updatedNews = {
        judul,
        deskripsi,
        kategori: finalKategori,
        gambar: newGambarUrl
      };

      await updateNews(id, updatedNews);
      showMessage('Berita berhasil diperbarui!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showMessage(err.message || 'Gagal memperbarui berita.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <p className="text-xl font-semibold">Memuat berita...</p>
    </div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen">
      <p className="text-red-500 text-xl">Error: {error}</p>
    </div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-8">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">Edit Berita</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Judul Berita</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Deskripsi</label>
            <textarea
              rows={6}
              placeholder="Edit isi berita di sini. Gunakan Enter untuk paragraf baru."
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm resize-y text-justify leading-relaxed focus:ring-indigo-500 focus:border-indigo-500"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Kategori</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={kategori}
              onChange={handleCategoryChange}
              required
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="new-category-option">-- Tambahkan Kategori Baru --</option>
            </select>
            {showNewCategoryInput && (
              <input
                type="text"
                placeholder="Nama Kategori Baru"
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                required
              />
            )}
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Gambar Berita</label>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              onChange={handleFileChange}
            />
            {gambarUrl && !selectedFile && (
              <div className="mt-2">
                <img
                  src={gambarUrl}
                  alt="Gambar lama"
                  className="w-32 h-32 object-cover rounded-md border"
                />
              </div>
            )}
            {selectedFile && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Pratinjau gambar baru"
                  className="w-32 h-32 object-cover rounded-md border"
                />
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-md shadow transition disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memperbarui...' : 'Perbarui Berita'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-800 font-medium"
              disabled={isSubmitting}
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewsEdit;
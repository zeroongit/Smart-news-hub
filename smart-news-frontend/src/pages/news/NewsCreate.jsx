import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNews, uploadImage, showMessage, getUniqueCategories } from '../../services/api';


function NewsCreate() {
  const navigate = useNavigate();
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [kategori, setKategori] = useState('Umum');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getUniqueCategories();
        if (!data.includes('Umum')) data.unshift('Umum');
        setAvailableCategories(data);
        if (data.length > 0 && kategori === 'Umum') setKategori(data[0]);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setKategori(val);
    setShowNewCategoryInput(val === 'new-category-option');
    if (val !== 'new-category-option') setNewCategory('');
  };

  const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file && file.size > 10 * 1024 * 1024) {
    showMessage('Ukuran gambar maksimal 10MB.', 'error');
    return;
  }
  setSelectedFile(file);
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!selectedFile) {
      showMessage('Harap pilih gambar untuk berita.', 'error');
      setLoading(false);
      return;
    }

    let finalKategori = kategori;
    if (showNewCategoryInput) {
      if (!newCategory.trim()) {
        showMessage('Kategori baru tidak boleh kosong.', 'error');
        setLoading(false);
        return;
      }
      finalKategori = newCategory.trim();
    }

    if (!deskripsi.trim()) {
      showMessage('Deskripsi tidak boleh kosong.', 'error');
      setLoading(false);
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const penulis = user ? user.username : 'Anonim';

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      const { imageUrl } = await uploadImage(formData);

      await createNews({
        judul,
        deskripsi,
        gambar: imageUrl,
        penulis,
        kategori: finalKategori
      });

      showMessage('Berita berhasil dibuat!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showMessage(err.message || 'Gagal membuat berita.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-8">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">Buat Berita Baru</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Judul */}
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

          {/* Deskripsi */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Deskripsi</label>
            <textarea
              rows={6}
              placeholder="Tulis isi berita di sini. Gunakan Enter untuk paragraf baru."
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm resize-y text-justify leading-relaxed focus:ring-indigo-500 focus:border-indigo-500"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              required
            />
          </div>

          {/* Kategori */}
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

          {/* Gambar */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Gambar Berita</label>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              onChange={handleFileChange}
              required
            />
            {selectedFile && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-md border"
                />
              </div>
            )}
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Tombol */}
          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-md shadow transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Membuat...' : 'Buat Berita'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-800 font-medium"
              disabled={loading}
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewsCreate;

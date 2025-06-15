// smart-news-frontend/src/pages/news/NewsCreate.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Mengimpor fungsi API, termasuk getUniqueCategories
import { createNews, uploadImage, showMessage, getUniqueCategories } from '../../services/api'; 

function NewsCreate() {
  const navigate = useNavigate();
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [kategori, setKategori] = useState('Umum'); // Default ke 'Umum'
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false); // State baru untuk input kategori manual
  const [newCategory, setNewCategory] = useState(''); // State baru untuk kategori yang diketik manual

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [availableCategories, setAvailableCategories] = useState([]); // State untuk kategori dinamis

  // Fetch kategori unik saat komponen dimuat
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getUniqueCategories();
        // Pastikan 'Umum' ada di daftar jika belum ada dari database
        if (!data.includes('Umum')) {
            data.unshift('Umum'); // Tambahkan 'Umum' di awal jika tidak ada
        }
        setAvailableCategories(data);
        // Set kategori default ke yang pertama atau 'Umum' jika ada dan belum dipilih
        if (data.length > 0 && kategori === 'Umum') {
            setKategori(data[0]);
        }
      } catch (err) {
        console.error("Error fetching unique categories:", err);
      }
    };
    fetchCategories();
  }, []); 

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleCategoryChange = (e) => {
    const selectedValue = e.target.value;
    setKategori(selectedValue);
    if (selectedValue === 'new-category-option') { // Jika opsi 'Tambahkan Kategori Baru' dipilih
      setShowNewCategoryInput(true);
      setNewCategory(''); // Bersihkan input manual
    } else {
      setShowNewCategoryInput(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!selectedFile) {
      setError('Harap pilih gambar untuk berita.');
      showMessage('Harap pilih gambar untuk berita.', 'error');
      setLoading(false);
      return;
    }

    // Tentukan kategori akhir yang akan dikirim
    let finalKategori = kategori;
    if (showNewCategoryInput) {
      if (!newCategory.trim()) {
        setError('Nama kategori baru tidak boleh kosong.');
        showMessage('Nama kategori baru tidak boleh kosong.', 'error');
        setLoading(false);
        return;
      }
      finalKategori = newCategory.trim();
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const penulis = user ? user.username : 'Anonim';

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      const uploadResponse = await uploadImage(formData);
      const gambarUrl = uploadResponse.imageUrl;

      const newsData = { 
        judul, 
        deskripsi, 
        gambar: gambarUrl,
        penulis,
        kategori: finalKategori // Gunakan kategori akhir yang sudah ditentukan
      }; 
      await createNews(newsData);
      
      showMessage('Berita berhasil dibuat!', 'success');
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.message || 'Gagal membuat berita. Silakan coba lagi.');
      showMessage(err.message || 'Gagal membuat berita. Silakan coba lagi.', 'error');
      console.error('Error creating news:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Buat Berita Baru</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="judul">
              Judul:
            </label>
            <input
              type="text"
              id="judul"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="deskripsi">
              Deskripsi:
            </label>
            <textarea
              id="deskripsi"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32 resize-none"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="kategori">
              Kategori:
            </label>
            <select
              id="kategori"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={kategori}
              onChange={handleCategoryChange} // Menggunakan handler baru
              required
            >
              {/* Render kategori dinamis dari database */}
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              {/* Opsi untuk menambahkan kategori baru */}
              <option value="new-category-option">-- Tambahkan Kategori Baru --</option>
            </select>
            {showNewCategoryInput && (
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
                placeholder="Nama Kategori Baru"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                required
              />
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gambar">
              Gambar:
            </label>
            <input
              type="file"
              id="gambar"
              accept="image/*"
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              onChange={handleFileChange}
              required
            />
            {selectedFile && (
                <div className="mt-2">
                    <p className="text-gray-600 text-sm">Pratinjau gambar:</p>
                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-24 h-24 object-cover rounded-lg mt-1" />
                </div>
            )}
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Membuat...' : 'Buat Berita'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-block align-baseline font-bold text-sm text-gray-500 hover:text-gray-800"
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

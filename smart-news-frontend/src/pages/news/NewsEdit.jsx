import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNewsDetailsByCategoryAndId, updateNews, uploadImage, showMessage } from '../services/api'; 

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

  const categories = ['Politik', 'Ekonomi', 'Olahraga', 'Teknologi', 'Hiburan', 'Lainnya'];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNewsDetailsByCategoryAndId(categoryName, id); 
        setJudul(data.judul);
        setDeskripsi(data.deskripsi);
        setKategori(data.kategori);
        setGambarUrl(data.gambar);
      } catch (err) {
        setError(err.message || 'Gagal memuat berita untuk diedit.');
        showMessage(err.message || 'Terjadi kesalahan saat memuat berita.', 'error');
        console.error("Error fetching news for edit:", err);
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
  }, [id, categoryName]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

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
        kategori, 
        gambar: newGambarUrl 
      };
      await updateNews(id, updatedNews); 
      
      showMessage('Berita berhasil diperbarui!', 'success');
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.message || 'Gagal memperbarui berita.');
      showMessage(err.message || 'Gagal memperbarui berita.', 'error');
      console.error("Error updating news:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl font-semibold">Memuat berita...</p>
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
        <h2 className="text-2xl font-bold text-center mb-6">Edit Berita</h2>
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
              onChange={(e) => setKategori(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
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
            />
            {gambarUrl && !selectedFile && ( 
              <div className="mt-2">
                <p className="text-gray-600 text-sm">Gambar saat ini:</p>
                <img src={gambarUrl} alt="Current News" className="w-24 h-24 object-cover rounded-lg mt-1" />
              </div>
            )}
            {selectedFile && ( 
                <div className="mt-2">
                    <p className="text-gray-600 text-sm">Pratinjau gambar baru:</p>
                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-24 h-24 object-cover rounded-lg mt-1" />
                </div>
            )}
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memperbarui...' : 'Perbarui Berita'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-block align-baseline font-bold text-sm text-gray-500 hover:text-gray-800"
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

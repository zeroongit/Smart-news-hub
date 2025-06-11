// smart-news-frontend/src/pages/news/NewsEdit.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNewsDetails, updateNews, uploadImage, showMessage } from '../../services/api'; 

function NewsEdit() {
  const { id } = useParams(); // Mengambil ID berita dari URL
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // State untuk file yang dipilih

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNewsDetails(id);
        setTitle(data.title);
        setContent(data.content);
        setImageUrl(data.imageUrl); // Set gambar yang sudah ada
      } catch (err) {
        setError(err.message || 'Gagal memuat berita untuk diedit.');
        showMessage(err.message || 'Terjadi kesalahan saat memuat berita.', 'error');
        console.error("Error fetching news for edit:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNews();
    } else {
      setError('ID Berita tidak ditemukan.');
      showMessage('ID Berita tidak ditemukan.', 'error');
      setLoading(false);
    }
  }, [id]); // Dependensi pada 'id' agar data dimuat ulang jika ID berubah

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    let newImageUrl = imageUrl; 

    try {
      // Jika ada file baru yang dipilih, unggah dulu ke Cloudinary
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const uploadResponse = await uploadImage(formData); 
        newImageUrl = uploadResponse.imageUrl; 
      }

      const updatedNews = { title, content, imageUrl: newImageUrl };
      await updateNews(id, updatedNews); // 
      
      showMessage('Berita berhasil diperbarui!', 'success');
      navigate('/dashboard'); // 
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
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Judul:
            </label>
            <input
              type="text"
              id="title"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
              Konten:
            </label>
            <textarea
              id="content"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32 resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
              Gambar:
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              onChange={handleFileChange}
            />
            {imageUrl && !selectedFile && ( 
              <div className="mt-2">
                <p className="text-gray-600 text-sm">Gambar saat ini:</p>
                <img src={imageUrl} alt="Current News" className="w-24 h-24 object-cover rounded-lg mt-1" />
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

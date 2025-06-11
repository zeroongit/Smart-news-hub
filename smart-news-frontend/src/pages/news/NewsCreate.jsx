// smart-news-frontend/src/pages/news/NewsCreate.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNews, uploadImage, showMessage } from '../../services/api'; 

function NewsCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]); 
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

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      const uploadResponse = await uploadImage(formData);
      const imageUrl = uploadResponse.imageUrl; 

      const newsData = { title, content, imageUrl }; 
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
              disabled={loading} // Nonaktifkan tombol saat loading
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

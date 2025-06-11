import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getNewsDetailsByCategoryAndId, showMessage } from '../services/api'; 

function NewsDetails() {
  const { id, categoryName } = useParams(); // Mengambil categoryName dan id dari URL
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getNewsDetailsByCategoryAndId(categoryName, id);
        setNewsItem(data);
      } catch (err) {
        setError(err.message || 'Gagal memuat detail berita.');
        showMessage(err.message || 'Terjadi kesalahan saat memuat detail berita.', 'error');
        console.error(`Error fetching news details for ID ${id} (category: ${categoryName}):`, err);
      } finally {
        setLoading(false);
      }
    };

    if (id && categoryName) {
      fetchDetails();
    } else {
      setError('ID Berita atau Kategori tidak ditemukan di URL.');
      showMessage('ID Berita atau Kategori tidak ditemukan di URL.', 'error');
      setLoading(false);
    }
  }, [id, categoryName]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl font-semibold">Memuat detail berita...</p>
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

  if (!newsItem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-700">Berita tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{newsItem.judul}</h1> 
      {newsItem.gambar && ( 
        <img
          src={newsItem.gambar} 
          alt={newsItem.judul}
          className="w-full h-auto rounded-lg mb-4 object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/cccccc/333333?text=Gambar+Tidak+Tersedia"; }}
        />
      )}
      <p className="text-gray-600 text-sm mb-2">
        Oleh {newsItem.penulis} pada {new Date(newsItem.created_at).toLocaleDateString()} 
        {newsItem.kategori && ` | Kategori: ${newsItem.kategori}`} 
      </p>
      <div className="prose max-w-none mb-4">
        <p>{newsItem.deskripsi}</p> 
      </div>
    </div>
  );
}

export default NewsDetails;

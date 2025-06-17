// smart-news-frontend/src/pages/news/NewsDetails.jsx

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { getNewsDetailsByCategoryAndId, showMessage, getNewsByCategory } from '../services/api'; // Path diperbaiki

function NewsDetails() {
  const { id, categoryName } = useParams(); 
  const navigate = useNavigate(); // Inisialisasi useNavigate
  const [newsItem, setNewsItem] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      // DEBUGGING: Log nilai langsung dari useParams
      console.log('NewsDetails Component: Nilai useParams ->', { id, categoryName });

      try {
        const data = await getNewsDetailsByCategoryAndId(categoryName, id);
        setNewsItem(data);

        // Fetch related news: menggunakan kategori yang asli dari data berita
        const related = await getNewsByCategory(data.kategori); // Gunakan slug kategori dari berita yang sedang dilihat
        // Filter berita terkait agar tidak menyertakan berita yang sedang dilihat
        // dan ambil maksimal 5 berita
        const filtered = related.filter(item => item._id !== id).slice(0, 5);
        setRelatedNews(filtered);

      } catch (err) {
        setError(err.message || 'Gagal memuat detail berita.');
        showMessage(err.message || 'Terjadi kesalahan saat memuat detail berita.', 'error');
        console.error(`Error fetching news details for ID ${id} (category: ${categoryName}):`, err);
        
        // Arahkan ke halaman home jika ada error 404 atau 403 saat fetching detail
        if (err.response && (err.response.status === 404 || err.response.status === 403)) {
            showMessage('Berita tidak ditemukan atau Anda tidak memiliki akses.', 'error');
            navigate('/home'); 
        }

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
  }, [id, categoryName, navigate]); // Tambahkan navigate ke dependensi useEffect

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

  // Fungsi helper untuk menghasilkan slug kategori yang konsisten dengan NewsCard dan News model
  const generateCategorySlug = (categoryName) => {
    return categoryName
      ? categoryName.toLowerCase()
          .replace(/&/g, 'and') 
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/--+/g, '-')
          .replace(/^-+|-+$/g, '')
      : 'uncategorized';
  };

  return (
    <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3">
        <h1 className="text-4xl font-bold mb-4 text-gray-800 leading-snug">{newsItem.judul}</h1>
        {newsItem.gambar && ( 
          <img
            src={newsItem.gambar} 
            alt={newsItem.judul}
            className="w-full max-h-[400px] object-cover rounded-lg mb-4"
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/cccccc/333333?text=Gambar+Tidak+Tersedia"; }}
          />
        )}
        <p className="text-gray-500 text-sm mb-4">
          Oleh <span className="font-medium">{newsItem.penulis}</span> pada {new Date(newsItem.created_at).toLocaleDateString()}
          {/* Menampilkan nama kategori asli (kategori_nama) jika ada, jika tidak, gunakan kategori (slug) */}
          {newsItem.kategori_nama && <span> | Kategori: {newsItem.kategori_nama}</span>}
        </p>
        <div 
          className="prose max-w-none mb-4 text-justify" 
          dangerouslySetInnerHTML={{ __html: newsItem.deskripsi }} 
        />
      </div>

      {/* Sidebar berita terkait dinamis */}
      <aside className="lg:col-span-1">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-4 text-indigo-700">Berita Terkait</h3>
          {relatedNews.length > 0 ? (
            <ul className="space-y-2 text-sm text-gray-700">
              {relatedNews.map((item) => (
                <li key={item._id}>
                  {/* Pastikan link berita terkait menggunakan slug kategori yang benar */}
                  <Link 
                    to={`/news/${generateCategorySlug(item.kategori)}/${item._id}`} 
                    className="hover:text-indigo-500"
                  >
                    {item.judul.length > 60 ? item.judul.slice(0, 60) + '...' : item.judul}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Tidak ada berita terkait.</p>
          )}
        </div>
      </aside>
    </div>
  );
}

export default NewsDetails;

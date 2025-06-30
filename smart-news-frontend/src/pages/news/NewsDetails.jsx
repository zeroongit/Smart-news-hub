import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; 
import { getNewsDetailsByCategoryAndId, showMessage, getNewsByCategory } from '../../services/api'; 
import DOMPurify from 'dompurify';

function NewsDetails() {
  const { id, kategori } = useParams(); 
  const navigate = useNavigate(); 
  const [newsItem, setNewsItem] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {

      try {
        const data = await getNewsDetailsByCategoryAndId(kategori, id);
        setNewsItem(data);

        const related = await getNewsByCategory(data.kategori);
        const filtered = related.filter(item => item._id !== id).slice(0, 5);
        setRelatedNews(filtered);

      } catch (err) {
        setError(err.message || 'Gagal memuat detail berita.');
        showMessage(err.message || 'Terjadi kesalahan saat memuat detail berita.', 'error');
        console.error(`Error fetching news details for ID ${id} (category: ${kategori}):`, err);
        

        if (err.response && (err.response.status === 404 || err.response.status === 403)) {
            showMessage('Berita tidak ditemukan atau Anda tidak memiliki akses.', 'error');
            navigate('/home'); 
        }

      } finally {
        setLoading(false);
      }
    };

    if (id && kategori) {
      fetchDetails();
    } else {
      setError('ID Berita atau Kategori tidak ditemukan di URL.');
      showMessage('ID Berita atau Kategori tidak ditemukan di URL.', 'error');
      setLoading(false);
    }
  }, [id, kategori, navigate]);

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
          {newsItem.kategori_nama && <span> | Kategori: {newsItem.kategori_nama}</span>}
        </p>
        <div 
          className="prose max-w-none mb-4 text-justify" 
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(newsItem.deskripsi) }} 
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

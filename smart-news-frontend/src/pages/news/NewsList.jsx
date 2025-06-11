import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import NewsCard from '../../components/NewsCard';
import { getPublicNews, showMessage } from '../../services/api';

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getPublicNews(); 
        setNews(data);
      } catch (err) {
        setError(err.message || 'Gagal memuat berita.');
        showMessage(err.message || 'Terjadi kesalahan saat memuat berita.', 'error'); 
        console.error("Failed to fetch news:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl font-semibold">Memuat berita...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-gray-100 min-h-screen p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Semua Berita</h2>

        {loading ? (
          <p className="text-gray-600">Memuat berita...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map(item => (
              <NewsCard
                key={item._id}
                item={item}
                onClick={() => navigate(`/news/${item._id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default NewsList;

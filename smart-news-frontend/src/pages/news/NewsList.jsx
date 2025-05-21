import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import NewsCard from '../../components/NewsCard';

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/news')
      .then(res => res.json())
      .then(data => {
        setNews(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Gagal memuat berita:', err);
        setLoading(false);
      });
  }, []);

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

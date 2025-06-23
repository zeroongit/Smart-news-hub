import React, { useEffect, useState } from 'react';
import { getPublicNews, showMessage, getUniqueCategories } from '../services/api'; 
import NewsCard from '../components/NewsCard';
import { Link, useParams } from 'react-router-dom'; 
import Navbar from '../components/Navbar';
import ParticlesBackground from '../components/ParticlesBackground';

function Home() {
  const { kategori } = useParams(); 
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(kategori || ''); 
  const [availableCategories, setAvailableCategories] = useState([]); 
  const fetchCategories = async () => {
    try {
      const data = await getUniqueCategories();
      if (!data.includes('Umum')) {
          data.unshift('Umum'); 
      }
      setAvailableCategories(data);
    } catch (err) {
      console.error("Error fetching unique categories for Home:", err);
    }
  };

  useEffect(() => {
    fetchCategories(); 
  }, []); 

  useEffect(() => {
    setSelectedCategory(kategori || ''); 
  }, [kategori]);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (searchQuery) {
          params.search = searchQuery;
        }
        if (selectedCategory) { 
          params.category = selectedCategory;
        }

        const data = await getPublicNews(params);
        setNews(data);
      } catch (err) {
        setError(err.message || 'Gagal memuat berita.');
        showMessage(err.message || 'Terjadi kesalahan saat memuat berita.', 'error');
        console.error("Failed to fetch news:", err);
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
      fetchNews();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, selectedCategory]); 

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-xl font-semibold">Memuat berita...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-red-500 text-xl">Error: {error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <ParticlesBackground/>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-6">Smart News Hub</h1>

        <div className="mb-6 flex flex-col md:flex-row items-center justify-center gap-4">
          <input
            type="text"
            placeholder="Cari berita..."
            className="p-2 border border-gray-300 rounded-md w-full md:w-1/2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            />
          <select
            className="p-2 border border-gray-300 rounded-md w-full md:w-auto"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            >
            <option value="">Semua Kategori</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Berita Terbaru & Populer</h2>
        {news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <NewsCard key={item._id} news={item} />
            ))}
          </div>
        ) : (
          <p className="text-center text-lg text-gray-700">Tidak ada berita yang ditemukan dengan kriteria tersebut.</p>
        )}
      </div>
    </>
  );
}

export default Home;

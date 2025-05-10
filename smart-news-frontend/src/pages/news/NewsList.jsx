import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import NewsCard from '../../components/NewsCard';

// Dummy data for demonstration
const dummyNews = [
  { id: 1, title: 'Inovasi Teknologi di Era Digital', excerpt: 'Perkembangan teknologi mendorong transformasi digital di berbagai sektor...', content: 'Detail lengkap tentang inovasi teknologi dan dampaknya di era digital.' },
  { id: 2, title: 'Politik Global Terkini', excerpt: 'Berita terbaru seputar dinamika politik di berbagai belahan dunia...', content: 'Analisis mendalam mengenai isu-isu politik internasional.' },
  { id: 3, title: 'Ekonomi dan Pasar Modal', excerpt: 'Analisis tren pasar modal dan prospek ekonomi nasional...', content: 'Pembahasan tentang pergerakan indeks saham dan kebijakan ekonomi.' },
  { id: 4, title: 'Inovasi Startup Indonesia', excerpt: 'Startup lokal semakin berani berinovasi dan merambah pasar internasional...', content: 'Cerita sukses dan tantangan startup di Indonesia.' }
];

const NewsList = () => {
  const [news, setNews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API fetch
    setNews(dummyNews);
  }, []);

  return (
    <>
      <Navbar />
      <main className="bg-gray-100 min-h-screen p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Semua Berita</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map(item => (
            <NewsCard
              key={item.id}
              item={item}
              onClick={() => navigate(`/news/${item.id}`)}
            />
          ))}
        </div>
      </main>
    </>
  );
};

export default NewsList;

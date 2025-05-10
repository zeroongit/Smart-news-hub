import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import NewsCard from "../components/NewsCard";

const dummyNews = [
  {
    id: 1,
    title: 'Inovasi Teknologi di Era Digital',
    excerpt: 'Perkembangan teknologi mendorong transformasi digital di berbagai sektor...'
  },
  {
    id: 2,
    title: 'Politik Global Terkini',
    excerpt: 'berita terbaru seputar dinamika politik di berbagai belahan dunia...'
  },
  {
    id: 3,
    title: 'Ekonomi dan Pasar Modal',
    excerpt: 'Analisis tren pasar modal dan prsopek ekonomi nasional...'
  },
  {
    id: 4,
    title: 'Inovasi Startup Indonesia',
    excerpt: "Startup lokal semakin berani berinovasi dan merambah pasar inernasional..."
  }
];

const Home = () => {
  const Navigate = useNavigate();
  const handleCardClick = (id) => {
    Navigate(`/news/${id}`)
  };

  return (
    <>
      <Navbar />
      <main className="bg-gray-100 min-h-screen p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Berita Terbaru</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyNews.map((item) => (
            <NewsCard key={item.id} item={item} onClick={() => navigate(`/news/${item.id}`)} />
          ))} 
        </div>
      </main>
    </>
  );
};

export default Home;

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';

// Dummy data for demonstration
const dummyNews = [
  { id: 1, title: 'Inovasi Teknologi di Era Digital', content: 'Detail lengkap tentang inovasi teknologi dan dampaknya di era digital.' },
  { id: 2, title: 'Politik Global Terkini', content: 'Analisis mendalam mengenai isu-isu politik internasional.' },
  { id: 3, title: 'Ekonomi dan Pasar Modal', content: 'Pembahasan tentang pergerakan indeks saham dan kebijakan ekonomi.' },
  { id: 4, title: 'Inovasi Startup Indonesia', content: 'Cerita sukses dan tantangan startup di Indonesia.' }
];

const NewsDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    // Simulate API fetch by ID
    const found = dummyNews.find(n => n.id === parseInt(id));
    setArticle(found);
  }, [id]);

  if (!article) return <p className="p-6 text-gray-700">Loading...</p>;

  return (
    <>
      <Navbar />
      <main className="bg-gray-100 min-h-screen p-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">{article.title}</h1>
        <p className="text-gray-700 leading-relaxed">{article.content}</p>
      </main>
    </>
  );
};

export default NewsDetail;

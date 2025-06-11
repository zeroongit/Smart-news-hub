import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const NewsDetails = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`smart-news-backend.vercel.app/api/news/${id}`)
      .then(res => res.json())
      .then(data => {
        setArticle(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Gagal mengambil detail:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="p-6 text-gray-700">Memuat artikel...</p>;
  if (!article) return <p className="p-6 text-red-500">Artikel tidak ditemukan.</p>;

  return (
    <>
      <Navbar />
      <main className="bg-gray-100 min-h-screen px-6 py-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Konten utama */}
          <div className="lg:col-span-3 bg-white p-6 rounded shadow">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-64 object-cover rounded mb-6 shadow"
            />
            <h1 className="text-3xl font-bold mb-4 text-gray-900">{article.title}</h1>
            <p className="text-gray-600 text-sm mb-6">
              {new Date(article.createdAt).toLocaleDateString()} • Oleh{' '}
              <span className="font-medium text-sky-700">
                {article.author || 'Anonim'}
              </span>
            </p>
            {/* Tombol Aksi */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded shadow-sm transition"
              >
                Salin Link
              </button>

              <button
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' - ' + window.location.href)}`, '_blank')}
                className="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow-sm transition"
              >
                Share WhatsApp
              </button>

              <button
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${window.location.href}`, '_blank')}
                className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow-sm transition"
              >
                Share X
              </button>

              {/* Tombol Edit (hanya tampil jika login) */}
              {localStorage.getItem('token') && (
                <button
                  onClick={() => navigate(`/news/${id}/edit`)}
                  className="ml-auto text-sm bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded shadow-sm transition"
                >
                  Edit Artikel
                </button>
              )}
            </div>

            <div className="prose max-w-none text-gray-800 whitespace-pre-line leading-relaxed">
              {article.content}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="bg-white p-6 rounded shadow h-fit">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Tentang Penulis</h3>
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                <strong>Nama:</strong> {article.author || 'Anonim'}
              </p>
              <p>
                <strong>Tanggal Publish:</strong>{' '}
                {new Date(article.createdAt).toLocaleDateString()}
              </p>
            </div>
            {/* Tambahan fitur lain di sidebar bisa ditaruh di sini */}
          </aside>
        </div>
      </main>
    </>
  );
};

export default NewsDetails;

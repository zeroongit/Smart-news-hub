import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  const [news, setNews] = useState([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = () => {
    const token = localStorage.getItem('token');
    fetch('smart-news-backend.vercel.app/api/news/admin/all', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setNews(data));
  };

  const handleApprove = (id) => {
    const token = localStorage.getItem('token');
    fetch(`smart-news-backend.vercel.app/api/news/approve/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchNews());
  };

  const handleReject = (id) => {
    const token = localStorage.getItem('token');
    fetch(`smart-news-backend.vercel.app/api/news/reject/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchNews());
  };

  const handleDelete = (id) => {
    const token = localStorage.getItem('token');
    fetch(`smart-news-backend.vercel.app/api/news/admin/delete/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchNews());
  };

  const filteredNews = news.filter(n => {
    if (filter === 'approved') return n.isApproved;
    if (filter === 'pending') return !n.isApproved && !n.isRejected;
    if (filter === 'rejected') return n.isRejected;
    return true;
  });

  return (
    <>
      <Navbar />
      <main className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Verifikasi Berita</h2>

        <div className="mb-4 flex gap-2">
          {['all', 'approved', 'pending', 'rejected'].map((f) => (
            <button
              key={f}
              className={`px-4 py-2 rounded ${filter === f ? 'bg-sky-700 text-white' : 'bg-gray-200'}`}
              onClick={() => setFilter(f)}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {filteredNews.map(item => (
          <div key={item._id} className="bg-white p-4 shadow rounded mb-4">
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.excerpt}</p>
            <p className="text-sm text-gray-500">
              Status: {item.isApproved ? '✅ Disetujui' : item.isRejected ? '❌ Ditolak' : '⏳ Menunggu'}
            </p>

            <div className="mt-3 flex gap-2">
              {!item.isApproved && !item.isRejected && (
                <>
                  <button onClick={() => handleApprove(item._id)} className="bg-green-600 text-white px-3 py-1 rounded">
                    Setujui
                  </button>
                  <button onClick={() => handleReject(item._id)} className="bg-red-600 text-white px-3 py-1 rounded">
                    Tolak
                  </button>
                </>
              )}
              <button onClick={() => handleDelete(item._id)} className="bg-gray-500 text-white px-3 py-1 rounded">
                Hapus
              </button>
            </div>
          </div>
        ))}
      </main>
    </>
  );
};

export default AdminDashboard;

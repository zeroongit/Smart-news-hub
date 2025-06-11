import React, { useEffect, useState } from 'react';
import { getAllNewsForAdmin, deleteNews, approveNews, rejectNews, showMessage } from '../services/api'; // <--- Path Diperbaiki
import NewsCard from '../components/NewsCard'; // Path ke components/NewsCard tetap sama

function AdminDashboard() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllNewsForAdmin();
      setNews(data);
    } catch (err) {
      setError(err.message || 'Gagal memuat berita admin.');
      showMessage(err.message || 'Gagal memuat berita admin.', 'error');
      console.error("Error fetching all news for admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNews();
  }, []);

  const handleDelete = async (id) => {
    // Karena window.confirm tidak direkomendasikan, ini adalah placeholder.
    // Di produksi, Anda harus membuat modal konfirmasi kustom.
    if (window.confirm('Apakah Anda yakin ingin menghapus berita ini?')) {
      try {
        await deleteNews(id);
        showMessage('Berita berhasil dihapus!', 'success');
        fetchAllNews();
      } catch (err) {
        showMessage(err.message || 'Gagal menghapus berita.', 'error');
        console.error("Error deleting news:", err);
      }
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menyetujui berita ini?')) {
      try {
        await approveNews(id);
        showMessage('Berita berhasil disetujui!', 'success');
        fetchAllNews();
      } catch (err) {
        showMessage(err.message || 'Gagal menyetujui berita.', 'error');
        console.error("Error approving news:", err);
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menolak berita ini?')) {
      try {
        await rejectNews(id);
        showMessage('Berita berhasil ditolak!', 'success');
        fetchAllNews();
      } catch (err) {
        showMessage(err.message || 'Gagal menolak berita.', 'error');
        console.error("Error rejecting news:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl font-semibold">Memuat Berita Admin...</p>
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Admin Dashboard Berita</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <div key={item._id} className="border p-4 rounded-lg shadow-md bg-white">
            <NewsCard news={item} />
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'Public' ? 'bg-green-100 text-green-800' : item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                Status: {item.status}
              </span>
              <button
                onClick={() => handleApprove(item._id)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                disabled={item.status === 'Public'}
              >
                Setujui
              </button>
              <button
                onClick={() => handleReject(item._id)}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm"
                disabled={item.status === 'Draft'}
              >
                Tolak
              </button>
              <button
                onClick={() => handleDelete(item._id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Hapus
              </button>
              <button
                onClick={() => window.location.href = `/news/${item._id}/edit`}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;

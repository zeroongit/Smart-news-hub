import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getNewsByUserId, requestDeleteNews, showMessage } from '../services/api';
import NewsCard from '../components/NewsCard';

const Dashboard = () => {
    const navigate = useNavigate();
    const [userNews, setUserNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));
    const username = user ? user.username : 'Pengguna';
    const userId = user ? user._id : null; 

    useEffect(() => {
        const fetchUserNews = async () => {
            if (!userId) {
                setError('Pengguna tidak terautentikasi.');
                showMessage('Anda tidak memiliki akses. Silakan login.', 'error');
                setLoading(false);
                navigate('/login'); 
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const data = await getNewsByUserId(userId);
                setUserNews(data);
            } catch (err) {
                setError(err.message || 'Gagal memuat artikel Anda.');
                showMessage(err.message || 'Terjadi kesalahan saat memuat artikel Anda.', 'error');
                console.error("Error fetching user news:", err);

                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    showMessage('Sesi Anda telah berakhir atau Anda tidak memiliki izin. Silakan login kembali.', 'error');
                    localStorage.removeItem('user');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserNews();
    }, [userId, navigate]); 

    const handleEdit = (newsItem) => {
        const categorySlug = newsItem.kategori ? newsItem.kategori.toLowerCase().replace(/\s+/g, '-') : 'uncategorized';
        navigate(`/news/${categorySlug}/${newsItem._id}/edit`);
    };

    const handleRequestDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin meminta penghapusan berita ini? Permintaan akan dikirim ke admin.')) {
            try {
                await requestDeleteNews(id);
                showMessage('Permintaan penghapusan telah diajukan kepada admin!', 'success');
                fetchUserNews(); 
            } catch (err) {
                showMessage(err.message || 'Gagal mengajukan permintaan penghapusan.', 'error');
                console.error("Error requesting delete news:", err);
            }
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main className='p-6 min-h-screen bg-gray-100 text-gray-800 flex justify-center items-center'>
                    <p className="text-xl font-semibold">Memuat Dashboard Anda...</p>
                </main>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <main className='p-6 min-h-screen bg-gray-100 text-gray-800 flex justify-center items-center'>
                    <p className="text-red-500 text-xl">Error: {error}</p>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className='p-6 min-h-screen bg-gray-100 text-gray-800'>
                <h2 className='text-2xl font-bold mb-6'>Dashboard Pengguna</h2>
                <div className='bg-white p-6 rounded shadow mb-6'>
                    <p className='text-lg'>Halo, <strong>{username}</strong> 👋</p>
                    <p className='mt-2'>Selamat datang di dashboard Anda. Di sini Anda bisa mengelola artikel berita yang Anda buat.</p>
                    <button
                        onClick={() => navigate('/news/create')}
                        className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Buat Artikel Baru
                    </button>
                </div>

                <h3 className="text-xl font-bold mb-4">Artikel Anda</h3>
                {userNews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userNews.map((item) => (
                            <div key={item._id} className="border p-4 rounded-lg shadow-md bg-white">
                                <NewsCard news={item} /> {/* Menampilkan ringkasan berita */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'Public' ? 'bg-green-100 text-green-800' : item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : item.status === 'ReviewDelete' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                        Status: {item.status}
                                    </span>
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleRequestDelete(item._id)}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                                        disabled={item.status === 'ReviewDelete'} // Nonaktifkan jika sudah dalam review
                                    >
                                        {item.status === 'ReviewDelete' ? 'Menunggu Hapus' : 'Minta Hapus'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-lg text-gray-700">Anda belum membuat artikel berita.</p>
                )}
            </main>
        </>
    );
};

export default Dashboard;

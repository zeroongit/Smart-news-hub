import { useState } from "react";
import { useNavigate } from "react-router-dom"

const NewsCreate = () => {
    const navigate= useNavigate('');
    const [title, setTitle] = useState('');
    const  [content, setContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const newArticle = {
            id: Date.now(),
            title,
            content,
            author: localStorage.getItem('name') || 'Anonymous',
            createdAt: new Date().toISOString(),
        };

        console.log('artikel baru:', newArticle);

        alert('Artikel berhasil dibuat!');
        navigate('/home');
    };

    return (
        <>
            <Navbar />
            <main className="p-6 min-h-screen bg-gray-100 text-gray-800">
                <h2 className="text-2xl font-bold mb-6">Buat Artikel Baru</h2>

                <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
                    <div>
                        <label className="block mb-1 text-sm">Isi Artikel Baru</label>
                        <textarea className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[150px]" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Tuilis Isi Artikel..." required></textarea>
                    </div>
                    <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 transition-colors py-2 rounded text-white font-semibold">
                    Submit Artikel
                    </button>
                </form>
            </main>
        </>
    );
};

export default NewsCreate;
import { useState } from "react";
import { useNavigate } from "react-router-dom"

const NewsCreate = () => {
    const navigate= useNavigate('');
    const [title, setTitle] = useState('');
    const  [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');

    const handleUpload = async () => {
        if (!image) return '';

        const formData = new FormData();
        formData.append('image', image);

        try {
            const res =await fetch("http://localhost:5000/api/upload", {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            setImageUrl(data.imageUrl);
            return data.imageUrl;
        } catch (err) {
            console.error("Upload error:", err);
            return '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const uploadedImage = await handleUpload();

        const newArticle = {
            title,
            content,
            image: uploadedImage,
            author: localStorage.getItem('name') || 'Anonymous',
            createdAt: new Date().toISOString(),
        };

        try {
            const res = await fetch('http://localhost:5000/api/news', {
                method: 'POST',
                header: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(newArticle)
            });

            if (res.ok) {
                alert('Artikel berhasil dibuat!');
                navigate('/home');
            } else {
                const err = await res.json();
                alert('Gagal membuat artikel: ' +  err.error);
            }
        } catch (err) {
            console.error('Error saat mengirim artikel:', err);
            alert('Terjadi kesalahan server.')
        }
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
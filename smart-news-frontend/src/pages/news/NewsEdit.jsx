import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import Navbar from "../../components/Navbar";

const NewsEdit = () => {
    const {id} = useParams();
    const Navigate = useNavigate();
    const [title, setTilte ] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/news/${id}`);
                const data = await res.json();
                setTilte(data.title);
                setContent(data.content);
                setImage(data.image || '');
            } catch (err) {
                console.error('Gagal memuat artikel:', err);
            }
        };

        fetchArticle();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();

        const updatedArticle = {
            title,
            content,
            image
        };

        try {
            const res = await fetch(`http://localhost:5000/api/news/${id}`, {
                method: 'PUT',
                headers: {'content-type': 'application/json'},
                body: JSON.stringify(updatedArticle),
            });

            if (res.ok) {
                alert('Artikel berhasil diperbarui!');
                Navigate(`/news/${id}`);
            } else {
                alert('Gagal memperbarui artikel');
            }
        } catch (err) {
            console.error('Error saat update', err)
        }
    };

    return (
        <>
            <Navbar />
            <main className="p-6 min-h-screen bg-gray-100 text-gray-800">
                <h2 className="texr-2xl font-bold mb-6">Edit Artikel</h2>
                <form onSubmit={handelUpdate} className="bg-white p-6 rounded shadow spacey-y-4">
                    <div>
                        <label className="block mb-1 text-sm">Judul Artikel</label>
                        <input type="text" className="w-full p-2 rounded border border-gray-300" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm">Gambar (URL)</label>
                        <input type="text" className="w-full p-2 rounded border border-gray-300" value={image} onChange={(e) => setImage(e.target.value)}></input>
                    </div>
                    <div>
                        <label className="block mb-1 text-sm">Konten Artikel</label>
                        <textarea className="w-full p-2 rounded border border-gray-300 min-h-[150px]" value={content} onChange={(e) => setContent(e.target.value)} required />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition-colors py-2 rounded text-white font-semibold">Simpan Perubahan</button>
                </form>
            </main>
        </>
    );
};

export default NewsEdit;

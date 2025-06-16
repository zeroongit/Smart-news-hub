// smart-news-frontend/src/pages/news/NewsEdit.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Mengimpor komponen dan hooks Tiptap
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align'; // Untuk perataan teks

// Mengimpor fungsi API
import { getNewsDetailsByCategoryAndId, updateNews, uploadImage, showMessage, getUniqueCategories } from '../services/api'; 

// Komponen Toolbar sederhana untuk Tiptap (bisa disatukan atau dibuat terpisah jika sudah ada)
const TiptapToolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-t-md p-2 bg-gray-50 flex flex-wrap gap-1">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-blue-500 text-white p-1 rounded' : 'p-1 rounded text-gray-700 hover:bg-gray-200'}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-blue-500 text-white p-1 rounded' : 'p-1 rounded text-gray-700 hover:bg-gray-200'}
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'bg-blue-500 text-white p-1 rounded' : 'p-1 rounded text-gray-700 hover:bg-gray-200'}
      >
        Strike
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'bg-blue-500 text-white p-1 rounded' : 'p-1 rounded text-gray-700 hover:bg-gray-200'}
      >
        Quote
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-1 rounded text-gray-700 hover:bg-gray-200"
      >
        HR
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHardBreak().run()}
        className="p-1 rounded text-gray-700 hover:bg-gray-200"
      >
        BR
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        className="p-1 rounded text-gray-700 hover:bg-gray-200"
      >
        Clear
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className="p-1 rounded text-gray-700 hover:bg-gray-200"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className="p-1 rounded text-gray-700 hover:bg-gray-200"
      >
        Redo
      </button>
      
      {/* Contoh heading */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'bg-blue-500 text-white p-1 rounded' : 'p-1 rounded text-gray-700 hover:bg-gray-200'}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-blue-500 text-white p-1 rounded' : 'p-1 rounded text-gray-700 hover:bg-gray-200'}
      >
        H2
      </button>

      {/* Contoh list */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-blue-500 text-white p-1 rounded' : 'p-1 rounded text-gray-700 hover:bg-gray-200'}
      >
        UL
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-blue-500 text-white p-1 rounded' : 'p-1 rounded text-gray-700 hover:bg-gray-200'}
      >
        OL
      </button>

      {/* Contoh link */}
      <button
        type="button"
        onClick={() => {
          const url = window.prompt('URL?');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={editor.isActive('link') ? 'bg-blue-500 text-white p-1 rounded' : 'p-1 rounded text-gray-700 hover:bg-gray-200'}
      >
        Link
      </button>

      {/* Contoh image - asumsi URL gambar dari luar */}
      <button
        type="button"
        onClick={() => {
          const url = window.prompt('URL Gambar?');
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        className="p-1 rounded text-gray-700 hover:bg-gray-200"
      >
        Image
      </button>

      {/* Contoh Text Align */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={editor.isActive({ textAlign: 'left' }) ? 'bg-blue-500 text-white p-1 rounded' : 'p-1 rounded text-gray-700 hover:bg-gray-200'}
      >
        Align Left
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={editor.isActive({ textAlign: 'center' }) ? 'bg-blue-500 text-white p-1 rounded' : 'p-1 rounded text-gray-700 hover:bg-gray-200'}
      >
        Align Center
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={editor.isActive({ textAlign: 'right' }) ? 'bg-blue-500 text-white p-1 rounded' : 'p-1 rounded text-gray-700 hover:bg-gray-200'}
      >
        Align Right
      </button>
    </div>
  );
};

function NewsEdit() {
  const { id, categoryName } = useParams(); 
  const navigate = useNavigate();
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState(''); // Deskripsi akan menjadi HTML string dari Tiptap
  const [kategori, setKategori] = useState('Umum');
  const [gambarUrl, setGambarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); 

  const [availableCategories, setAvailableCategories] = useState([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Setup Tiptap editor
  // Penting: content harus diinisialisasi dengan deskripsi yang sudah ada
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // History extension can be problematic, disable if issues occur
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer nofollow',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: deskripsi, // <-- Inisialisasi konten editor dari state deskripsi
    onUpdate: ({ editor }) => {
      setDeskripsi(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none p-3 min-h-[200px] border border-gray-300 rounded-b-md bg-white',
      },
    },
  });

  // Efek samping untuk mengatur konten editor Tiptap ketika `deskripsi` berubah (misalnya, setelah data berita dimuat)
  useEffect(() => {
    if (editor && deskripsi !== editor.getHTML()) {
      editor.commands.setContent(deskripsi);
    }
  }, [deskripsi, editor]); // Tambahkan editor sebagai dependensi

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getUniqueCategories();
        if (!data.includes('Umum')) {
            data.unshift('Umum');
        }
        setAvailableCategories(data);
        // Jika kategori yang sedang diedit tidak ada di daftar dinamis, tambahkan sementaranya
        if (kategori && !data.includes(kategori)) {
          setAvailableCategories(prev => [...prev, kategori]);
        }
      } catch (err) {
        console.error("Error fetching unique categories:", err);
      }
    };
    fetchCategories();
  }, [kategori]); // Dependensi pada 'kategori' agar diperbarui jika kategori berita berubah

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNewsDetailsByCategoryAndId(categoryName, id); 
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser.role !== 'admin' && data.user_id !== currentUser._id) { 
          showMessage('Anda tidak memiliki izin untuk mengedit berita ini.', 'error');
          navigate('/dashboard'); 
          return;
        }

        setJudul(data.judul);
        setDeskripsi(data.deskripsi); // Ini akan memicu useEffect untuk editor
        setKategori(data.kategori);
        setGambarUrl(data.gambar);
      } catch (err) {
        setError(err.message || 'Gagal memuat berita untuk diedit.');
        showMessage(err.message || 'Terjadi kesalahan saat memuat berita.', 'error');
        console.error("Error fetching news for edit:", err);
        if (err.response && (err.response.status === 404 || err.response.status === 403)) {
            navigate('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id && categoryName) {
      fetchNews();
    } else {
      setError('ID Berita atau Kategori tidak ditemukan.');
      showMessage('ID Berita atau Kategori tidak ditemukan.', 'error');
      setLoading(false);
    }
  }, [id, categoryName, navigate]); 

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleCategoryChange = (e) => {
    const selectedValue = e.target.value;
    setKategori(selectedValue);
    if (selectedValue === 'new-category-option') { 
      setShowNewCategoryInput(true);
      setNewCategory(''); 
    } else {
      setShowNewCategoryInput(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    let finalKategori = kategori;
    if (showNewCategoryInput) {
      if (!newCategory.trim()) {
        setError('Nama kategori baru tidak boleh kosong.');
        showMessage('Nama kategori baru tidak boleh kosong.', 'error');
        setLoading(false);
        return;
      }
      finalKategori = newCategory.trim();
    }

    // Validasi deskripsi Tiptap
    const plainTextDeskripsi = editor ? editor.getText().trim() : '';
    if (!plainTextDeskripsi) {
      setError('Deskripsi tidak boleh kosong.');
      showMessage('Deskripsi tidak boleh kosong.', 'error');
      setLoading(false);
      return;
    }

    let newGambarUrl = gambarUrl;

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const uploadResponse = await uploadImage(formData);
        newGambarUrl = uploadResponse.imageUrl;
      }

      const updatedNews = { 
        judul, 
        deskripsi: editor.getHTML(), // Kirim konten HTML dari Tiptap
        kategori: finalKategori,
        gambar: newGambarUrl 
      };
      await updateNews(id, updatedNews); 
      
      showMessage('Berita berhasil diperbarui!', 'success');
      // Panggil ulang fetchCategories setelah update berhasil untuk memperbarui dropdown global
      fetchCategories(); 

      navigate('/dashboard'); 
    } catch (err) {
      setError(err.message || 'Gagal memperbarui berita.');
      showMessage(err.message || 'Gagal memperbarui berita.', 'error');
      console.error("Error updating news:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl font-semibold">Memuat berita...</p>
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Edit Berita</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="judul">
              Judul:
            </label>
            <input
              type="text"
              id="judul"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Deskripsi:
            </label>
            {/* Tiptap Toolbar */}
            <TiptapToolbar editor={editor} />
            {/* Tiptap Editor */}
            <EditorContent editor={editor} />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="kategori">
              Kategori:
            </label>
            <select
              id="kategori"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={kategori}
              onChange={handleCategoryChange}
              required
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="new-category-option">-- Tambahkan Kategori Baru --</option>
            </select>
            {showNewCategoryInput && (
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
                placeholder="Nama Kategori Baru"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                required
              />
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gambar">
              Gambar:
            </label>
            <input
              type="file"
              id="gambar"
              accept="image/*"
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              onChange={handleFileChange}
            />
            {gambarUrl && !selectedFile && ( 
              <div className="mt-2">
                <p className="text-gray-600 text-sm">Gambar saat ini:</p>
                <img src={gambarUrl} alt="Current News" className="w-24 h-24 object-cover rounded-lg mt-1" />
              </div>
            )}
            {selectedFile && ( 
                <div className="mt-2">
                    <p className="text-gray-600 text-sm">Pratinjau gambar baru:</p>
                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-24 h-24 object-cover rounded-lg mt-1" />
                </div>
            )}
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memperbarui...' : 'Perbarui Berita'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-block align-baseline font-bold text-sm text-gray-500 hover:text-gray-800"
              disabled={isSubmitting}
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewsEdit;

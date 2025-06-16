    // smart-news-frontend/src/pages/news/NewsCreate.jsx

    import React, { useEffect, useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    // Mengimpor komponen dan hooks Tiptap
    import { useEditor, EditorContent } from '@tiptap/react';
    import StarterKit from '@tiptap/starter-kit';
    import Link from '@tiptap/extension-link';
    import Image from '@tiptap/extension-image';
    import TextAlign from '@tiptap/extension-text-align'; // Untuk perataan teks

    // Mengimpor fungsi API
    import { createNews, uploadImage, showMessage, getUniqueCategories } from '../../services/api'; 

    // Komponen Toolbar sederhana untuk Tiptap
    const TiptapToolbar = ({ editor }) => {
      if (!editor) {
        return null;
      }

      return (
        <div className="border border-gray-300 rounded-t-md p-2 bg-gray-50 flex flex-wrap gap-1">
          <button
            type="button" // Penting: agar tidak submit form
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


    function NewsCreate() {
      const navigate = useNavigate();
      const [judul, setJudul] = useState('');
      const [deskripsi, setDeskripsi] = useState(''); // Deskripsi akan menjadi HTML string dari Tiptap
      const [kategori, setKategori] = useState('Umum');
      const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
      const [newCategory, setNewCategory] = useState('');

      const [selectedFile, setSelectedFile] = useState(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);

      const [availableCategories, setAvailableCategories] = useState([]);

      // Setup Tiptap editor
      const editor = useEditor({
        extensions: [
          StarterKit.configure({
            history: false, // History extension is causing issues with large content or many updates. Better to disable it or configure carefully.
          }),
          Link.configure({
            openOnClick: false, // Jangan buka link saat diklik di editor
            HTMLAttributes: {
              target: '_blank', // Buka link di tab baru
              rel: 'noopener noreferrer nofollow', // Atribut keamanan
            },
          }),
          Image.configure({
            inline: true,
            allowBase64: true, // Izinkan paste gambar base64 (tidak disarankan untuk produksi besar)
          }),
          TextAlign.configure({
            types: ['heading', 'paragraph'], // Tipe node yang bisa di-align
          }),
        ],
        content: deskripsi, // Inisialisasi konten dari state
        onUpdate: ({ editor }) => {
          // Setiap kali konten editor berubah, perbarui state deskripsi
          setDeskripsi(editor.getHTML());
        },
        editorProps: {
          attributes: {
            class: 'prose max-w-none focus:outline-none p-3 min-h-[200px] border border-gray-300 rounded-b-md bg-white', // Tailwind CSS class untuk styling editor
          },
        },
      });

      useEffect(() => {
        const fetchCategories = async () => {
          try {
            const data = await getUniqueCategories();
            if (!data.includes('Umum')) {
                data.unshift('Umum');
            }
            setAvailableCategories(data);
            if (data.length > 0 && kategori === 'Umum') {
                setKategori(data[0]);
            }
          } catch (err) {
            console.error("Error fetching unique categories:", err);
          }
        };
        fetchCategories();
      }, []);

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
        setLoading(true);
        setError(null);

        if (!selectedFile) {
          setError('Harap pilih gambar untuk berita.');
          showMessage('Harap pilih gambar untuk berita.', 'error');
          setLoading(false);
          return;
        }

        // Validasi deskripsi tidak kosong (setelah stripping HTML dari Tiptap)
        const plainTextDeskripsi = editor ? editor.getText().trim() : ''; // Mengambil teks biasa dari Tiptap editor
        if (!plainTextDeskripsi) {
          setError('Deskripsi tidak boleh kosong.');
          showMessage('Deskripsi tidak boleh kosong.', 'error');
          setLoading(false);
          return;
        }

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

        const user = JSON.parse(localStorage.getItem('user'));
        const penulis = user ? user.username : 'Anonim';

        try {
          const formData = new FormData();
          formData.append('image', selectedFile);
          
          const uploadResponse = await uploadImage(formData);
          const gambarUrl = uploadResponse.imageUrl;

          const newsData = { 
            judul, 
            deskripsi: editor.getHTML(), // Kirim konten HTML dari Tiptap
            gambar: gambarUrl,
            penulis,
            kategori: finalKategori 
          }; 
          await createNews(newsData);
          
          showMessage('Berita berhasil dibuat!', 'success');
          navigate('/dashboard'); 
        } catch (err) {
          setError(err.message || 'Gagal membuat berita. Silakan coba lagi.');
          showMessage(err.message || 'Gagal membuat berita. Silakan coba lagi.', 'error');
          console.error('Error creating news:', err);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-6">Buat Berita Baru</h2>
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
                  required
                />
                {selectedFile && (
                    <div className="mt-2">
                        <p className="text-gray-600 text-sm">Pratinjau gambar:</p>
                        <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-24 h-24 object-cover rounded-lg mt-1" />
                    </div>
                )}
              </div>
              {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={loading}
                >
                  {loading ? 'Membuat...' : 'Buat Berita'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="inline-block align-baseline font-bold text-sm text-gray-500 hover:text-gray-800"
                  disabled={loading}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    export default NewsCreate;
    
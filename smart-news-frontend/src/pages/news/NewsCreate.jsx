// smart-news-frontend/src/pages/news/NewsCreate.jsx

import React, { useEffect, useState, useRef } from 'react'; // Impor useRef
import { useNavigate } from 'react-router-dom';
// Impor komponen Editor dari tinymce-react
import { Editor } from '@tinymce/tinymce-react';

// Mengimpor fungsi API
import { createNews, uploadImage, showMessage, getUniqueCategories } from '../../services/api'; 

function NewsCreate() {
  const navigate = useNavigate();
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState(''); // Deskripsi akan menjadi HTML string dari TinyMCE
  const [kategori, setKategori] = useState('Umum');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const [selectedFile, setSelectedFile] = useState(null); // Untuk gambar utama berita (thumbnail)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [availableCategories, setAvailableCategories] = useState([]);

  const editorRef = useRef(null); // Ref untuk mengakses instance editor TinyMCE

  // Kunci API TinyMCE dari environment variable
  // Pastikan VITE_TINYMCE_API_KEY diatur di Vercel Environment Variables untuk frontend
  const tinymceApiKey = import.meta.env.VITE_TINYMCE_API_KEY; // Ganti 'no-api-key' dengan kunci Anda jika tidak menggunakan env

  // Fungsi untuk mengambil kategori unik dari backend
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

  useEffect(() => {
    fetchCategories(); 
  }, []); // Hanya berjalan sekali saat mount

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

    // Tentukan kategori akhir yang akan dikirim
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

    // Ambil konten HTML dari TinyMCE editor
    const editorContent = editorRef.current ? editorRef.current.getContent() : deskripsi;
    // Dapatkan teks biasa dari editor untuk validasi kekosongan
    const plainTextContent = editorRef.current ? editorRef.current.getContent({ format: 'text' }).trim() : deskripsi.replace(/<[^>]*>/g, '').trim();

    if (!plainTextContent) {
      setError('Deskripsi tidak boleh kosong.');
      showMessage('Deskripsi tidak boleh kosong.', 'error');
      setLoading(false);
      return;
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
        deskripsi: editorContent, // Kirim konten HTML dari TinyMCE
        gambar: gambarUrl,
        penulis,
        kategori: finalKategori 
      }; 
      await createNews(newsData);
      
      showMessage('Berita berhasil dibuat!', 'success');
      // Panggil ulang fetchCategories setelah create berhasil
      // Ini akan memperbarui daftar kategori jika ada kategori baru yang ditambahkan
      fetchCategories(); 
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.message || 'Gagal membuat berita. Silakan coba lagi.');
      showMessage(err.message || 'Gagal membuat berita. Silakan coba lagi.', 'error');
      console.error('Error creating news:', err);
    } finally {
      setLoading(false);
    }
  };

  // Callback untuk penanganan upload gambar di dalam TinyMCE
  // Fungsi ini akan dipanggil oleh TinyMCE ketika pengguna mencoba menyisipkan gambar
  const filePickerCallback = (cb, value, meta) => {
    // Pastikan ini adalah untuk jenis 'image'
    if (meta.filetype === 'image') {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*'); // Hanya terima file gambar

      input.onchange = async () => {
        const file = input.files[0];
        if (file) {
          showMessage('Mengunggah gambar ke Cloudinary...', 'info');
          const formData = new FormData();
          formData.append('image', file); // 'image' adalah nama field yang diharapkan backend

          try {
            // Panggil fungsi uploadImage Anda untuk mengirim file ke backend/Cloudinary
            const uploadResponse = await uploadImage(formData); 
            const imageUrl = uploadResponse.imageUrl; // Dapatkan URL gambar yang diunggah dari respons backend

            if (imageUrl) {
              cb(imageUrl, { title: file.name }); // Panggil callback TinyMCE dengan URL gambar yang sudah diunggah
              showMessage('Gambar berhasil diunggah dan disisipkan!', 'success');
            } else {
              showMessage('Gagal mendapatkan URL gambar dari Cloudinary.', 'error');
            }
          } catch (uploadError) {
            showMessage('Gagal mengunggah gambar ke Cloudinary.', 'error');
            console.error('TinyMCE Cloudinary Upload Error:', uploadError);
          }
        }
      };

      input.click(); // Trigger klik pada input file yang tersembunyi
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
            {/* Mengganti textarea dengan TinyMCE Editor */}
            <Editor
              apiKey={tinymceApiKey} // API Key TinyMCE Anda
              onInit={(evt, editor) => editorRef.current = editor}
              initialValue={deskripsi} // Set nilai awal dari state deskripsi (bisa kosong)
              init={{
                height: 300,
                menubar: true, // Menampilkan menu bar seperti Word
                plugins: [
                  "insertdatetime", "media", "table", "paste",
                  "code", "help", "wordcount", "searchreplace",
                  "visualblocks", "fullscreen", "advlist",
                  "autolink", "lists", "link", "image",
                  "charmap", "print", "preview", "anchor"
                ],

                toolbar: 
                  'undo redo | formatselect | ' +
                  'bold italic backcolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                // Konfigurasi untuk penanganan upload gambar
                file_picker_types: 'image', // Mengizinkan TinyMCE untuk menampilkan tombol upload gambar
                file_picker_callback: filePickerCallback // Menghubungkan ke fungsi callback kita
              }}
              onEditorChange={(newContent) => setDeskripsi(newContent)}
            />
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

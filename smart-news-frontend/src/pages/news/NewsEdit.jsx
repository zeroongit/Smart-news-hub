// smart-news-frontend/src/pages/news/NewsEdit.jsx

import React, { useEffect, useState, useRef } from 'react'; // Impor useRef
import { useParams, useNavigate } from 'react-router-dom';
// Impor komponen Editor dari tinymce-react
import { Editor } from '@tinymce/tinymce-react';

// Mengimpor fungsi API
import { getNewsDetailsByCategoryAndId, updateNews, uploadImage, showMessage, getUniqueCategories } from '../../services/api'; 

function NewsEdit() {
  const { id, categoryName } = useParams(); 
  const navigate = useNavigate();
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState(''); // Deskripsi akan menjadi HTML string dari TinyMCE
  const [kategori, setKategori] = useState('Umum');
  const [gambarUrl, setGambarUrl] = useState(''); // URL gambar utama berita (untuk thumbnail card)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // Untuk gambar utama berita (thumbnail)

  const [availableCategories, setAvailableCategories] = useState([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const editorRef = useRef(null); // Ref untuk mengakses instance editor TinyMCE

  // Kunci API TinyMCE dari environment variable
  // Pastikan VITE_TINYMCE_API_KEY diatur di Vercel Environment Variables untuk frontend
  const tinymceApiKey = import.meta.env.VITE_TINYMCE_API_KEY || 'no-api-key'; // Ganti 'no-api-key' dengan kunci Anda jika tidak menggunakan env

  // Fungsi untuk mengambil kategori unik dari backend
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

  useEffect(() => {
    fetchCategories(); 
  }, [kategori]); 

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
        setDeskripsi(data.deskripsi); // Set konten HTML ke state deskripsi
        setKategori(data.kategori);
        setGambarUrl(data.gambar); // Set URL gambar utama berita
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

    let newGambarUrl = gambarUrl;

    try {
      if (selectedFile) { // Jika ada gambar utama baru yang dipilih
        const formData = new FormData();
        formData.append('image', selectedFile);
        const uploadResponse = await uploadImage(formData); // Gunakan uploadImage API
        newGambarUrl = uploadResponse.imageUrl;
      }

      const updatedNews = { 
        judul, 
        deskripsi: editorContent, // Kirim konten HTML dari TinyMCE
        kategori: finalKategori,
        gambar: newGambarUrl 
      };
      await updateNews(id, updatedNews); 
      
      showMessage('Berita berhasil diperbarui!', 'success');
      fetchCategories(); // Panggil ulang untuk memperbarui dropdown kategori global
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.message || 'Gagal memperbarui berita.');
      showMessage(err.message || 'Gagal memperbarui berita.', 'error');
      console.error("Error updating news:", err);
    } finally {
      setIsSubmitting(false);
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
            {/* Mengganti Tiptap Editor dengan TinyMCE */}
            <Editor
              apiKey={tinymceApiKey} // API Key TinyMCE Anda
              onInit={(evt, editor) => editorRef.current = editor}
              initialValue={deskripsi} // Set nilai awal dari state deskripsi
              init={{
                height: 300,
                menubar: true, // Menampilkan menu bar seperti Word
                plugins: [
                  'advlist autolink lists link image charmap print preview anchor',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime media table paste code help wordcount'
                ],
                toolbar: 
                  'undo redo | formatselect | ' +
                  'bold italic backcolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,Arial,sans-serif; font-size:14px }', // Font disesuaikan
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

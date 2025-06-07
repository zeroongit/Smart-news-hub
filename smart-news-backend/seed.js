// seed.js
const mongoose = require('mongoose');
const News = require('./models/News'); // Sesuaikan path jika model News ada di direktori lain
const { v4: uuidv4 } = require('uuid'); // Import uuidv4
require('dotenv').config(); // Untuk memuat MONGODB_URI dari .env

const MONGO_URI = process.env.MONGO_URI;

// Data artikel berita yang akan di-seed (5 artikel)
const newsArticles = [
  {
    user_id: uuidv4(), 
    judul: 'Terobosan Baru AI: Diagnosis Penyakit Lebih Akurat dari Dokter',
    penulis: 'Dr. Karina Sari',
    kategori: 'Kesehatan & Teknologi',
    status: 'Public', // Artikel ini akan langsung terlihat di endpoint publik
    deskripsi: 'Sebuah sistem AI revolusioner yang dikembangkan oleh tim peneliti gabungan dari MIT dan Universitas Indonesia menunjukkan kemampuan luar biasa dalam mendiagnosis penyakit kompleks dengan tingkat akurasi hingga 98%. Sistem ini, yang dilatih menggunakan jutaan data rekam medis anonim dan gambar medis, mampu mengidentifikasi pola-pola yang luput dari pengamatan manusia. Para ahli medis menyambut baik inovasi ini sebagai alat bantu yang potensial untuk mempercepat proses diagnosis dan meningkatkan efisiensi layanan kesehatan, terutama di daerah terpencil. Namun, tetap ditekankan bahwa AI ini berfungsi sebagai pendukung, bukan pengganti peran dokter. Implementasi sistem ini diharapkan dapat dimulai pada akhir tahun 2025 setelah melalui uji klinis lebih lanjut dan persetujuan regulasi yang ketat.',
    gambar: 'https://example.com/images/ai-diagnosis-kesehatan.jpg', 
    slug: 'ai-diagnosis-penyakit-akurat',
    visitor_count: 2100
  },
  {
    user_id: uuidv4(), 
    judul: 'Inisiatif Lingkungan Global: Hutan Amazon Terus Pulih dengan Teknologi Drone',
    penulis: 'Tim Jurnalistik Lingkungan',
    kategori: 'Lingkungan',
    status: 'Public', 
    deskripsi: 'Proyek "Green Canopy 2030" yang didukung oleh PBB telah menunjukkan kemajuan signifikan dalam rehabilitasi Hutan Amazon. Menggunakan teknologi drone canggih yang dilengkapi dengan sistem penyebar benih presisi, jutaan pohon telah ditanam kembali di area yang terdampak deforestasi. Inisiatif ini tidak hanya berfokus pada penanaman, tetapi juga pada pemantauan pertumbuhan dan kesehatan ekosistem secara real-time melalui citra satelit dan sensor AI. Masyarakat adat setempat juga dilibatkan aktif dalam proses ini, menggabungkan kearifan lokal dengan inovasi modern. Keberhasilan proyek ini menjadi model bagi upaya konservasi hutan di seluruh dunia, membuktikan bahwa teknologi dapat menjadi sekutu dalam melawan perubahan iklim dan hilangnya keanekaragaman hayati. Target proyek adalah memulihkan 50% area yang rusak dalam lima tahun ke depan.',
    gambar: 'https://example.com/images/amazon-drone-lingkungan.jpg',
    slug: 'amazon-pulih-drone-teknologi',
    visitor_count: 1850
  },
  {
    user_id: uuidv4(), 
    judul: 'Ekonomi Kreatif Indonesia: Menggeliatnya UMKM Digital Lokal',
    penulis: 'Andi Perdana',
    kategori: 'Ekonomi & Bisnis',
    status: 'Public',
    deskripsi: 'Sektor ekonomi kreatif di Indonesia mengalami lonjakan pertumbuhan signifikan berkat adopsi digitalisasi oleh Usaha Mikro, Kecil, dan Menengah (UMKM). Platform e-commerce lokal, dukungan pemerintah melalui program inkubasi, dan peningkatan literasi digital telah membuka akses pasar yang lebih luas bagi produk-produk kreatif. Dari kerajinan tangan, fesyen berkelanjutan, hingga konten digital, UMKM kini mampu bersaing di kancah nasional bahkan internasional. Tantangan utama yang masih dihadapi adalah standarisasi kualitas dan akses permodalan. Artikel ini menyoroti beberapa UMKM sukses yang berhasil memanfaatkan peluang digital dan memberikan rekomendasi kebijakan untuk mendukung ekosistem ekonomi kreatif yang lebih inklusif dan berkelanjutan. Pemerintah menargetkan kontribusi ekonomi kreatif mencapai 10% dari PDB nasional pada tahun 2027.',
    gambar: 'https://example.com/images/umkm-digital-ekonomi.jpg',
    slug: 'ekonomi-kreatif-umkm-digital',
    visitor_count: 1520
  },
  {
    user_id: uuidv4(), 
    judul: 'Revolusi Pendidikan: Implementasi Kurikulum Berbasis Proyek di Sekolah',
    penulis: 'Budi Santoso, M.Pd.',
    kategori: 'Pendidikan',
    status: 'Pending', // Artikel ini perlu disetujui admin untuk bisa dilihat publik
    deskripsi: 'Transformasi pendidikan di Indonesia sedang memasuki fase baru dengan implementasi kurikulum berbasis proyek secara masif di berbagai jenjang sekolah. Pendekatan ini bertujuan untuk mengembangkan keterampilan abad ke-21 seperti pemecahan masalah, kolaborasi, dan berpikir kritis, bukan hanya hafalan materi. Siswa didorong untuk bekerja dalam tim, merancang solusi untuk masalah dunia nyata, dan mempresentasikan hasil karya mereka. Meskipun menghadapi tantangan dalam adaptasi guru dan ketersediaan fasilitas, hasil awal menunjukkan peningkatan motivasi belajar siswa dan kemampuan aplikasi pengetahuan. Artikel ini menyoroti keberhasilan beberapa sekolah percontohan dan memberikan panduan bagi sekolah lain yang ingin mengadopsi model ini. Kementerian Pendidikan menargetkan 70% sekolah menerapkan kurikulum ini dalam tiga tahun ke depan.',
    gambar: 'https://example.com/images/kurikulum-pendidikan-proyek.jpg',
    slug: 'revolusi-pendidikan-proyek',
    visitor_count: 980
  },
  {
    user_id: uuidv4(), 
    judul: 'Urban Farming: Solusi Pangan Berkelanjutan di Tengah Kepadatan Kota',
    penulis: 'Desi Lestari, Ahli Agronomi',
    kategori: 'Lingkungan & Gaya Hidup',
    status: 'Draft', // Artikel ini hanya draft, belum siap dipublikasi
    deskripsi: 'Konsep pertanian perkotaan (urban farming) semakin populer sebagai jawaban atas tantangan ketahanan pangan dan ruang hijau di kota-kota padat penduduk. Berbagai metode seperti hidroponik vertikal, aquaponik, dan kebun atap telah diterapkan di area perkotaan, memungkinkan produksi sayuran segar, buah-buahan, dan bahkan ikan di tengah lingkungan beton. Selain menyediakan sumber pangan lokal yang sehat, urban farming juga berkontribusi pada pengurangan jejak karbon, peningkatan kualitas udara, dan menciptakan ruang komunitas yang hijau. Artikel ini mengeksplorasi studi kasus sukses dari kota-kota besar, memberikan tips memulai kebun kota, dan membahas potensi dampak ekonomi dan sosialnya terhadap masyarakat urban. Inisiatif pemerintah daerah dalam mendukung urban farming juga menjadi fokus utama.',
    gambar: 'https://example.com/images/urban-farming-pangan-kota.jpg',
    slug: 'urban-farming-solusi-pangan',
    visitor_count: 730
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected for seeding');

    // Hapus semua data berita yang ada (opsional, hati-hati di lingkungan produksi)
    await News.deleteMany({});
    console.log('🗑️ Existing news data cleared.');

    // Masukkan data baru
    await News.insertMany(newsArticles);
    console.log(`✨ Successfully seeded ${newsArticles.length} news articles!`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Tutup koneksi database setelah proses seeding selesai
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected.');
  }
}

seedDatabase();
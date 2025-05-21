const mongoose = require('mongoose');
const dotenv = require('dotenv');
const News = require('./models/News');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB...');
    return seedArticles();
  })
  .catch(err => console.error('❌ MongoDB Error:', err));

async function seedArticles() {
  try {
    await News.deleteMany(); // Kosongkan koleksi terlebih dahulu (opsional)

    const articles = [
      {
        title: "AI Menguasai Dunia: Inovasi Terbaru 2025",
        excerpt: "Tahun 2025 menjadi tonggak revolusi AI dengan terobosan yang mengubah cara manusia hidup dan bekerja.",
        content: `Tahun 2025 menjadi era kebangkitan kecerdasan buatan (AI)...`,
        image: "http://localhost:5173/public/images/ai.jpg",
        author: "Redaksi Smart News",
        createdAt: new Date("2025-05-16T09:00:00.000Z")
      },
      {
        title: "Teknologi Quantum dan Masa Depan Komputasi",
        excerpt: "Quantum computing semakin dekat ke dunia nyata, dengan prosesor qubit yang mengalahkan superkomputer.",
        content: `IBM dan Google terus berlomba mempercepat pengembangan prosesor kuantum...`,
        image: "http://localhost:5173/public/images/quantum.jpg",
        author: "Yani Pratama",
        createdAt: new Date("2025-04-25T08:30:00.000Z")
      },
      {
        title: "Startup Indonesia Rebut Pasar Asia",
        excerpt: "Perusahaan rintisan Indonesia mulai merambah Asia Tenggara dengan solusi digital lokal.",
        content: `Startup fintech dan agritech dari Indonesia kini mulai dilirik oleh investor Singapura dan Thailand...`,
        image: "http://localhost:5173/public/images/startup.jpg",
        author: "Intan Mahesti",
        createdAt: new Date("2025-05-01T14:00:00.000Z")
      },
      {
        title: "Ekonomi Hijau Jadi Sorotan Dunia",
        excerpt: "Pemerintah dan sektor swasta mulai beralih ke sumber energi terbarukan demi bumi yang lebih lestari.",
        content: `Transisi menuju ekonomi hijau menjadi agenda utama dalam G20 tahun ini...`,
        image: "http://localhost:5173/public/images/green.jpeg",
        author: "Farhan R.",
        createdAt: new Date("2025-05-12T10:00:00.000Z")
      },
      {
        title: "Inovasi Medis: Robot Operasi Minim Luka",
        excerpt: "Robotik medis memungkinkan prosedur operasi yang lebih cepat, aman, dan minim luka.",
        content: `Teknologi robot dalam dunia bedah kini mampu melakukan tindakan presisi dengan sayatan mikro...`,
        image: "http://localhost:5173/public/images/robot-medis.jpg",
        author: "Dr. Surya A.",
        createdAt: new Date("2025-05-14T13:45:00.000Z")
      }
    ];

    await News.insertMany(articles);
    console.log('✅ 5 Artikel berhasil ditambahkan!');
    process.exit();
  } catch (err) {
    console.error('❌ Gagal menambahkan artikel:', err);
    process.exit(1);
  }
}

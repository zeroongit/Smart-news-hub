import React from 'react';
import { Link } from 'react-router-dom';

function NewsCard({ news }) {
  const categorySlug = news.kategori ? news.kategori.toLowerCase().replace(/\s+/g, '-') : 'uncategorized';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl">
      {news.gambar && ( 
        <img
          src={news.gambar} 
          alt={news.judul}
          className="w-full h-48 object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x200/cccccc/333333?text=Gambar+Tidak+Tersedia"; }} // Fallback
        />
      )}
      <div className="p-4">
        <span className="text-blue-600 text-xs font-semibold uppercase">
          {news.kategori || 'Umum'} 
        </span>
        <h3 className="font-bold text-xl my-2">
          {news.judul}
        </h3>
        <p className="text-gray-700 text-sm">
          {news.deskripsi && news.deskripsi.substring(0, 100)}
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Status: {news.status} | Oleh {news.penulis || 'Anonim'} 
        </p>
        <Link
          to={`/news/${categorySlug}/${news._id}`}
          className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
        >
          Baca Selengkapnya
        </Link>
      </div>
    </div>
  );
}

export default NewsCard;

import React from 'react';
import { Link } from 'react-router-dom';

function NewsCard({ news }) {
  const categorySlug = news.category ? news.category.toLowerCase().replace(/\s+/g, '-') : 'uncategorized';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl">
      {news.imageUrl && (
        <img
          src={news.imageUrl}
          alt={news.title}
          className="w-full h-48 object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x200/cccccc/333333?text=Gambar+Tidak+Tersedia"; }} 
        />
      )}
      <div className="p-4">
        <span className="text-blue-600 text-xs font-semibold uppercase">
          {news.category || 'Umum'}
        </span>
        <h3 className="font-bold text-xl my-2">
          {news.title}
        </h3>
        <p className="text-gray-700 text-sm">
          {news.content.substring(0, 100)}... 
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Status: {news.status} | Oleh {news.author ? news.author.username : 'Anonim'}
        </p>
        <Link
          to={`/news/<span class="math-inline">\{categorySlug\}/</span>{news._id}`} 
          className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
        >
          Baca Selengkapnya
        </Link>
      </div>
    </div>
  );
}

export default NewsCard;
import React from 'react';

const NewsCard = ({ item, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 hover:scale-105 duration-300 border border-gray-200"
    >
      {item.image && (
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
        <p className="text-sm text-gray-600">{item.excerpt}</p>
      </div>
    </div>
  );
};

export default NewsCard;

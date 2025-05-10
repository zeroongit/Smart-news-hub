const NewsCard = ({ item, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white p-6 rounded-xl shadow-md hover:shadow-xl border border-gray-200 transition duration-300 transform hover:-translate-y-1 hover:scale-[1.01]"
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{item.excerpt}</p>
    </div>
  );
};

export default NewsCard;

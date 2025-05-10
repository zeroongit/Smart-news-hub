import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email'); // Hapus juga email dan nama
    localStorage.removeItem('name');
    navigate('/login');
  };

  return (
    <nav className="bg-[#000212] text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="text-xl font-bold cursor-pointer" onClick={() => navigate('/home')}>
        📰 Smart News Hub
      </div>
      <ul className="flex space-x-6 text-sm sm:text-base items-center">
        <li>
          <Link to="/home" className="hover:text-sky-400">
            Beranda
          </Link>
        </li>
        {token ? (
          <>
            <li>
              <Link to="/news/create" className="hover:text-sky-400">
                Buat Artikel
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-sky-400">
                Profil
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="hover:text-red-400 focus:outline-none"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="hover:text-sky-400">
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-sky-400">
                Daftar
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;

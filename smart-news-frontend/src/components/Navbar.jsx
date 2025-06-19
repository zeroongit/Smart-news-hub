import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser, showMessage } from '../services/api'; 

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')); 
  const [menuOpen, setMenuOpen] = useState(false); // toggle menu untuk HP

  const handleLogout = () => {
    const result = logoutUser(); 
    if (result.success) {
      showMessage(result.message, 'success'); 
      navigate('/home'); 
    } else {
      showMessage(result.message, 'error'); 
      console.error(result.message);
    }
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/home" className="text-2xl font-bold">
          Smart News Hub
        </Link>

        {/* Tombol hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Menu desktop */}
        <div className="hidden lg:flex space-x-4 items-center">
          <Link to="/news" className="hover:text-gray-300">Berita</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
              <Link to="/profile" className="hover:text-gray-300">Profil</Link>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="hover:text-gray-300">Admin Dashboard</Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300">Login</Link>
              <Link to="/register" className="hover:text-gray-300">Register</Link>
            </>
          )}
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="lg:hidden bg-gray-700 px-4 py-3 space-y-2">
          <Link to="/news" className="block hover:text-gray-300">Berita</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block hover:text-gray-300">Dashboard</Link>
              <Link to="/profile" className="block hover:text-gray-300">Profil</Link>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="block hover:text-gray-300">Admin Dashboard</Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block hover:text-gray-300">Login</Link>
              <Link to="/register" className="block hover:text-gray-300">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;

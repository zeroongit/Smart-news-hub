import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser, showMessage } from '../services/api'; 

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')); 

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
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/home" className="text-2xl font-bold">
          Smart News Hub
        </Link>
        <div>
          <Link to="/news" className="mr-4 hover:text-gray-300">
            Berita
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="mr-4 hover:text-gray-300">
                Dashboard
              </Link>
              <Link to="/profile" className="mr-4 hover:text-gray-300">
                Profil
              </Link>
              {user.role === 'admin' && ( 
                <Link to="/admin/dashboard" className="mr-4 hover:text-gray-300">
                  Admin Dashboard
                </Link>
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
              <Link to="/login" className="mr-4 hover:text-gray-300">
                Login
              </Link>
              <Link to="/register" className="hover:text-gray-300">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

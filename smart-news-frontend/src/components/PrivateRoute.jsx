
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user')); // <--- PENTING: Apakah ini membaca dengan benar?

  // Debugging: Lihat apa yang dibaca oleh PrivateRoute dari localStorage
  console.log('PrivateRoute - User from localStorage:', user); 
  console.log('PrivateRoute - Is user authenticated?', !!(user && user.token));

  // Jika user ada DAN memiliki token (anggap user terotentikasi)
  if (user && user.token) {
    return children; // Izinkan akses ke children (komponen yang dilindungi)
  }

  // Jika tidak terotentikasi, arahkan ke halaman login
  return <Navigate to="/login" replace />;
};

export default PrivateRoute;
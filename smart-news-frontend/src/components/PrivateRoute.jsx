import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user')); 


  if (user && user.token) {
    return children; 
  }

  return <Navigate to="/login" replace />;
};

export default PrivateRoute;
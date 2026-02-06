import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/', { replace: true });
    }
  }, [navigate, token]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};
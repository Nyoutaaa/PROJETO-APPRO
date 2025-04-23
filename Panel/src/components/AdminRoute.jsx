import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchUsers } from '../utils/api';

export default function AdminRoute() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      
      try {
        const userData = await fetchUsers();
        const currentUser = userData.find(u => u.email === user?.email);
        setIsAdmin(currentUser?.role === 'Administrador');
      } catch (err) {
        console.error('Erro ao verificar permissões de administrador:', err);
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    };
    
    if (!loading) {
      checkAdmin();
    }
  }, [user, loading]);

  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    console.log("Usuário não tem permissão de administrador. Redirecionando para o dashboard.");
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  return <Outlet />;
} 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchCounts } from '../utils/api';
import { supabase } from '../utils/supabase';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    products: 0,
    distributors: 0,
    partners: 0,
    categories: 0
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getProfile = async () => {
      if (!user) {
        setLoadingProfile(false);
        return;
      }
      setLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, email, company, avatar_url, role')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error("Erro ao buscar perfil para dashboard:", err);
        setError("Erro ao carregar dados do perfil.");
      } finally {
        setLoadingProfile(false);
      }
    };
    getProfile();
  }, [user]);

  useEffect(() => {
    const getStats = async () => {
      setLoadingStats(true);
      try {
        const counts = await fetchCounts();
        setStats(counts); 
      } catch (err) {
         console.error("Erro ao buscar contagens para dashboard:", err);
      } finally {
         setLoadingStats(false);
      }
    };
    getStats();
  }, []);

  const formattedStats = [
    {
      title: 'Produtos Cadastrados',
      value: loadingStats ? '...' : stats.products.toString(),
      change: '', 
      isPositive: true
    },
    {
      title: 'Categorias',
      value: loadingStats ? '...' : stats.categories.toString(),
      change: '', 
      isPositive: true
    },
    {
      title: 'Distribuidores',
      value: loadingStats ? '...' : stats.distributors.toString(),
      change: '', 
      isPositive: true
    },
    {
      title: 'Parceiros',
      value: loadingStats ? '...' : stats.partners.toString(),
      change: '', 
      isPositive: true
    }
  ];

  if (loadingProfile) {
     return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }
   if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }
  if (!profile) {
    return (
       <div className="p-6">
         <p>Erro: Perfil do usuário não encontrado.</p>
       </div>
     );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">
          Bem-vindo de volta, {profile.name || 'Usuário'}!
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl text-gray-600">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nome</p>
                <p className="font-medium text-gray-800">{profile.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Empresa</p>
                <p className="font-medium text-gray-800">{profile.company || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cargo</p>
                <p className="font-medium text-gray-800">{profile?.role || '-'}</p> 
              </div>
            </div>
            <button 
              onClick={() => navigate('/perfil')}
              className="mt-4 px-3 py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              Editar Perfil
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {formattedStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-5">
            <h3 className="text-sm font-medium text-gray-500 mb-1">{stat.title}</h3>
            <p className="text-3xl font-semibold text-gray-800 mb-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/produtos/adicionar')}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
          >
            <h3 className="font-medium text-gray-900">Novo Produto</h3>
            <p className="text-sm text-gray-500 mt-1">Adicionar um novo produto ao catálogo</p>
          </button>

          <button
            onClick={() => navigate('/categorias/nova')}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
          >
            <h3 className="font-medium text-gray-900">Nova Categoria</h3>
            <p className="text-sm text-gray-500 mt-1">Criar uma nova categoria de produtos</p>
          </button>
          
          <button
            onClick={() => navigate('/distribuidores/adicionar')}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
          >
            <h3 className="font-medium text-gray-900">Novo Distribuidor</h3>
            <p className="text-sm text-gray-500 mt-1">Cadastrar um novo distribuidor</p>
          </button>
          
          <button
            onClick={() => navigate('/parceiros/adicionar')}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
          >
            <h3 className="font-medium text-gray-900">Novo Parceiro</h3>
            <p className="text-sm text-gray-500 mt-1">Adicionar um novo parceiro comercial</p>
          </button>
          
          <button
            onClick={() => navigate('/usuarios/adicionar')}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
          >
            <h3 className="font-medium text-gray-900">Novo Usuário</h3>
            <p className="text-sm text-gray-500 mt-1">Cadastrar um novo usuário do sistema</p>
          </button>
        </div>
      </div>
    </div>
  );
} 
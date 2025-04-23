import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IconSearch from '../assets/Icon_SearchProduct.svg';
import IconSino from '../assets/sino.svg';
import IconWhatsAppPlaceholder from '../assets/Icon_Contact_Black.svg';
import { useFilters } from '../context/FilterContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { fetchCategories } from '../utils/api';

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState({ name: '', avatar_url: null });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [categories, setCategories] = useState([]);

  const {
    dashboardSearchQuery,
    setDashboardSearchQuery,
    productSearchQuery,
    setProductSearchQuery,
    productFilters,
    setProductFilters,
    categorySearchQuery,
    setCategorySearchQuery,
    distribuidorSearchQuery,
    setDistribuidorSearchQuery,
    distribuidorFilters,
    setDistribuidorFilters,
    parceiroSearchQuery,
    setParceiroSearchQuery,
    userSearchQuery,
    setUserSearchQuery,
    userFilters,
    setUserFilters,
  } = useFilters();

  const profileDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);
  const notificationsDropdownRef = useRef(null);
  const notificationsButtonRef = useRef(null);

  useEffect(() => {
    const getProfileForHeader = async () => {
      if (!user) {
        setLoadingProfile(false);
        return;
      }
      setLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, avatar_url')
          .eq('id', user.id)
          .single();
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        if (data) {
          setProfileData(data);
        }
      } catch (err) {
        console.error("Erro ao buscar perfil para header:", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    getProfileForHeader();

    const loadCategories = async () => {
      try {
        const categoriesData = await fetchCategories();
        setCategories(categoriesData || []);
        console.log("[Header] Categorias carregadas:", categoriesData);
      } catch (err) {
        console.error("[Header] Erro ao carregar categorias para filtro:", err);
      }
    };
    loadCategories();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isDropdownOpen &&
        profileDropdownRef.current && 
        !profileDropdownRef.current.contains(event.target) &&
        profileButtonRef.current && 
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        isNotificationsOpen &&
        notificationsDropdownRef.current &&
        !notificationsDropdownRef.current.contains(event.target) &&
        notificationsButtonRef.current &&
        !notificationsButtonRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isNotificationsOpen]);

  const notifications = [
    { id: 1, text: 'Novo produto adicionado: Shampoo X' },
    { id: 2, text: 'Categoria Y atualizada.' },
    { id: 3, text: 'Estoque baixo para Condicionador Z' },
  ];

  const whatsappNumber = '5511999999999';

  const handleProductFilterChange = (e) => {
    const { name, value } = e.target;
    setProductFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDistribuidorFilterChange = (e) => {
    const { name, value } = e.target;
    setDistribuidorFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserFilterChange = (e) => {
    const { name, value } = e.target;
    setUserFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResetProductFilters = () => {
    setProductSearchQuery('');
    setProductFilters({ status: '', tipo: '', categoria: '' });
  };

  const handleResetDistribuidorFilters = () => {
    setDistribuidorSearchQuery('');
    setDistribuidorFilters({ plano: '' });
  };

  const handleResetParceiroFilters = () => {
    setParceiroSearchQuery('');
  };

  const handleResetUserFilters = () => {
    setUserSearchQuery('');
    setUserFilters({ cargo: '' });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderSearchAndFilters = () => {
    switch (location.pathname) {
      case '/dashboard':
        return (
          <div className="flex-1 flex items-center justify-center max-w-xl mx-auto">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Pesquisar produtos, categorias..."
                className="w-full bg-gray-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                value={dashboardSearchQuery}
                onChange={(e) => setDashboardSearchQuery(e.target.value)}
              />
              <img src={IconSearch} alt="Buscar" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"/>
            </div>
          </div>
        );
      case '/produtos':
      case '/produtos/adicionar':
        return (
          <div className="flex-1 flex items-center justify-center space-x-4 max-w-5xl mx-8">
            <div className="flex items-center space-x-2">
              <select 
                name="status"
                value={productFilters.status}
                onChange={handleProductFilterChange}
                className="bg-gray-100 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Status</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
              <select 
                name="tipo"
                value={productFilters.tipo}
                onChange={handleProductFilterChange}
                className="bg-gray-100 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tipo</option>
                <option value="Produto">Produto</option>
                <option value="Serviço">Serviço</option>
              </select>
              <select 
                name="categoria"
                value={productFilters.categoria}
                onChange={handleProductFilterChange}
                className="bg-gray-100 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 max-w-md relative">
              <input
                type="text"
                placeholder="Buscar produto por nome ou SKU"
                className="w-full bg-gray-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
              />
              <img src={IconSearch} alt="Buscar" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"/>
            </div>
            <button 
              onClick={handleResetProductFilters} 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Limpar
            </button>
          </div>
        );
      case '/categorias':
         return (
           <div className="flex-1 flex items-center justify-center space-x-4 max-w-xl mx-8">
             <div className="flex-1 max-w-xl relative">
              <input
                type="text"
                placeholder="Buscar categoria por nome"
                className="w-full bg-gray-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
              />
              <img src={IconSearch} alt="Buscar" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"/>
            </div>
          </div>
        );
      case '/distribuidores':
      case '/distribuidores/adicionar':
        return (
          <div className="flex-1 flex items-center justify-center space-x-4 max-w-5xl mx-8">
            <div className="flex items-center space-x-2">
              <select 
                name="plano"
                value={distribuidorFilters.plano}
                onChange={handleDistribuidorFilterChange}
                className="bg-gray-100 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Plano</option>
                <option value="Starter">Starter</option>
                <option value="Pro">Pro</option>
                <option value="Master">Master</option>
                <option value="Business">Business</option>
              </select>
            </div>
            <div className="flex-1 max-w-md relative">
              <input
                type="text"
                placeholder="Buscar distribuidor por nome ou email"
                className="w-full bg-gray-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                value={distribuidorSearchQuery}
                onChange={(e) => setDistribuidorSearchQuery(e.target.value)}
              />
              <img src={IconSearch} alt="Buscar" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"/>
            </div>
            <button 
              onClick={handleResetDistribuidorFilters} 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Limpar
            </button>
          </div>
        );
      case '/parceiros':
      case '/parceiros/adicionar':
        return (
          <div className="flex-1 flex items-center justify-center space-x-4 max-w-xl mx-8">
            <div className="flex-1 max-w-xl relative">
              <input
                type="text"
                placeholder="Buscar parceiro por nome ou email"
                className="w-full bg-gray-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                value={parceiroSearchQuery}
                onChange={(e) => setParceiroSearchQuery(e.target.value)}
              />
              <img src={IconSearch} alt="Buscar" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"/>
            </div>
            <button 
              onClick={handleResetParceiroFilters} 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Limpar
            </button>
          </div>
        );
      case '/usuarios':
        return (
          <div className="flex-1 flex items-center justify-center space-x-4 max-w-5xl mx-8">
            <div className="flex items-center space-x-2">
              <select 
                name="cargo"
                value={userFilters.cargo}
                onChange={handleUserFilterChange}
                className="bg-gray-100 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Cargo</option>
                <option value="Administrador">Administrador</option>
                <option value="Colaborador">Colaborador</option>
              </select>
            </div>
            <div className="flex-1 max-w-md relative">
              <input
                type="text"
                placeholder="Buscar usuário por nome ou email"
                className="w-full bg-gray-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
              />
              <img src={IconSearch} alt="Buscar" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"/>
            </div>
            <button 
              onClick={handleResetUserFilters} 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Limpar
            </button>
          </div>
        );
      default:
        return <div className="flex-1"></div>;
    }
  };

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6 relative z-40">
      {renderSearchAndFilters()}

      <div className="flex items-center space-x-4">
        <div className="relative">
          <button 
            ref={notificationsButtonRef}
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {notifications.length}
            </span>
            <img src={IconSino} alt="Notificações" className="w-6 h-6" />
          </button>
          {isNotificationsOpen && (
            <div 
              ref={notificationsDropdownRef}
              className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5 max-h-96 overflow-y-auto flex flex-col"
            >
              <div className="flex justify-between items-center px-4 py-2 border-b">
                <h3 className="text-sm font-semibold text-gray-800">Notificações</h3>
                <button 
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
              </div>
              <div className="flex-grow overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div key={notif.id} className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 border-b last:border-b-0">
                      {notif.text}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-4 text-sm text-gray-500 text-center">Nenhuma notificação nova.</div>
                )}
              </div>
            </div>
          )}
        </div>

        <a 
          href={`https://wa.me/${whatsappNumber}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="p-1 rounded-full hover:bg-gray-100"
          title="Contato via WhatsApp"
        >
          <img src={IconWhatsAppPlaceholder} alt="Contato WhatsApp" className="w-6 h-6" />
        </a>
        
        <div className="relative">
          <button 
            ref={profileButtonRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 overflow-hidden"
          >
            {!loadingProfile && profileData.avatar_url ? (
              <img src={profileData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : !loadingProfile && profileData.name ? (
              <span className="text-sm font-medium text-gray-600">{profileData.name.charAt(0).toUpperCase()}</span>
            ) : (
              <span className="text-sm font-medium text-gray-400">?</span> 
            )}
          </button>
          {isDropdownOpen && (
            <div 
              ref={profileDropdownRef}
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5 py-1 flex flex-col" 
              id="dropdown-perfil"
            >
              <button 
                  onClick={() => setIsDropdownOpen(false)}
                  className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-400"
                  aria-label="Fechar"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
              </button>
              <a href="/perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 mt-6">Editar Perfil</a>
              <button 
                onClick={handleLogout} 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
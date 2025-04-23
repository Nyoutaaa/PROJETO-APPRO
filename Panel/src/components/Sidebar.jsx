import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import IconHouse1 from '../assets/Icon_House 1.svg';
import IconHouse2 from '../assets/Icon_House 2.svg';
import IconBoxes1 from '../assets/Icon_Boxes 1.svg';
import IconBoxes2 from '../assets/Icon_Boxes 2.svg';
import CategoriaIcon1 from '../assets/categoria 1.svg';
import CategoriaIcon2 from '../assets/categoria 2.svg';
import DistribuidorIcon1 from '../assets/Distribuidor 1.svg';
import DistribuidorIcon2 from '../assets/Distribuidor 2.svg';
import ParceiroIcon1 from '../assets/Parceiro 1.svg';
import ParceiroIcon2 from '../assets/Parceiro 2.svg';
import LogoPainel from '../assets/LOGO_Painel_PG2.svg';
import LogoApppro2 from '../assets/logo 2.svg';
import IconPlus from '../assets/+.svg';
import IconPlus2 from '../assets/+2.svg';
import IconUserPlaceholder from '../assets/Icon_Contact_Black.svg';
import { useAuth } from '../context/AuthContext';
import { fetchUsers } from '../utils/api';

export default function Sidebar({ isExpanded, setIsExpanded }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      
      try {
        const userData = await fetchUsers();
        const currentUser = userData.find(u => u.email === user?.email);
        setIsAdmin(currentUser?.role === 'Administrador');
      } catch (err) {
        console.error('Erro ao verificar permissões de administrador:', err);
      }
    };
    
    checkAdmin();
  }, [user]);

  const baseMenuItems = [
    { iconDefault: IconHouse1, iconActive: IconHouse2, path: '/dashboard', label: 'Dashboard' },
    { iconDefault: IconBoxes1, iconActive: IconBoxes2, path: '/produtos', label: 'Produtos' },
    { iconDefault: CategoriaIcon1, iconActive: CategoriaIcon2, path: '/categorias', label: 'Categorias' },
    { iconDefault: DistribuidorIcon1, iconActive: DistribuidorIcon2, path: '/distribuidores', label: 'Distribuidores' },
    { iconDefault: ParceiroIcon1, iconActive: ParceiroIcon2, path: '/parceiros', label: 'Parceiros' },
  ];

  const menuItems = [...baseMenuItems];
  if (isAdmin) {
    menuItems.push({
      iconDefault: IconPlus,
      iconActive: IconPlus2,
      path: '/usuarios',
      label: 'Usuários'
    });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`${isExpanded ? 'w-56' : 'w-20'} min-h-screen bg-black flex flex-col transition-all duration-300 fixed top-0 left-0 h-screen overflow-y-auto py-4 z-50`}>
      <div className="mb-6 flex flex-col items-center space-y-4 w-full px-2">
        <img src={LogoApppro2} alt="Logo Apppro 2" className={`w-12 h-12 mx-auto`} />
        {isExpanded && <img src={LogoPainel} alt="Logo Painel" className="w-32 h-auto mt-2 mx-auto" />}
        <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-md hover:bg-gray-800 transition-colors text-white self-center">
          {isExpanded ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
        </button>
      </div>
      
      <nav className={`flex-1 flex flex-col w-full ${isExpanded ? 'px-4' : 'px-2'}`}>
        {menuItems.map((item, index) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center rounded-md transition-colors duration-200 px-4 py-2.5 mb-2 ${
              isExpanded ? 'w-full justify-start' : 'w-auto justify-center'
            } ${
              isActive(item.path)
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
            title={!isExpanded ? item.label : ''}
          >
            <img
              src={isActive(item.path) ? item.iconActive : item.iconDefault}
              alt=""
              className="w-6 h-6 flex-shrink-0"
            />
            {isExpanded && <span className="ml-4 text-sm font-medium whitespace-nowrap">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="mt-auto w-full flex justify-center p-2">
        <button
          onClick={handleLogout}
          className={`rounded-lg hover:bg-red-600 hover:text-white transition-colors text-gray-400 flex items-center px-4 py-3 ${
            isExpanded ? 'w-full justify-start' : 'w-auto justify-center'
          }`}
          title="Sair"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            <path
              d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 17L21 12L16 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 12H9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {isExpanded && <span className="ml-4 text-sm font-medium whitespace-nowrap">Sair</span>}
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IconPlusItem from '../assets/Icon_PlusItem.svg';
import UserIcon from '../assets/user.svg';
import { useFilters } from '../context/FilterContext';
import { useAuth } from '../context/AuthContext';
import { fetchUsers, deleteUser } from '../utils/api';

export default function Users() {
  const navigate = useNavigate();
  const { userSearchQuery, userFilters } = useFilters();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar se o usuário é administrador
    const checkAdmin = async () => {
      try {
        // Pode ser necessário ajustar esta lógica dependendo de como seus dados de usuário são estruturados
        const userData = await fetchUsers();
        const currentUser = userData.find(u => u.email === user?.email);
        setIsAdmin(currentUser?.role === 'Administrador');
      } catch (err) {
        console.error('Erro ao verificar permissões:', err);
      }
    };
    
    if (user) {
      checkAdmin();
    }
  }, [user]);

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUsers(userFilters, userSearchQuery);
        setUsers(data || []);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        setError('Falha ao carregar usuários. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, [userSearchQuery, userFilters]);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário? O login associado NÃO será excluído.')) {
      try {
        await deleteUser(id);
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch (err) {
        console.error('Erro ao excluir usuário (perfil):', err);
        alert(`Falha ao excluir usuário: ${err.message}`);
      }
    }
  };

  if (loading) {
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Usuários</h1>
        <p className="text-gray-600 mt-1">Visualize e gerencie todos os usuários cadastrados</p>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">
            Mostrando {users.length} usuários
          </span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm">1/1</span>
              <button className="p-1 hover:bg-gray-100 rounded">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            {isAdmin && (
              <button
                onClick={() => navigate('/usuarios/adicionar')}
                className="bg-green-600 text-white rounded-lg px-4 py-2 flex items-center space-x-2 text-sm">
                <img src={IconPlusItem} alt="Adicionar" className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Foto</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Nome</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Empresa</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Cargo</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Telefone</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((usuario) => (
                  <tr key={usuario.id} className="border-t">
                    <td className="px-4 py-3 text-sm">
                      <img 
                        src={usuario.avatar_url || UserIcon}
                        alt={`Foto de ${usuario.name}`} 
                        className="w-8 h-8 rounded-full object-cover bg-gray-200"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">{usuario.name}</td>
                    <td className="px-4 py-3 text-sm">{usuario.email}</td>
                    <td className="px-4 py-3 text-sm">{usuario.company || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        usuario.role === 'Administrador' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {usuario.role || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{usuario.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                        className="text-blue-600 text-sm hover:underline mr-4">
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(usuario.id)}
                        className="text-red-600 text-sm hover:underline">
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    {userSearchQuery || userFilters?.cargo ? 'Nenhum usuário encontrado com os filtros aplicados.' : 'Nenhum usuário cadastrado.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 
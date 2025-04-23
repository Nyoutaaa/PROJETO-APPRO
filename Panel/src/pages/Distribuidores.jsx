import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import IconPlusItem from '../assets/Icon_PlusItem.svg';
import { useFilters } from '../context/FilterContext';
import { fetchDistribuidores, deleteDistribuidor } from '../utils/api';

export default function Distribuidores() {
  const navigate = useNavigate();
  const { distribuidorSearchQuery, distribuidorFilters } = useFilters();
  
  const [distribuidores, setDistribuidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getDistribuidores = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDistribuidores(distribuidorFilters, distribuidorSearchQuery);
        setDistribuidores(data || []);
      } catch (err) {
        console.error('Erro ao buscar distribuidores:', err);
        setError('Falha ao carregar distribuidores. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    getDistribuidores();
  }, [distribuidorSearchQuery, distribuidorFilters]);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este distribuidor?')) {
      try {
        await deleteDistribuidor(id);
        setDistribuidores(prev => prev.filter(d => d.id !== id));
      } catch (err) {
        console.error('Erro ao excluir distribuidor:', err);
        alert(`Falha ao excluir distribuidor: ${err.message}`);
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
        <h1 className="text-2xl font-semibold text-gray-800">Distribuidores</h1>
        <p className="text-gray-600 mt-1">Visualize e gerencie todos os distribuidores cadastrados</p>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">
            Mostrando {distribuidores.length} distribuidores
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
            <button 
              onClick={() => navigate('/distribuidores/adicionar')}
              className="bg-green-600 text-white rounded-lg px-4 py-2 flex items-center space-x-2 text-sm">
              <img src={IconPlusItem} alt="Adicionar" className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Foto</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Nome</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Telefone</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Endereço</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Plano</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Instagram</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {distribuidores.length > 0 ? (
                distribuidores.map((distribuidor) => (
                  <tr key={distribuidor.id} className="border-t">
                    <td className="px-4 py-3 text-sm">
                      <img 
                        src={distribuidor.logo_url || '../assets/Icon_Contact_Black.svg'}
                        alt={`Logo de ${distribuidor.name}`} 
                        className="w-8 h-8 rounded-full object-cover bg-gray-200"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">{distribuidor.name}</td>
                    <td className="px-4 py-3 text-sm">{distribuidor.email}</td>
                    <td className="px-4 py-3 text-sm">{distribuidor.phone}</td>
                    <td className="px-4 py-3 text-sm">{`${distribuidor.address || ''}, ${distribuidor.cidade || ''}/${distribuidor.estado || ''}`}</td>
                    <td className="px-4 py-3 text-sm">
                      <span 
                        className={`px-2 py-1 text-xs rounded-full ${!distribuidor.plans?.background_color ? 'bg-gray-100 text-gray-800' : ''}`}
                        style={{
                          backgroundColor: distribuidor.plans?.background_color || 'transparent',
                          color: distribuidor.plans?.text_color || 'inherit'
                        }} 
                      >
                         {distribuidor.plans?.name || 'Sem plano'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        distribuidor.status === 'Ativo' ? 'bg-green-100 text-green-800' :
                        distribuidor.status === 'Inativo' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                         {distribuidor.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{distribuidor.instagram ? `@${distribuidor.instagram}` : '-'}</td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => navigate(`/distribuidores/editar/${distribuidor.id}`)}
                        className="text-blue-600 text-sm hover:underline mr-4">
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(distribuidor.id)}
                        className="text-red-600 text-sm hover:underline">
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-gray-500">
                    Nenhum distribuidor encontrado.
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
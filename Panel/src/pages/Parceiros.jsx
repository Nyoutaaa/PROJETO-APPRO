import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import IconPlusItem from '../assets/Icon_PlusItem.svg';
import { useFilters } from '../context/FilterContext';
import { fetchParceiros, deleteParceiro } from '../utils/api';

export default function Parceiros() {
  const navigate = useNavigate();
  const { parceiroSearchQuery } = useFilters();

  const [parceiros, setParceiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getParceiros = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchParceiros(parceiroSearchQuery);
        setParceiros(data || []);
      } catch (err) {
        console.error('Erro ao buscar parceiros:', err);
        setError('Falha ao carregar parceiros. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    getParceiros();
  }, [parceiroSearchQuery]);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este parceiro?')) {
      try {
        await deleteParceiro(id);
        setParceiros(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        console.error('Erro ao excluir parceiro:', err);
        alert(`Falha ao excluir parceiro: ${err.message}`);
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
        <h1 className="text-2xl font-semibold text-gray-800">Parceiros</h1>
        <p className="text-gray-600 mt-1">Visualize e gerencie todos os parceiros cadastrados</p>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">
            Mostrando {parceiros.length} parceiros
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
              onClick={() => navigate('/parceiros/adicionar')}
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
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Instagram</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {parceiros.length > 0 ? (
                parceiros.map((parceiro) => (
                  <tr key={parceiro.id} className="border-t">
                    <td className="px-4 py-3 text-sm">
                      <img 
                        src={parceiro.logo_url || '../assets/Icon_Contact_Black.svg'} 
                        alt={`Logo de ${parceiro.name}`} 
                        className="w-8 h-8 rounded-full object-cover bg-gray-200" 
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">{parceiro.name}</td>
                    <td className="px-4 py-3 text-sm">{parceiro.email}</td>
                    <td className="px-4 py-3 text-sm">{parceiro.phone}</td>
                    <td className="px-4 py-3 text-sm">{`${parceiro.address || ''}, ${parceiro.cidade || ''}/${parceiro.estado || ''}`}</td>
                    <td className="px-4 py-3 text-sm">{parceiro.instagram ? `@${parceiro.instagram}` : '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        parceiro.status === 'Ativo' ? 'bg-green-100 text-green-800' :
                        parceiro.status === 'Inativo' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                         {parceiro.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => navigate(`/parceiros/editar/${parceiro.id}`)}
                        className="text-blue-600 text-sm hover:underline mr-4">
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(parceiro.id)}
                        className="text-red-600 text-sm hover:underline">
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    Nenhum parceiro encontrado.
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
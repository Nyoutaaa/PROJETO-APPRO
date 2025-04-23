import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import IconPlusItem from '../assets/Icon_PlusItem.svg';
import { useFilters } from '../context/FilterContext';
import { fetchCategories, deleteCategory } from '../utils/api';

export default function Categories() {
  const navigate = useNavigate();
  const { categorySearchQuery } = useFilters();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCategories = async () => { 
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (fetchErr) {
        console.error('Erro detalhado ao buscar categorias via fetchCategories:', fetchErr);
        setError(`Falha ao carregar categorias: ${fetchErr.message || 'Erro desconhecido'}. Por favor, tente novamente.`);
      } finally {
        setLoading(false);
      }
    };

    getCategories();
  }, []); // Dependência vazia para rodar apenas na montagem

  // Função para excluir categoria
  const handleDeleteCategory = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await deleteCategory(id);
        setCategories(categories.filter(category => category.id !== id));
      } catch (err) {
        console.error('Erro ao excluir categoria:', err);
        alert('Falha ao excluir categoria. Por favor, tente novamente.');
      }
    }
  };

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    
    return categories.filter(category => {
      if (!categorySearchQuery) return true;
      
      const searchLower = categorySearchQuery.toLowerCase();
      const nameMatch = category.name?.toLowerCase().includes(searchLower);
      const descriptionMatch = category.description?.toLowerCase().includes(searchLower);
      return nameMatch || descriptionMatch;
    });
  }, [categories, categorySearchQuery]);

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
        <h1 className="text-2xl font-semibold text-gray-800">Categorias</h1>
        <p className="text-gray-600 mt-1">Visualize e gerencie todas as categorias cadastradas</p>
      </div>

      <div className="p-6">
          <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">
                Mostrando {filteredCategories.length} de {categories.length} no total
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
                      onClick={() => navigate('/categorias/nova')}
                      className="bg-green-600 text-white rounded-lg px-4 py-2 flex items-center space-x-2 text-sm">
                      <img src={IconPlusItem} alt="Adicionar" className="w-4 h-4" />
                      <span>Adicionar</span>
                  </button>
              </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nome
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descrição
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                          {filteredCategories.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                {categorySearchQuery 
                                  ? 'Nenhuma categoria encontrada com esse termo.' 
                                  : 'Nenhuma categoria cadastrada.'}
                              </td>
                            </tr>
                          ) : (
                            filteredCategories.map(category => (
                              <tr key={category.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {category.image_url ? (
                                      <div className="flex-shrink-0 h-10 w-10 mr-3">
                                        <img 
                                          className="h-10 w-10 rounded-full object-cover" 
                                          src={category.image_url} 
                                          alt={category.name} 
                                        />
                                      </div>
                                    ) : (
                                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                                        <span className="text-gray-500 text-xs">{category.name.substring(0, 2).toUpperCase()}</span>
                                      </div>
                                    )}
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900">
                                    {category.description ? (
                                      category.description.length > 100 
                                        ? `${category.description.substring(0, 100)}...` 
                                        : category.description
                                    ) : (
                                      <span className="text-gray-400">Sem descrição</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {category.is_active ? 'Ativo' : 'Inativo'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() => navigate(`/categorias/editar/${category.id}`)}
                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Excluir
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
    </div>
  );
} 
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import IconPlusItem from '../assets/Icon_PlusItem.svg';
import { useFilters } from '../context/FilterContext';
import { fetchProducts, deleteProduct } from '../utils/api';

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [allProductsCount, setAllProductsCount] = useState(0); // Para guardar a contagem total antes de filtrar
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Obter filtros e busca do contexto
  const { productSearchQuery, productFilters } = useFilters();

  // Buscar produtos do Supabase
  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts(productFilters, productSearchQuery);
        setProducts(data); 
        setAllProductsCount(data.length); // Atualizar contagem total também?
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        setError('Falha ao carregar produtos. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, [productFilters, productSearchQuery]); // Depender dos filtros

  // Função para formatar o preço em reais
  const formatPrice = (price) => {
    if (!price) return 'R$ 0,00';
    return `R$ ${Number(price).toFixed(2).replace('.', ',')}`;
  };

  // Função para excluir produto
  const handleDeleteProduct = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduct(id);
        // Atualiza a lista local removendo o produto
        const updatedProducts = products.filter(product => product.id !== id);
        setProducts(updatedProducts);
        setAllProductsCount(prevCount => prevCount - 1); // Atualiza contagem total
      } catch (err) {
        console.error('Erro ao excluir produto:', err);
        alert('Falha ao excluir produto. Por favor, tente novamente.');
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
        <h1 className="text-2xl font-semibold text-gray-800">Produtos/Serviços</h1>
        <p className="text-gray-600 mt-1">Visualize e gerencie todos os produtos e serviços cadastrados</p>
      </div>
      
      {/* Adicionar wrapper p-6 e barra superior */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">
            Mostrando {products.length} produtos
          </span>
          <div className="flex items-center space-x-4">
            {/* Paginação Mock */}
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
              onClick={() => navigate('/produtos/adicionar')}
              className="bg-green-600 text-white rounded-lg px-4 py-2 flex items-center space-x-2 text-sm">
              <img src={IconPlusItem} alt="Adicionar" className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </div>
        </div>

        {/* Tabela de produtos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {products.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Nenhum produto encontrado com os filtros aplicados.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      Imagem
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                           {product.main_image_url ? (
                             <img 
                               src={product.main_image_url} 
                               alt={product.name} 
                               className="h-full w-full object-cover" 
                              />
                           ) : (
                             <span className="text-gray-400 text-xs">Sem Imagem</span>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="ml-0">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.subtitle}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.categories?.name || 'Sem categoria'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.tipo || 'Sem tipo'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatPrice(product.real_price)}</div>
                        {product.promo_price && (
                          <div className="text-sm text-green-600 font-medium">{formatPrice(product.promo_price)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                           product.status?.toLowerCase() === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status || 'Indefinido'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/produtos/editar/${product.id}`)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>
    </div>
  );
} 
import React, { createContext, useState, useContext } from 'react';

// 1. Criar o Contexto
const FilterContext = createContext();

// 2. Criar o Provedor
export const FilterProvider = ({ children }) => {
  // Estado para a busca geral do Dashboard
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState('');

  // Estado para a busca de produtos e filtros
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productFilters, setProductFilters] = useState({
    status: '',
    tipo: '',
    categoria: '',
  });

  // Estado para a busca de categorias
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Estado para a busca de distribuidores e filtros
  const [distribuidorSearchQuery, setDistribuidorSearchQuery] = useState('');
  const [distribuidorFilters, setDistribuidorFilters] = useState({
    plano: '',
  });

  // Estado para a busca de parceiros
  const [parceiroSearchQuery, setParceiroSearchQuery] = useState('');

  // Estado para a busca de usuários e filtros
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilters, setUserFilters] = useState({
    cargo: '',
  });

  // Valores a serem compartilhados pelo contexto
  const value = {
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
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

// 3. Criar um Hook customizado para usar o contexto
export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}; 
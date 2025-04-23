import { supabase } from './supabase';

/**
 * Aplica filtros nas consultas de produtos no Supabase
 * @param {Object} filters - Objeto com os filtros a serem aplicados
 * @param {string} searchQuery - Termo de busca
 * @param {string} selectStatement - Select statement para a consulta
 * @returns {Promise<Array>} - Promessa que resolve para um array de produtos filtrados
 */
export const getFilteredProducts = async (filters, searchQuery, selectStatement) => {
  try {
    let query = supabase
      .from('products')
      .select(selectStatement)
      .order('name', { ascending: true });

    // Aplicar filtro de texto (busca por nome ou SKU)
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`);
    }

    // Aplicar filtros específicos
    if (filters) {
      if (filters.status) {
        // Garantir que o status seja 'Ativo' ou 'Inativo'
        const statusValue = filters.status.charAt(0).toUpperCase() + filters.status.slice(1).toLowerCase();
        if (['Ativo', 'Inativo'].includes(statusValue)) {
             query = query.eq('status', statusValue);
        }
      }
      
      if (filters.tipo && filters.tipo !== '') {
        query = query.eq('tipo', filters.tipo);
      }
      
      if (filters.categoria && filters.categoria !== '') {
        query = query.eq('category_id', filters.categoria);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }
    
    // Processar resultado para adicionar main_image_url
    const productsWithMainImage = (data || []).map(product => ({
      ...product,
      main_image_url: product.product_images?.find(img => img.is_main)?.url || null,
      product_images: undefined // Remover o array completo
    }));

    return productsWithMainImage;
  } catch (error) {
    console.error('Erro ao buscar produtos filtrados:', error);
    throw error;
  }
};

/**
 * Aplica filtros nas consultas de distribuidores no Supabase
 * @param {Object} filters - Objeto com os filtros a serem aplicados
 * @param {string} searchQuery - Termo de busca
 * @returns {Promise<Array>} - Promessa que resolve para um array de distribuidores filtrados
 */
export const getFilteredDistribuidores = async (filters, searchQuery) => {
  try {
    let query = supabase
      .from('distribuidores')
      .select(`
        id, name, email, phone, address, cidade, estado, instagram, status, logo_url,
        plans(*)
      `);

    // Aplicar filtro de texto (busca por nome ou email)
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }

    // Aplicar filtros específicos (apenas plano agora)
    if (filters && filters.plano && filters.plano !== '') {
      // Buscar o ID do plano pelo nome
      const { data: planoData, error: planError } = await supabase
        .from('plans')
        .select('id')
        .eq('name', filters.plano)
        .single();
      
      // Se der erro ao buscar plano ou não encontrar, talvez retornar vazio?
      if (planError || !planoData) {
         console.error('Erro ao buscar ID do plano ou plano não encontrado:', filters.plano, planError);
         return []; // Retorna vazio se o plano do filtro não existe
      }

      if (planoData) {
        query = query.eq('plan_id', planoData.id);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar distribuidores filtrados:', error);
    throw error;
  }
};

/**
 * Aplica filtros nas consultas de parceiros no Supabase
 * @param {string} searchQuery - Termo de busca
 * @returns {Promise<Array>} - Promessa que resolve para um array de parceiros filtrados
 */
export const getFilteredParceiros = async (searchQuery, selectStatement) => {
  // selectStatement é passado de fetchParceiros
  try {
    let query = supabase
      .from('parceiros')
      .select(selectStatement)
      .order('name', {ascending: true}); // Adicionado ordem

    // Aplicar filtro de texto (busca por nome ou email)
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar parceiros filtrados:', error);
    throw error;
  }
};

/**
 * Aplica filtros nas consultas de categorias no Supabase
 * @param {string} searchQuery - Termo de busca
 * @returns {Promise<Array>} - Promessa que resolve para um array de categorias filtradas
 */
export const getFilteredCategorias = async (searchQuery) => {
  try {
    let query = supabase
      .from('categories')
      .select('*');

    // Aplicar filtro de texto (busca por nome)
    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar categorias filtradas:', error);
    throw error;
  }
};

// Adicionar getFilteredUsers
export const getFilteredUsers = async (filters, searchQuery) => {
  try {
    let query = supabase
      .from('profiles')
      .select('id, name, email, company, role, phone, avatar_url')
      .order('name', { ascending: true });

    // Aplicar filtro de texto (busca por nome ou email)
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }

    // Aplicar filtros específicos (cargo)
    if (filters && filters.cargo && filters.cargo !== '') {
       query = query.eq('role', filters.cargo); 
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar usuários (perfis) filtrados:', error);
    throw error;
  }
}; 
import { supabase } from './supabase'
import { 
  getFilteredProducts, 
  getFilteredDistribuidores, 
  getFilteredParceiros, 
  getFilteredCategorias,
  getFilteredUsers
} from './supabaseFilters'

// Autenticação
export async function login(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Verificar se o login foi bem-sucedido
    if (!data.session) {
      throw new Error('Falha na autenticação')
    }

    // Verificar se o email foi confirmado
    const user = data.user
    if (user && !user.email_confirmed_at) {
      throw new Error('Email not confirmed. Please check your inbox.')
    }

    return {
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email
      }
    }
  } catch (error) {
    console.error('Erro de login:', error)
    throw error
  }
}

export const register = async (name, email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name
      }
    }
  })
  
  if (error) throw error
  // Supabase envia e-mail de confirmação por padrão, então precisamos explicar isso pro usuário
  return { 
    success: true,
    message: 'Verifique seu e-mail para confirmar seu cadastro. Depois disso você poderá fazer login.'
  }
}

// Produtos com filtros
export const fetchProducts = async (filters = null, searchQuery = '') => {
  try {
    // Define o select statement aqui para reutilizar
    const selectStatement = `
      id, name, subtitle, sku, status, tipo, real_price, promo_price, video_embed, button_link, created_at,
      categories ( id, name ), 
      product_images ( url, is_main ) 
    `;

    if (filters || searchQuery) {
      // Passa o select statement para a função de filtro
      return await getFilteredProducts(filters, searchQuery, selectStatement);
    } else {
      const { data, error } = await supabase
        .from('products')
        .select(selectStatement)
        .order('name', { ascending: true }); // Adicionar ordem
      
      if (error) throw error;
      
      // Filtrar para pegar apenas a imagem principal (is_main = true)
      const productsWithMainImage = data.map(product => ({
        ...product,
        main_image_url: product.product_images?.find(img => img.is_main)?.url || null,
        product_images: undefined // Remover o array completo para simplificar
      }));
      
      return productsWithMainImage;
    }
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    // Upload da imagem principal, se houver
    let mainImageUrl = null;
    if (productData.mainImage instanceof File) { // Verifica se é um arquivo
      mainImageUrl = await uploadImage(productData.mainImage, 'product-images', 'main');
    }

    // Preparar dados do produto para inserção, usando nomes corretos da tabela
    const productToInsert = {
      name: productData.name,
      subtitle: productData.subtitle,
      mini_description: productData.miniDescription, // Corrigido snake_case
      description: productData.description,
      real_price: productData.realPrice, // Já está como número
      promo_price: productData.promoPrice, // Já está como número ou null
      discount_percentage: productData.discountPercentage, // Já está como número ou null
      sku: productData.sku,
      status: productData.status, // 'Ativo' ou 'Inativo'
      category_id: productData.category_id, // <<< CORRIGIDO: Usar category_id
      tipo: productData.tipo,
      video_embed: productData.videoEmbed, // Corrigido snake_case
      button_link: productData.buttonLink, // Corrigido snake_case
    };

    // Inserir o produto
    const { data: newProductData, error } = await supabase // Renomeado para evitar conflito
      .from('products')
      .insert([productToInsert])
      .select()
      .single(); // Pega apenas o objeto criado
    
    if (error) throw error;
    if (!newProductData) throw new Error("Produto não foi criado retornou null.");

    const newProductId = newProductData.id;

    // Se tiver imagem principal, registrar na tabela product_images
    if (mainImageUrl) {
      const { error: imageError } = await supabase
        .from('product_images')
        .insert([{
          product_id: newProductId,
          url: mainImageUrl,
          is_main: true
        }])
      
      // Não lançar erro aqui, apenas logar, para não impedir a criação do produto
      if (imageError) console.error('Erro ao registrar imagem principal:', imageError); 
    }

    // Upload e registro de imagens adicionais
    if (productData.additionalImages && productData.additionalImages.length > 0) {
      for (const imageFile of productData.additionalImages) {
        if (imageFile instanceof File) { // Verifica se é um arquivo
          try {
            const imageUrl = await uploadImage(imageFile, 'product-images', 'additional');
            await supabase
              .from('product_images')
              .insert([{
                product_id: newProductId,
                url: imageUrl,
                is_main: false
              }]);
          } catch (imgError) {
            // Não lançar erro aqui, apenas logar
            console.error('Erro ao fazer upload de imagem adicional:', imgError); 
          }
        }
      }
    }

    return { success: true, data: newProductData };
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    // Adicionar mais detalhes ao erro, se possível
    const detailedError = new Error(`API Error: ${error.message}`);
    detailedError.details = error.details;
    detailedError.hint = error.hint;
    detailedError.code = error.code;
    throw detailedError;
  }
};

// Helper function to extract file path from Supabase Storage URL
const getPathFromUrl = (url) => {
  if (!url) return null;
  try {
    const urlParts = new URL(url);
    // Path usually starts after /object/public/bucket_name/
    // Example: /object/public/product-images/main/xyz.jpg -> main/xyz.jpg
    const pathSegments = urlParts.pathname.split('/');
    // Adjust index based on your bucket structure if needed
    return pathSegments.slice(4).join('/'); 
  } catch (e) {
    console.error("Error parsing URL:", e);
    return null;
  }
};

export const updateProduct = async (id, productData) => {
  console.log("[updateProduct] Iniciando. ID:", id, "Dados Recebidos:", productData);
  try {
    // 1. Atualizar dados básicos do produto (exceto imagens)
    console.log("[updateProduct] Preparando dados básicos...");
    const productToUpdate = {
      name: productData.name,
      subtitle: productData.subtitle,
      mini_description: productData.miniDescription,
      description: productData.description,
      real_price: productData.realPrice,
      promo_price: productData.promoPrice,
      discount_percentage: productData.discountPercentage,
      sku: productData.sku,
      status: productData.status,
      category_id: productData.category_id,
      tipo: productData.tipo,
      video_embed: productData.videoEmbed,
      button_link: productData.buttonLink
    };
    
    console.log("[updateProduct] Atualizando tabela products:", productToUpdate);
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(productToUpdate)
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    console.log("[updateProduct] Tabela products atualizada.");

    // 2. Buscar imagens existentes
    console.log("[updateProduct] Buscando imagens existentes...");
    const { data: existingImages, error: fetchImagesError } = await supabase
      .from('product_images')
      .select('id, url, is_main')
      .eq('product_id', id);

    if (fetchImagesError) {
      console.error("[updateProduct] Erro ao buscar imagens existentes:", fetchImagesError);
      // Continuar mesmo se falhar ao buscar imagens antigas?
    }
    console.log("[updateProduct] Imagens existentes:", existingImages);

    // 3. Lidar com Imagem Principal
    if (productData.mainImage instanceof File) {
      console.log("[updateProduct] Nova imagem principal detectada. Fazendo upload...");
      const newMainImageUrl = await uploadImage(productData.mainImage, 'product-images', 'main');
      console.log("[updateProduct] Nova URL principal:", newMainImageUrl);

      // Deletar imagem principal antiga do Storage (se existir)
      const oldMainImage = existingImages?.find(img => img.is_main);
      if (oldMainImage && oldMainImage.url) {
        const oldPath = getPathFromUrl(oldMainImage.url);
        if (oldPath) {
          console.log("[updateProduct] Deletando imagem principal antiga do Storage:", oldPath);
          await supabase.storage.from('product-images').remove([oldPath]);
        }
        // Deletar ou atualizar registro antigo no DB
        console.log("[updateProduct] Deletando registro DB da imagem principal antiga:", oldMainImage.id);
        await supabase.from('product_images').delete().eq('id', oldMainImage.id);
      }

      // Inserir novo registro da imagem principal
      console.log("[updateProduct] Inserindo registro DB da nova imagem principal.");
      const { error: insertMainError } = await supabase.from('product_images').insert([{
        product_id: id,
        url: newMainImageUrl,
        is_main: true
      }]);
      if (insertMainError) console.error("[updateProduct] Erro ao inserir nova imagem principal no DB:", insertMainError);
    }

    // 4. Lidar com Imagens Adicionais (Estratégia: Remover todas antigas, adicionar todas novas)
    if (productData.additionalImages && productData.additionalImages.length > 0 && productData.additionalImages.some(f => f instanceof File)) {
      console.log("[updateProduct] Novas imagens adicionais detectadas.");
      // Deletar imagens adicionais antigas (Storage e DB)
      const oldAdditionalImages = existingImages?.filter(img => !img.is_main) || [];
      if (oldAdditionalImages.length > 0) {
        const oldPaths = oldAdditionalImages.map(img => getPathFromUrl(img.url)).filter(p => p);
        if (oldPaths.length > 0) {
          console.log("[updateProduct] Deletando imagens adicionais antigas do Storage:", oldPaths);
          await supabase.storage.from('product-images').remove(oldPaths);
        }
        const oldIds = oldAdditionalImages.map(img => img.id);
        console.log("[updateProduct] Deletando registros DB das imagens adicionais antigas:", oldIds);
        await supabase.from('product_images').delete().in('id', oldIds);
      }

      // Fazer upload e inserir novas imagens adicionais
      console.log("[updateProduct] Fazendo upload e inserindo novas imagens adicionais...");
      for (const imageFile of productData.additionalImages) {
        if (imageFile instanceof File) {
          try {
            const imageUrl = await uploadImage(imageFile, 'product-images', 'additional');
            await supabase.from('product_images').insert([{
              product_id: id,
              url: imageUrl,
              is_main: false
            }]);
          } catch (imgError) {
            console.error('[updateProduct] Erro ao fazer upload/inserir imagem adicional:', imgError);
          }
        }
      }
    }

    console.log("[updateProduct] Atualização concluída.");
    return { success: true, data: updatedProduct };

  } catch (error) {
    console.error('Erro GERAL ao atualizar produto:', error);
    const detailedError = new Error(`API Error: ${error.message}`);
    detailedError.details = error.details;
    detailedError.hint = error.hint;
    detailedError.code = error.code;
    throw detailedError;
  }
};

export const deleteProduct = async (id) => {
  try {
    // Primeiro excluir as imagens relacionadas
    const { error: imageError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', id)
    
    if (imageError) console.error('Erro ao excluir imagens do produto:', imageError)

    // Excluir o produto
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    throw error
  }
}

// Categorias com filtros
export const fetchCategories = async (searchQuery = '') => {
  try {
    if (searchQuery) {
      return await getFilteredCategorias(searchQuery)
    } else {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
      
      if (error) throw error
      return data
    }
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    throw error
  }
}

export const createCategory = async (categoryData) => {
  try {
    const categoryToInsert = {
      name: categoryData.name,
      description: categoryData.description,
      image_url: categoryData.image_url,
      is_active: categoryData.is_active
    };
    
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryToInsert])
      .select()
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    throw error
  }
}

export const updateCategory = async (id, categoryData) => {
  try {
    // Objeto com todos os dados a serem atualizados
    const categoryToUpdate = {
      name: categoryData.name,
      description: categoryData.description,
      image_url: categoryData.image_url, // Passar a URL da imagem (nova ou antiga)
      is_active: categoryData.is_active
    };

    const { data, error } = await supabase
      .from('categories')
      .update(categoryToUpdate) // <<< CORRIGIDO: Atualizar com o objeto completo
      .eq('id', id)
      .select()
      .single(); // Retorna o objeto atualizado
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    throw error
  }
}

// Distribuidores com filtros
export const fetchDistribuidores = async (filters = null, searchQuery = '') => {
  try {
    if (filters || searchQuery) {
      return await getFilteredDistribuidores(filters, searchQuery);
    } else {
      const { data, error } = await supabase
        .from('distribuidores')
        .select(`
          id, name, email, phone, address, cidade, estado, instagram, status, logo_url, 
          plans(*)
        `)
      
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Erro ao buscar distribuidores:', error);
    throw error;
  }
};

export const createDistribuidor = async (distribuidorData) => {
   // Remover cnpj, adicionar instagram
  const { cnpj, ...dataToInsert } = distribuidorData;
  const { data, error } = await supabase
    .from('distribuidores')
    .insert([dataToInsert])
    .select()
    .single(); // Adicionar single
  
  if (error) throw error;
  return { success: true, data };
};

export const updateDistribuidor = async (id, distribuidorData) => {
  console.log("[updateDistribuidor] Iniciando. ID:", id, "Dados:", distribuidorData);
  try {
    const { logoFile, cnpj, ...dataToUpdate } = distribuidorData; // Remover cnpj do update
    let logo_url = dataToUpdate.logo_url; // Usar dataToUpdate aqui

    if (logoFile instanceof File) { 
      console.log("[updateDistribuidor] Novo logo detectado, fazendo upload...");
      logo_url = await uploadImage(logoFile, 'logos', 'distribuidores');
      console.log("[updateDistribuidor] Upload concluído:", logo_url);
      dataToUpdate.logo_url = logo_url; 
    } 
    else if (!logoFile && !dataToUpdate.logo_url) {
       dataToUpdate.logo_url = null;
    }

    console.log("[updateDistribuidor] Atualizando tabela distribuidores:", dataToUpdate);
    const { data, error } = await supabase
      .from('distribuidores')
      .update(dataToUpdate)
      .eq('id', id)
      .select(`*, plans(*)`)
      .single();
  
    if (error) throw error;
    console.log("[updateDistribuidor] Atualização bem-sucedida.");
    return { success: true, data };
  } catch (error) {
     console.error("Erro ao atualizar distribuidor:", error);
     throw error;
  }
};

export const deleteDistribuidor = async (id) => {
  const { error } = await supabase
    .from('distribuidores')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return { success: true }
}

// Parceiros com filtros
export const fetchParceiros = async (searchQuery = '') => {
  try {
    // Remover join com plans e distribuidores
    const selectStatement = 'id, name, email, phone, address, cidade, estado, status, instagram, logo_url';
    if (searchQuery) {
      return await getFilteredParceiros(searchQuery, selectStatement);
    } else {
      const { data, error } = await supabase
        .from('parceiros')
        .select(selectStatement)
        .order('name', {ascending: true}); // Adicionar ordem
      
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Erro ao buscar parceiros:', error);
    throw error;
  }
};

export const createParceiro = async (parceiroData) => {
  // Remover cnpj, plan_id, distribuidor_id do payload
  const { cnpj, plan_id, distribuidor_id, ...dataToInsert } = parceiroData;
  const { data, error } = await supabase
    .from('parceiros')
    .insert([dataToInsert])
    .select()
    .single(); // Adicionar single
  
  if (error) throw error;
  return { success: true, data };
};

export const updateParceiro = async (id, parceiroData) => {
  console.log("[updateParceiro] Iniciando. ID:", id, "Dados:", parceiroData);
  try {
    // Remover cnpj, plan_id, distribuidor_id do payload
    const { logoFile, cnpj, plan_id, distribuidor_id, ...dataToUpdate } = parceiroData;
    let logo_url = dataToUpdate.logo_url; 

    if (logoFile instanceof File) {
      console.log("[updateParceiro] Novo logo detectado, fazendo upload...");
      logo_url = await uploadImage(logoFile, 'logos', 'parceiros');
      console.log("[updateParceiro] Upload concluído:", logo_url);
      dataToUpdate.logo_url = logo_url;
    } 
    else if (!logoFile && !dataToUpdate.logo_url) {
       dataToUpdate.logo_url = null;
    }

    console.log("[updateParceiro] Atualizando tabela parceiros:", dataToUpdate);
    const { data, error } = await supabase
      .from('parceiros')
      .update(dataToUpdate)
      .eq('id', id)
      .select() // Remover select aninhado
      .single();
  
    if (error) throw error;
    console.log("[updateParceiro] Atualização bem-sucedida.");
    return { success: true, data };
  } catch (error) {
     console.error("Erro ao atualizar parceiro:", error);
     throw error;
  }
};

export const deleteParceiro = async (id) => {
  const { error } = await supabase
    .from('parceiros')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return { success: true }
}

// Perfis de Usuário
// NOTE: A atualização de senha deve ser tratada com cuidado, 
// geralmente envolvendo confirmação da senha atual ou fluxo de reset.
// Esta função foca na atualização dos dados do perfil.
export const updateProfile = async (userId, profileData) => {
  try {
    // Remove campos que não devem ir direto pro update (como senhas)
    const { currentPassword, newPassword, confirmPassword, ...dataToUpdate } = profileData;

    const { data, error } = await supabase
      .from('profiles')
      .update(dataToUpdate) // Atualiza apenas os dados do perfil (nome, empresa, fone, avatar_url)
      .eq('id', userId)
      .select();

    if (error) throw error;

    // TODO: Implementar lógica segura para atualização de senha, se necessário.
    // Exemplo (requer verificação da senha atual, idealmente no backend ou edge function):
    // if (newPassword && newPassword === confirmPassword && currentPassword) {
    //   const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
    //   if (passwordError) throw new Error(`Erro ao atualizar senha: ${passwordError.message}`);
    // }

    return { success: true, data };
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }
};

// Upload de arquivos
export const uploadImage = async (file, bucket, path) => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `${path}/${fileName}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) throw error
    
    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)
    
    return publicUrl.publicUrl
  } catch (error) {
    console.error('Erro ao fazer upload de imagem:', error)
    throw error
  }
}

// --- Funções para buscar Planos e Distribuidores --- 

export const fetchPlans = async () => {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('id, name') // Seleciona apenas ID e Nome
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar planos:", error);
    throw error;
  }
};

// Função para buscar apenas ID e Nome dos distribuidores
export const fetchDistribuidoresSimple = async () => {
  try {
    const { data, error } = await supabase
      .from('distribuidores')
      .select('id, name') // Seleciona apenas ID e Nome
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar distribuidores (simples):", error);
    throw error;
  }
};

// --- Função para atualizar senha --- 

export const updateUserPassword = async (newPassword) => {
  // ALERTA DE SEGURANÇA:
  // Esta função atualiza a senha do usuário LOGADO no momento.
  // Ela NÃO verifica a senha antiga. 
  // Para um fluxo seguro de troca de senha, você geralmente precisa:
  // 1. Verificar a senha antiga (idealmente em um backend/edge function).
  // 2. Ou usar o fluxo de reset de senha do Supabase (com envio de email).
  // Chamar esta função diretamente do frontend sem essas verificações 
  // permite que um usuário logado altere sua senha sem confirmação.
  console.warn("Chamando updateUserPassword sem verificação de senha antiga!");
  try {
    const { data, error } = await supabase.auth.updateUser({ 
      password: newPassword 
    });
    if (error) throw error;
    console.log("Senha atualizada com sucesso (Supabase Auth)", data);
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar senha (Supabase Auth):", error);
    throw error;
  }
};

// --- Funções para Usuários (Profiles) --- 

export const fetchUsers = async (filters = null, searchQuery = '') => {
  try {
    console.log("[fetchUsers] Buscando perfis... Filtros:", filters, "Busca:", searchQuery);
    // Usar filtro se houver query ou filtros
    if ((filters && filters.cargo) || searchQuery) { 
      return await getFilteredUsers(filters, searchQuery);
    } else {
      // Busca padrão sem filtros
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, company, role, phone, avatar_url') 
        .order('name', { ascending: true });

      if (error) throw error;
      console.log("[fetchUsers] Perfis encontrados (sem filtro):", data);
      return data || [];
    }
  } catch (error) {
    console.error("Erro ao buscar usuários (perfis):", error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  // ATENÇÃO: Esta função deleta APENAS o perfil do usuário na tabela `profiles`.
  // Ela NÃO deleta o usuário da autenticação (`auth.users`).
  // Deletar da auth.users requer chaves de admin e geralmente é feito no backend.
  console.warn(`[deleteUser] Deletando APENAS perfil para ID: ${userId}. Usuário em auth.users NÃO será deletado.`);
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    console.log(`[deleteUser] Perfil ${userId} deletado com sucesso.`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar usuário (perfil):", error);
    throw error;
  }
};

export const createUser = async (userData) => {
  console.log("[createUser] Iniciando criação:", userData);
  try {
    // 1. Registrar na Autenticação
    console.log("[createUser] Registrando usuário em auth.users...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password, // Senha passada aqui
      options: {
        data: {
          // Dados que podem ir para a coluna raw_user_meta_data em auth.users (opcional)
          name: userData.name,
          role: userData.role // Podemos colocar o role aqui também?
        }
      }
    });

    if (authError) throw authError;
    if (!authData || !authData.user) throw new Error('Falha ao registrar usuário na autenticação.');
    
    console.log("[createUser] Usuário registrado em auth.users:", authData.user);
    const userId = authData.user.id;

    // 2. Fazer upload do avatar, se existir
    let avatar_url = null;
    if (userData.avatarFile instanceof File) {
      console.log("[createUser] Fazendo upload do avatar...");
      try {
         avatar_url = await uploadImage(userData.avatarFile, 'avatars', 'public');
         console.log("[createUser] Upload do avatar concluído:", avatar_url);
      } catch (uploadError) {
         console.error("[createUser] Erro no upload do avatar (continuando sem avatar):", uploadError);
         // Não lançar erro aqui, apenas continuar sem avatar
      }
    }

    // 3. Inserir na tabela Profiles
    console.log("[createUser] Inserindo perfil na tabela profiles...");
    const profileToInsert = {
      id: userId, // VINCULA com o usuário da autenticação
      name: userData.name,
      email: userData.email,
      company: userData.company || null,
      role: userData.role,
      phone: userData.phone || null,
      avatar_url: avatar_url // URL do upload ou null
    };

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([profileToInsert])
      .select()
      .single();

    if (profileError) {
      // TODO: O que fazer se o perfil falhar? Idealmente deletar o usuário da auth?
      // Por agora, apenas lançar o erro.
      console.error("[createUser] Erro ao inserir perfil:", profileError);
      throw profileError;
    }

    console.log("[createUser] Perfil criado com sucesso:", profileData);
    // Retorna sucesso e talvez os dados combinados?
    return { success: true, user: authData.user, profile: profileData };

  } catch (error) {
    console.error('Erro GERAL ao criar usuário:', error);
    // Retornar a mensagem de erro específica é útil para o frontend
    const detailedError = new Error(error.message || 'Erro desconhecido ao criar usuário.');
    detailedError.details = error.details;
    detailedError.hint = error.hint;
    detailedError.code = error.code;
    throw detailedError;
  }
};

export const updateUser = async (userId, userData) => {
  // Similar a updateProfile, mas chamado de um contexto diferente
  // Não atualiza senha aqui.
  console.log("[updateUser] Iniciando atualização para ID:", userId, "Dados:", userData);
  try {
    const { avatarFile, ...dataToUpdate } = userData; 
    let avatar_url = userData.avatar_url; // Mantém URL existente

    // Upload de novo avatar
    if (avatarFile instanceof File) {
      console.log("[updateUser] Novo avatar detectado, fazendo upload...");
      // TODO: Deletar avatar antigo do storage?
      avatar_url = await uploadImage(avatarFile, 'avatars', 'public');
      console.log("[updateUser] Upload concluído:", avatar_url);
      dataToUpdate.avatar_url = avatar_url;
    } 
    else if (!avatarFile && !dataToUpdate.avatar_url) {
       dataToUpdate.avatar_url = null;
    }

    // Remover campos que não pertencem à tabela profiles (como senhas)
    delete dataToUpdate.password; 
    delete dataToUpdate.confirmPassword;

    console.log("[updateUser] Atualizando tabela profiles:", dataToUpdate);
    const { data, error } = await supabase
      .from('profiles')
      .update(dataToUpdate)
      .eq('id', userId)
      .select()
      .single();
  
    if (error) throw error;
    console.log("[updateUser] Atualização bem-sucedida.");
    return { success: true, data };
  } catch (error) {
     console.error("Erro ao atualizar usuário (perfil):", error);
     throw error;
  }
};

// --- Funções de Contagem para Dashboard ---

export const fetchCounts = async () => {
  try {
    console.log("[fetchCounts] Buscando contagens...");
    const [ 
      { count: productCount, error: pError },
      { count: distributorCount, error: dError },
      { count: partnerCount, error: paError },
      { count: categoryCount, error: cError }
    ] = await Promise.all([
      supabase.from('products').select('*' , { count: 'exact', head: true }),
      supabase.from('distribuidores').select('*' , { count: 'exact', head: true }),
      supabase.from('parceiros').select('*' , { count: 'exact', head: true }),
      supabase.from('categories').select('*' , { count: 'exact', head: true })
    ]);

    // Logar erros individuais se ocorrerem, mas tentar retornar o que funcionou
    if (pError) console.error("Erro ao contar produtos:", pError);
    if (dError) console.error("Erro ao contar distribuidores:", dError);
    if (paError) console.error("Erro ao contar parceiros:", paError);
    if (cError) console.error("Erro ao contar categorias:", cError);

    const counts = {
        products: productCount ?? 0,
        distributors: distributorCount ?? 0,
        partners: partnerCount ?? 0,
        categories: categoryCount ?? 0
    };
    console.log("[fetchCounts] Contagens obtidas:", counts);
    return counts;

  } catch (error) {
      // Captura erro geral do Promise.all se alguma promise rejeitar e não for pega individualmente
      console.error("Erro geral ao buscar contagens:", error);
      // Retornar objeto com zeros ou lançar erro?
      // Retornar zeros pode ser mais seguro para o frontend não quebrar.
      return { products: 0, distributors: 0, partners: 0, categories: 0 }; 
  }
};

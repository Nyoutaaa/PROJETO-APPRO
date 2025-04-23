import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, updateProduct, fetchProducts, fetchCategories, uploadImage } from '../utils/api';

export default function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    miniDescription: '',
    sku: '',
    tipo: 'Produto',
    category_id: '',
    status: true,
    visibility: 'todos',
    buttonColor: '',
    description: '',
    price: '',
    promotionalPrice: '',
    mainImage: null,
    additionalImages: [],
    videoEmbed: '',
    buttonLink: ''
  });

  // Carregar categorias do Supabase
  useEffect(() => {
    const loadCategories = async () => {
      console.log('[AddProduct] Iniciando busca de categorias...');
      try {
        const categoriesData = await fetchCategories();
        console.log('[AddProduct] Categorias recebidas da API:', categoriesData);
        setCategories(categoriesData || []);
      } catch (err) {
        console.error('[AddProduct] Erro ao carregar categorias:', err);
      }
    };
    
    loadCategories();
  }, []);

  // Buscar dados do produto para edição
  useEffect(() => {
    if (isEditMode) {
      const fetchProductData = async () => {
        try {
          setLoading(true);
          const products = await fetchProducts();
          const product = products.find(prod => prod.id === id);
          
          if (product) {
            setFormData({
              name: product.name || '',
              subtitle: product.subtitle || '',
              miniDescription: product.mini_description || '',
              sku: product.sku || '',
              tipo: product.tipo || 'Produto',
              category_id: product.category_id || '',
              status: product.status === 'Ativo',
              visibility: product.visibility || 'todos',
              buttonColor: product.buttonColor || '',
              description: product.description || '',
              price: product.real_price || '',
              promotionalPrice: product.promo_price || '',
              mainImage: null,
              additionalImages: [],
              videoEmbed: product.video_embed || '',
              buttonLink: product.button_link || ''
            });
          }
        } catch (err) {
          console.error('Erro ao buscar produto:', err);
          setError('Falha ao carregar dados do produto.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchProductData();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        mainImage: file
      }));
    }
  };

  const handleAdditionalImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        additionalImages: [...prev.additionalImages, ...files]
      }));
    }
  };

  const removeAdditionalImage = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // PREPARAÇÃO DOS DADOS (INDEPENDENTE DE EDITAR OU CRIAR)
      // (A lógica de upload de imagem é tratada em createProduct/updateProduct na API)
      const productData = {
        name: formData.name,
        subtitle: formData.subtitle,
        miniDescription: formData.miniDescription, 
        description: formData.description,
        realPrice: parseFloat(formData.price) || 0, 
        promoPrice: parseFloat(formData.promotionalPrice) || null, 
        discountPercentage: null, // Precisa calcular?
        sku: formData.sku,
        status: formData.status ? 'Ativo' : 'Inativo',
        category_id: formData.category_id, 
        tipo: formData.tipo, 
        videoEmbed: formData.videoEmbed, 
        buttonLink: formData.buttonLink,
        mainImage: formData.mainImage, // Passa o arquivo (ou null)
        additionalImages: formData.additionalImages // Passa o array de arquivos
      };

      console.log("Dados preparados para API:", productData);

      // Salvar ou Atualizar
      if (isEditMode) {
        console.log(`Atualizando produto ID: ${id}`);
        await updateProduct(id, productData); // Chama a função de update
        alert('Produto atualizado com sucesso!');
      } else {
        console.log('Criando novo produto...');
        await createProduct(productData); // Chama a função de create
        alert('Produto criado com sucesso!');
      }
      
      navigate('/produtos');
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      setError(`Falha ao salvar o produto: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  console.log('[AddProduct] Renderizando. Estado categories:', categories);

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            {isEditMode ? 'Editar Produto' : 'Novo Produto ou Serviço'}
          </h1>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-2">
              <p>{error}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do produto
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Ex: Liso Lambido"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtítulo
                </label>
                <input
                  type="text"
                  name="subtitle"
                  placeholder="Ex: Realinhamento Capilar"
                  value={formData.subtitle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mini Descrição
                </label>
                <textarea
                  name="miniDescription"
                  value={formData.miniDescription}
                  onChange={handleChange}
                  placeholder="Ex: Realinhamento capilar de alto desempenho"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link do Botão
                </label>
                <input
                  type="url"
                  name="buttonLink"
                  value={formData.buttonLink}
                  onChange={handleChange}
                  placeholder="Ex: https://loja.com.br/produto/liso-lambido"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Link para mais informações do produto na loja
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  placeholder="GTR23"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Produto">Produto</option>
                  <option value="Serviço">Serviço</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>Selecione uma categoria</option>
                  {Array.isArray(categories) && categories.map(category => {
                    console.log('[AddProduct] Mapeando categoria:', category);
                    return (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibilidade
                </label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value="menu_parceiros">Menu Parceiros</option>
                  <option value="catalogo_distribuidores">Catálogo Distribuidores</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Define onde este produto será exibido
                </p>
              </div>

              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-700 mr-3">
                  Status
                </label>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status}
                    onChange={handleChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    className={`toggle-label block overflow-hidden h-6 rounded-full ${
                      formData.status ? 'bg-green-400' : 'bg-gray-300'
                    } cursor-pointer`}
                  ></label>
                </div>
                <span className="text-sm text-gray-700">
                  {formData.status ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor do botão
                </label>
                <input
                  type="color"
                  name="buttonColor"
                  value={formData.buttonColor}
                  onChange={handleChange}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição do produto
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Descreva o produto..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem Principal (700x1000)
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 h-48"
                  onClick={() => document.getElementById('main-image-upload').click()}
                >
                  {formData.mainImage ? (
                    <img
                      src={URL.createObjectURL(formData.mainImage)}
                      alt="Preview da Imagem Principal"
                      className="max-h-40 object-contain"
                    />
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">Clique para adicionar (700x1000)</p>
                    </>
                  )}
                </div>
                <input
                  id="main-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A imagem deve ter dimensões de 700x1000 pixels
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vídeo (Embed Code)
                </label>
                <textarea
                  name="videoEmbed"
                  value={formData.videoEmbed}
                  onChange={handleChange}
                  placeholder="<iframe src='...'></iframe>"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cole o código de incorporação (embed) do vídeo
                </p>
              </div>

              {/* Imagens Adicionais */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagens Adicionais
                </label>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {/* Área para adicionar novas imagens */}
                  <div
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400"
                    onClick={() => document.getElementById('additional-images-upload').click()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  
                  {/* Mostra as imagens carregadas */}
                  {formData.additionalImages.map((image, index) => (
                    <div key={index} className="aspect-square relative border border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Imagem adicional ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                
                <input
                  id="additional-images-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesUpload}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor de venda
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="R$319,80"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Promocional
                </label>
                <input
                  type="number"
                  name="promotionalPrice"
                  value={formData.promotionalPrice}
                  onChange={handleChange}
                  placeholder="R$319,80"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/produtos')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none flex items-center"
              disabled={saving}
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
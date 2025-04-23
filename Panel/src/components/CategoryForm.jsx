import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCategory, updateCategory, fetchCategories, uploadImage } from '../utils/api';

export default function CategoryForm() {
  console.log("[CategoryForm] Componente montando/renderizando...");

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Buscar dados da categoria para edição
  useEffect(() => {
    console.log('[CategoryForm Edit Mode Check] id:', id, 'isEditMode:', isEditMode);
    if (isEditMode) {
      const fetchCategoryData = async () => {
        try {
          setLoading(true);
          const categories = await fetchCategories();
          const category = categories.find(cat => cat.id === id);
          
          if (category) {
            setFormData({
              name: category.name || '',
              description: category.description || '',
              is_active: category.is_active !== undefined ? category.is_active : true
            });
            
            if (category.image_url) {
              console.log("[Edit Category] Imagem existente encontrada:", category.image_url);
              setExistingImageUrl(category.image_url);
              setPreviewImage(category.image_url);
            }
          } else {
            setError('Categoria não encontrada.');
          }
        } catch (err) {
          console.error('Erro ao buscar categoria:', err);
          setError('Falha ao carregar dados da categoria.');
        } finally {
          setLoading(false);
        }
      };
      
      console.log(`[CategoryForm Edit Mode] Iniciando busca para ID: ${id}`);
      fetchCategoryData();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewImage(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      let imageUrlToSave = existingImageUrl;
      
      if (imageFile) {
        console.log("[CategoryForm] Nova imagem detectada, fazendo upload...");
        imageUrlToSave = await uploadImage(imageFile, 'categories', 'images');
        console.log("[CategoryForm] Upload concluído, nova URL:", imageUrlToSave);
      }
      
      const categoryData = {
        name: formData.name,
        description: formData.description,
        image_url: imageUrlToSave,
        is_active: formData.is_active
      };
      
      console.log("[CategoryForm] Dados para salvar:", categoryData);

      if (isEditMode) {
        console.log("[CategoryForm] Chamando updateCategory...");
        await updateCategory(id, categoryData);
        alert('Categoria atualizada com sucesso!');
      } else {
        console.log("[CategoryForm] Chamando createCategory...");
        await createCategory(categoryData);
        alert('Categoria criada com sucesso!');
      }
      
      navigate('/categorias');
    } catch (err) {
      console.error('Erro ao salvar categoria:', err);
      setError(`Falha ao salvar a categoria: ${err.message || 'Erro desconhecido'}.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            {isEditMode ? 'Editar Categoria' : 'Nova Categoria'}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? 'Atualize os dados da categoria' : 'Adicione uma nova categoria de produtos'}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Categoria
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Shampoo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva a categoria..."
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Categoria ativa
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem da categoria
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF até 2MB</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="cursor-pointer bg-blue-100 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-200 transition text-sm font-medium">
                    Escolher imagem
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    A imagem ajuda a identificar visualmente a categoria
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => navigate('/categorias')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
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
              ) : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

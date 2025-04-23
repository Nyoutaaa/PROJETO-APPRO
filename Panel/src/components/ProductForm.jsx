import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories } from '../utils/api';

export default function ProductForm() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    miniDescription: '',
    description: '',
    realPrice: '',
    promoPrice: '',
    discountPercentage: '',
    categoria_id: '',
    tipo: 'Produto',
    sku: '',
    status: 'Ativo',
    mainImage: null,
    additionalImages: [],
    videoEmbed: '',
    buttonLink: ''
  });

  // Buscar categorias do Supabase
  useEffect(() => {
    const getCategorias = async () => {
      try {
        const data = await fetchCategories();
        setCategorias(data);
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      }
    };
    
    getCategorias();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Atualiza o preço promocional e desconto quando o preço real é alterado
    if (name === 'realPrice') {
      const realPrice = parseFloat(value) || 0;
      const discountPercentage = parseFloat(formData.discountPercentage) || 0;
      const promoPrice = realPrice * (1 - discountPercentage / 100);
      
      setFormData(prev => ({
        ...prev,
        realPrice: value,
        promoPrice: promoPrice.toFixed(2)
      }));
    }
    // Atualiza o preço promocional quando o desconto é alterado
    else if (name === 'discountPercentage') {
      const realPrice = parseFloat(formData.realPrice) || 0;
      const discountPercentage = parseFloat(value) || 0;
      const promoPrice = realPrice * (1 - discountPercentage / 100);
      
      setFormData(prev => ({
        ...prev,
        discountPercentage: value,
        promoPrice: promoPrice.toFixed(2)
      }));
    }
    // Para outros campos, apenas atualiza o valor
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleMainImageUpload = (e) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você implementaria a lógica para salvar os dados no Supabase
    console.log('Dados do formulário:', formData);
    navigate('/produtos');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Adicionar Novo Produto</h1>
        <p className="text-gray-600 mt-1">Preencha os dados abaixo para cadastrar um novo produto ou serviço</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <div className="col-span-2">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Informações do Produto</h2>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Liso Lambido"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              placeholder="Ex: Realinhamento Capilar"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mini Descrição</label>
            <textarea
              name="miniDescription"
              value={formData.miniDescription}
              onChange={handleChange}
              placeholder="Ex: Realinhamento capilar de alto desempenho"
              rows="2"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU / Código Interno</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              name="categoria_id"
              value={formData.categoria_id}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>Selecione uma categoria</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>{categoria.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Produto">Produto</option>
              <option value="Serviço">Serviço</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Link do Botão</label>
            <input
              type="url"
              name="buttonLink"
              value={formData.buttonLink}
              onChange={handleChange}
              placeholder="Ex: https://loja.com.br/produto/liso-lambido"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Link para mais informações do produto na loja
            </p>
          </div>

          {/* Imagem e Vídeo */}
          <div className="col-span-2 mt-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Mídia</h2>
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
                  alt="Preview" 
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
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Cole o código de incorporação (embed) do vídeo
            </p>
          </div>

          {/* Imagens Adicionais */}
          <div className="col-span-2">
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

          {/* Preços */}
          <div className="col-span-2 mt-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Informações de Preço</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço Real (R$)</label>
            <input
              type="number"
              name="realPrice"
              value={formData.realPrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desconto (%)</label>
            <input
              type="number"
              name="discountPercentage"
              value={formData.discountPercentage}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="100"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço Promocional (R$)</label>
            <input
              type="number"
              name="promoPrice"
              value={formData.promoPrice}
              readOnly
              className="w-full p-2 border rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}

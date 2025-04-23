import React, { useState } from 'react';

const EditProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    miniDescription: '',
    sku: '',
    category: 'Serviço',
    subCategory: 'Tratamento',
    status: true,
    buttonColor: '',
    description: '',
    price: '',
    promotionalPrice: '',
    mainImage: null,
    additionalImages: [],
    videoEmbed: '',
    buttonLink: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="md:grid md:grid-cols-2 md:gap-6">
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
    </div>
  );
};

export default EditProduct; 
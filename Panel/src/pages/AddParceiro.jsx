import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Importar useParams
// Importar fetchParceiros para buscar dados no modo edição e updateParceiro
import { createParceiro, updateParceiro, uploadImage, fetchPlans, fetchDistribuidoresSimple, fetchParceiros } from '../utils/api'; 

export default function AddParceiro() {
  const navigate = useNavigate();
  const { id } = useParams(); // Pegar ID da URL
  const isEditMode = !!id; // Definir se está em modo de edição

  const [formData, setFormData] = useState({
    name: '', 
    email: '',
    phone: '', 
    address: '', 
    logo_url: null, 
    cidade: '',
    estado: '',
    status: 'Pendente',
    instagram: ''
  });
  const [logoFile, setLogoFile] = useState(null); 
  const [previewImage, setPreviewImage] = useState('');
  const [existingLogoUrl, setExistingLogoUrl] = useState(null); // Logo atual
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode); // Loading inicial em edição
  const [error, setError] = useState(null);

  // Carregar dados do Parceiro para Edição
  useEffect(() => {
    if (isEditMode) {
      const loadParceiroData = async () => {
        setLoading(true);
        setError(null);
        try {
          // Idealmente ter fetchParceiroById(id)
          console.log(`[EditParceiro] Buscando parceiro com ID: ${id}`);
          const parceirosData = await fetchParceiros(); // Busca todos
          const parceiro = parceirosData.find(p => p.id === id);
          
          if (parceiro) {
            console.log("[EditParceiro] Parceiro encontrado:", parceiro);
            setFormData({
              name: parceiro.name || '',
              email: parceiro.email || '',
              phone: parceiro.phone || '',
              address: parceiro.address || '',
              cidade: parceiro.cidade || '',
              estado: parceiro.estado || '',
              status: parceiro.status || 'Pendente',
              logo_url: parceiro.logo_url,
              instagram: parceiro.instagram || ''
            });
            if (parceiro.logo_url) {
              setExistingLogoUrl(parceiro.logo_url); // Preview inicial
            }
          } else {
             console.error(`[EditParceiro] Parceiro com ID ${id} não encontrado.`);
             setError("Parceiro não encontrado.");
          }
        } catch (err) {
          console.error("Erro ao carregar dados do parceiro:", err);
          setError("Falha ao carregar dados do parceiro.");
        } finally {
          setLoading(false);
        }
      };
      loadParceiroData();
    }
  }, [id, isEditMode]);

  // ... handleChange e handleImageChange ...
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file); 
      
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewImage(fileReader.result);
        setExistingLogoUrl(null); 
      };
      fileReader.readAsDataURL(file);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let logo_url_to_save = formData.logo_url; // Preserva URL existente
      
      if (logoFile) {
        console.log('Fazendo upload do novo logo...');
        logo_url_to_save = await uploadImage(logoFile, 'logos', 'parceiros');
        console.log('Upload do logo concluído, URL:', logo_url_to_save);
        // TODO: Deletar logo antigo do storage
      }

      // Preparar dados para API
      const parceiroData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        cidade: formData.cidade || null,
        estado: formData.estado || null,
        status: formData.status,
        logo_url: logo_url_to_save,
        instagram: formData.instagram || null
      };

      if (isEditMode) {
        console.log('Atualizando parceiro com dados:', parceiroData);
        await updateParceiro(id, parceiroData); // Chamar update
        alert('Parceiro atualizado com sucesso!');
      } else {
        console.log('Criando parceiro com dados:', parceiroData);
        await createParceiro(parceiroData); // Chamar create
        alert('Parceiro criado com sucesso!');
      }

      navigate('/parceiros');

    } catch (err) {
      console.error('Erro ao salvar parceiro:', err);
      setError(`Falha ao salvar parceiro: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
         {/* Título dinâmico */}
        <h1 className="text-2xl font-semibold text-gray-800">
           {isEditMode ? 'Editar Parceiro' : 'Adicionar Parceiro'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'Atualize os dados do parceiro' : 'Preencha os dados para cadastrar um novo parceiro'}
        </p>
      </div>

      {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
          </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna da esquerda */}
            <div className="space-y-6">
               {/* ... Inputs: name, email, phone, address ... */}
                 <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da empresa/loja *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email para contato *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone/WhatsApp *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço da loja *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={saving}
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md" disabled={saving}/>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <input type="text" name="estado" value={formData.estado} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md" disabled={saving}/>
              </div>
            </div>

            {/* Coluna da direita */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    @
                  </span>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="usuario"
                    className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={saving}
                  />
                </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                 <select name="status" value={formData.status} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md" disabled={saving}>
                   <option value="Pendente">Pendente</option>
                   <option value="Ativo">Ativo</option>
                   <option value="Inativo">Inativo</option>
                 </select>
               </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foto/Logo da loja
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border">
                     {/* Mostrar nova imagem ou logo existente */}
                     {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : existingLogoUrl ? (
                       <img src={existingLogoUrl} alt="Logo Atual" className="w-full h-full object-cover" />
                    ) : (
                       <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    )}
                  </div>
                  <label className={`cursor-pointer bg-blue-100 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-200 transition ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {existingLogoUrl || previewImage ? 'Alterar' : 'Escolher'} arquivo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={saving}
                    />
                  </label>
                </div>
              </div>

            </div>
          </div>
          {/* ... botões ... */} 
           <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/parceiros')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
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

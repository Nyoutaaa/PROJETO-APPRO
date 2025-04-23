import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createDistribuidor, updateDistribuidor, uploadImage, fetchPlans, fetchDistribuidores } from '../utils/api';

export default function AddDistribuidor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    plan_id: '',
    logo_url: null,
    cidade: '',
    estado: '',
    status: 'Pendente',
    instagram: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [existingLogoUrl, setExistingLogoUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plansData = await fetchPlans();
        setPlans(plansData || []);
      } catch (err) {
        console.error("Erro ao carregar planos:", err);
        setError("Falha ao carregar opções de plano.");
      }
    };
    loadPlans();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const loadDistribuidorData = async () => {
        setLoading(true);
        setError(null);
        try {
          console.log(`[EditDistribuidor] Buscando distribuidor com ID: ${id}`);
          const distribuidoresData = await fetchDistribuidores();
          const distribuidor = distribuidoresData.find(d => d.id === id);
          
          if (distribuidor) {
            console.log("[EditDistribuidor] Distribuidor encontrado:", distribuidor);
            setFormData({
              name: distribuidor.name || '',
              email: distribuidor.email || '',
              phone: distribuidor.phone || '',
              address: distribuidor.address || '',
              plan_id: distribuidor.plan_id || '',
              cidade: distribuidor.cidade || '',
              estado: distribuidor.estado || '',
              status: distribuidor.status || 'Pendente',
              logo_url: distribuidor.logo_url,
              instagram: distribuidor.instagram || ''
            });
            if (distribuidor.logo_url) {
              setExistingLogoUrl(distribuidor.logo_url);
            }
          } else {
             console.error(`[EditDistribuidor] Distribuidor com ID ${id} não encontrado.`);
             setError("Distribuidor não encontrado.");
          }
        } catch (err) {
          console.error("Erro ao carregar dados do distribuidor:", err);
          setError("Falha ao carregar dados do distribuidor.");
        } finally {
          setLoading(false);
        }
      };
      loadDistribuidorData();
    }
  }, [id, isEditMode]);

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

    if (!formData.plan_id) {
        setError("Por favor, selecione um plano.");
        setSaving(false);
        return;
    }

    try {
      let logo_url_to_save = formData.logo_url;
      
      if (logoFile) {
        console.log('Fazendo upload do novo logo...');
        logo_url_to_save = await uploadImage(logoFile, 'logos', 'distribuidores');
        console.log('Upload do logo concluído, URL:', logo_url_to_save);
      }

      const distribuidorData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        cidade: formData.cidade || null,
        estado: formData.estado || null,
        status: formData.status || 'Pendente',
        plan_id: formData.plan_id,
        logo_url: logo_url_to_save,
        instagram: formData.instagram || null
      };

      if (isEditMode) {
        console.log('Atualizando distribuidor com dados:', distribuidorData);
        await updateDistribuidor(id, distribuidorData);
        alert('Distribuidor atualizado com sucesso!');
      } else {
        console.log('Criando distribuidor com dados:', distribuidorData);
        await createDistribuidor(distribuidorData);
        alert('Distribuidor criado com sucesso!');
      }

      navigate('/distribuidores');

    } catch (err) {
      console.error('Erro ao salvar distribuidor:', err);
      setError(`Falha ao salvar distribuidor: ${err.message || 'Erro desconhecido'}`);
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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditMode ? 'Editar Distribuidor' : 'Adicionar Distribuidor'}
        </h1>
        <p className="text-gray-600 mt-1">
           {isEditMode ? 'Atualize os dados do distribuidor' : 'Preencha os dados para cadastrar um novo distribuidor'}
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
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo *
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
                  Email *
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
                  Endereço *
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
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plano *
                </label>
                <select
                  name="plan_id" 
                  value={formData.plan_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={saving || plans.length === 0}
                >
                  <option value="" disabled>Selecione um plano</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select name="status" value={formData.status} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md" disabled={saving}>
                  <option value="Pendente">Pendente</option>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foto/Logo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border">
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

          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/distribuidores')}
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
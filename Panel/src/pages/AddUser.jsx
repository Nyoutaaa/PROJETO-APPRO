import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import IconPlusItem from '../assets/Icon_PlusItem.svg';
import UserIcon from '../assets/user.svg';
import { createUser, updateUser, uploadImage, fetchUsers } from '../utils/api';

export default function AddUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: 'Colaborador',
    phone: '',
    password: '',
    confirmPassword: '',
    avatar_url: null
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      const loadUserData = async () => {
        console.log(`[AddUser Edit Mode] Iniciando busca para ID: ${id}`);
        setLoading(true);
        setError(null);
        try {
          const usersData = await fetchUsers();
          console.log("[AddUser Edit Mode] Todos usuários buscados:", usersData);
          const user = usersData.find(u => u.id === id);
          
          if (user) {
            console.log("[AddUser Edit Mode] Usuário encontrado:", user);
            setFormData({
              name: user.name || '',
              email: user.email || '',
              company: user.company || '',
              role: user.role || 'Colaborador',
              phone: user.phone || '',
              password: '',
              confirmPassword: '',
              avatar_url: user.avatar_url
            });
            if (user.avatar_url) {
              setProfileImage(user.avatar_url);
              console.log("[AddUser Edit Mode] Preview de imagem definido.");
            }
            console.log("[AddUser Edit Mode] Estado formData populado.");
          } else {
             console.error(`[AddUser Edit Mode] Usuário com ID ${id} não encontrado na lista.`);
             setError("Usuário não encontrado para edição.");
          }
        } catch (err) {
          console.error("[AddUser Edit Mode] Erro ao carregar dados do usuário:", err);
          setError("Falha ao carregar dados do usuário para edição.");
        } finally {
          setLoading(false);
        }
      };
      loadUserData();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    if (!isEditMode && formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem!");
      setSaving(false);
      return;
    }

    try {
       const commonUserData = {
         name: formData.name,
         email: formData.email,
         company: formData.company,
         role: formData.role,
         phone: formData.phone,
         avatarFile: profileImageFile,
         avatar_url: formData.avatar_url
       };

      if (isEditMode) {
        console.log("Atualizando usuário ID:", id, "Dados:", commonUserData);
        await updateUser(id, commonUserData);
        alert('Usuário atualizado com sucesso!');
      } else {
        const dataForCreate = {
          ...commonUserData,
          password: formData.password
        };
        console.log("Criando usuário com dados:", dataForCreate);
        await createUser(dataForCreate);
        alert('Usuário criado com sucesso! Verifique o email para confirmação (se aplicável).');
      }
      navigate('/usuarios');

    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
      setError(`Falha ao salvar usuário: ${err.message || 'Erro desconhecido'}`);
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
            {isEditMode ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
          </h1>
          <p className="text-gray-600">
             {isEditMode ? 'Atualize os dados do usuário' : 'Preencha os dados para criar um novo usuário'}
          </p>
        </div>

         {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Foto de Perfil</h2>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                 {profileImage ? (
                  <img src={profileImage} alt="Prévia Perfil" className="w-full h-full object-cover" />
                ) : (
                  <img src={UserIcon} alt="Usuário Padrão" className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <label htmlFor="profile-upload" className={`cursor-pointer px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 inline-flex items-center gap-2 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {profileImage ? 'Alterar' : 'Adicionar'} Foto
                </label>
                <input 
                    id="profile-upload" 
                    name="profile-upload" 
                    type="file" 
                    className="sr-only" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    disabled={saving}
                />
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF até 2MB</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Informações do Usuário</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={saving}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`} disabled={saving || isEditMode}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={saving}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={saving}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                 <select 
                   name="role" 
                   value={formData.role} 
                   onChange={handleChange} 
                   required 
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                   disabled={saving}
                 >
                   <option value="Colaborador">Colaborador</option>
                   <option value="Administrador">Administrador</option>
                 </select>
              </div>
            </div>
          </div>

          {!isEditMode && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Definir Senha</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={saving}/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={saving}/>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button 
                type="button" 
                onClick={() => navigate('/usuarios')} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={saving}
            >
              Cancelar
            </button>
            <button 
                type="submit" 
                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
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
               ) : (isEditMode ? 'Salvar Alterações' : 'Criar Usuário')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

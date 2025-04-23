import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile, uploadImage, updateUserPassword } from '../utils/api';
import { supabase } from '../utils/supabase';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, email, company, phone, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            name: data.name || '',
            email: data.email || '',
            company: data.company || '',
            phone: data.phone || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          if (data.avatar_url) {
            setProfileImage(data.avatar_url);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar dados do perfil:', err);
        setError('Falha ao carregar dados do perfil.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

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
    if (!user) {
      setError('Usuário não autenticado.');
      return;
    }

    setSaving(true);
    setError(null);
    setPasswordError(null);

    let passwordUpdateSuccess = false;
    let profileUpdateSuccess = false;

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setPasswordError('A nova senha e a confirmação não coincidem.');
        setSaving(false);
        return;
      }
      try {
        console.log('Tentando atualizar senha...');
        await updateUserPassword(formData.newPassword);
        console.log('Senha atualizada com sucesso na autenticação.');
        passwordUpdateSuccess = true;
      } catch (pwErr) {
        console.error('Erro ao atualizar senha:', pwErr);
        setPasswordError(`Falha ao atualizar senha: ${pwErr.message}`);
        setSaving(false);
        return;
      }
    }

    try {
      let avatar_url = profileImage;
      
      const profileData = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();
      if(profileData.data?.avatar_url && !profileImageFile) {
         avatar_url = profileData.data.avatar_url
      }
      
      if (profileImageFile) {
        console.log('Fazendo upload do novo avatar...');
        avatar_url = await uploadImage(profileImageFile, 'avatars', 'public');
        console.log('Upload concluído, URL:', avatar_url);
      }

      const profileDataToUpdate = {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        phone: formData.phone,
        avatar_url: avatar_url 
      };

      console.log('Atualizando perfil com dados:', profileDataToUpdate);
      await updateProfile(user.id, profileDataToUpdate);
      profileUpdateSuccess = true;

    } catch (profErr) {
      console.error('Erro ao salvar perfil (dados):', profErr);
      setError(`Falha ao salvar dados do perfil: ${profErr.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
      if (profileUpdateSuccess) {
         alert('Perfil atualizado com sucesso!' + (passwordUpdateSuccess ? ' Senha alterada.' : ''));
         navigate('/dashboard'); 
      } else if (passwordUpdateSuccess && !profileUpdateSuccess){
         alert('Senha alterada, mas houve falha ao salvar outros dados do perfil.');
      }
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
          <h1 className="text-2xl font-semibold text-gray-800">Editar Perfil</h1>
          <p className="text-gray-600">Atualize suas informações pessoais e foto</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        {passwordError && (
          <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-4">
            <p>{passwordError}</p>
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
                  <span className="text-3xl text-gray-500">?</span> 
                )}
              </div>
              <div>
                <label htmlFor="profile-upload" className={`cursor-pointer px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  Alterar Foto
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
            <h2 className="text-lg font-medium text-gray-800 mb-4">Informações Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Alterar Senha</h2>
            <p className="text-xs text-orange-600 mb-3">Deixe em branco para não alterar. A senha atual não é verificada.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              ) : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
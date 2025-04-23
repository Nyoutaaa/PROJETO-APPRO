import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../utils/api'
import Logo from './Logo'
import FotoLogin1 from '../assets/Foto_Login1.png'
import LogoSVG from '../assets/LOGO_Painel_PG2.svg'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    
    setLoading(true)
    setError(null)
    setMessage('')
    
    try {
      const response = await register(name, email, password)
      setSuccess(true)
      setMessage(response.message || 'Cadastro realizado com sucesso!')
      
      // Após 5 segundos, redirecione para o login
      setTimeout(() => {
        navigate('/login')
      }, 5000)
    } catch (err) {
      console.error('Erro ao realizar cadastro:', err)
      if (err.message?.includes('already registered')) {
        setError('Este e-mail já está registrado. Por favor, use outro e-mail ou faça login.')
      } else {
        setError('Não foi possível concluir o cadastro. Por favor, tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Lado esquerdo - Formulário */}
      <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col justify-center items-center bg-white min-h-[50vh] md:min-h-screen">
        <div className="w-full max-w-md">
          <div className="mb-6 md:mb-8">
            <img src={LogoSVG} className="h-12" alt="Logo" />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold mt-4 md:mt-8 mb-2">Criar Conta</h2>
          <p className="text-gray-600 mb-6">Preencha os dados abaixo para se cadastrar</p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p>{message}</p>
              <p className="text-sm mt-2">Redirecionando para a página de login em alguns segundos...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                disabled={loading || success}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="Digite seu nome completo"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading || success}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="Digite seu e-mail"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading || success}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="Crie uma senha forte"
                minLength="6"
              />
              <p className="text-xs text-gray-500 mt-1">
                A senha deve conter pelo menos 6 caracteres
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-black text-white p-3 rounded-lg font-medium hover:bg-gray-900 transition-colors text-base flex justify-center items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando...
                </>
              ) : 'Registrar'}
            </button>
          </form>

          <p className="mt-6 md:mt-8 text-center text-gray-600 text-sm md:text-base">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Faça Login
            </Link>
          </p>
        </div>
      </div>

      {/* Lado direito - Imagem */}
      <div className="w-full md:w-1/2 bg-black relative overflow-hidden min-h-[50vh] md:min-h-screen order-first md:order-last">
        <img 
          src={FotoLogin1} 
          className="absolute inset-0 w-full h-full object-cover"
          alt=""
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <h1 className="text-white text-2xl font-bold text-center">
            APPRO PAINEL ADMINISTRATIVO
          </h1>
        </div>
      </div>
    </div>
  )
}

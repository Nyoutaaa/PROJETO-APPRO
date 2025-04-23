import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signInWithEmail, resetPassword } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      await signInWithEmail(email, password);
      navigate('/menu');
    } catch (err) {
      console.error('Erro no login:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Digite seu e-mail para redefinir a senha');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      console.error('Erro ao redefinir senha:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <img 
          src="/icons/logo appro cinza.svg" 
          alt="Logo Appro" 
          className="w-40 mx-auto"
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md bg-zinc-900 rounded-2xl shadow-xl p-8"
      >
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Bem-vindo!
        </h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {resetSent && (
          <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-6">
            E-mail enviado com sucesso! Verifique sua caixa de entrada.
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition"
              placeholder="seu.email@exemplo.com"
              required
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-300">
                Senha
              </label>
              <button 
                type="button" 
                onClick={handleResetPassword}
                className="text-sm text-indigo-400 hover:text-indigo-300 focus:outline-none"
              >
                Esqueceu a senha?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Não tem uma conta?{' '}
            <Link to="/registro" className="text-indigo-400 hover:text-indigo-300">
              Registre-se
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
} 
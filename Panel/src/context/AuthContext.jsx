import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../utils/supabase'; // Importar cliente Supabase

// Criar o contexto de autenticação
const AuthContext = createContext();

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);

// Provedor do contexto de autenticação
export const AuthProvider = ({ children }) => {
  // Manter user e loading, remover isAuthenticated inicial
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // isAuthenticated será derivado da existência de user
  const isAuthenticated = !!user;

  useEffect(() => {
    setLoading(true); // Começa carregando
    console.log("[AuthContext] Verificando sessão inicial...");

    // 1. Tenta pegar a sessão ativa imediatamente
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[AuthContext] Sessão inicial checada:", session);
      setUser(session?.user ?? null);
      setLoading(false); // << IMPORTANTE: Set loading false aqui
    }).catch((error) => {
       console.error("[AuthContext] Erro ao buscar sessão inicial:", error);
       setUser(null);
       setLoading(false); // << IMPORTANTE: Set loading false aqui também
    });

    // 2. Ouvir mudanças no estado de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => { 
        console.log("[AuthContext] Evento onAuthStateChange:", event, "Session:", session);
        setUser(session?.user ?? null);
        // Não precisa mais mexer no loading aqui, a sessão inicial já tratou
        // setLoading(false); 
      }
    );

    // Limpar o listener ao desmontar
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
        console.log("[AuthContext] Listener de autenticação removido.");
      }
    };
  }, []);

  // Adicionar a função de login
  const login = async (email, password) => {
    console.log("[AuthContext] Tentando fazer login com email:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("[AuthContext] Erro ao fazer login:", error);
      throw error;
    }
    
    console.log("[AuthContext] Login bem-sucedido:", data);
    setUser(data.user);
    return data;
  };

  // Função de logout agora apenas chama o método do Supabase
  const logout = async () => {
    console.log("[AuthContext] Chamando supabase.auth.signOut()...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao fazer logout:", error);
    } else {
      setUser(null); // Limpa o estado local também
      console.log("[AuthContext] Logout bem-sucedido.");
    }
  };

  // Valor exposto pelo contexto
  const value = {
    user,
    isAuthenticated, // Derivado de user
    loading,
    login, // Adicionando a função login
    logout
  };

  console.log("[AuthContext] Renderizando Provider. Loading:", loading, "Authenticated:", isAuthenticated, "User:", user);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Inicializando conexão com Supabase:')
console.log('URL definida:', !!supabaseUrl, supabaseUrl?.substring(0, 15) + '...')
console.log('Chave definida:', !!supabaseAnonKey, supabaseAnonKey ? 'Sim' : 'Não')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO: Variáveis de ambiente do Supabase não encontradas!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 
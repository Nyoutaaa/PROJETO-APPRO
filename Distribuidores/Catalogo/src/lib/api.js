import { supabase } from './supabaseClient'

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

export async function getProductsByCategory(categorySlug) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', categorySlug)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) throw error
  return data
}

export async function getRelatedProducts(categorySlug, currentProductSlug) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', categorySlug)
    .neq('slug', currentProductSlug)
    .limit(8)
  
  if (error) throw error
  return data
}

// Funções de autenticação
export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data
}

export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
} 
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Products from './pages/Products'
import AddProduct from './pages/AddProduct'
import Dashboard from './pages/Dashboard'
import EditProfile from './pages/EditProfile'
import Categories from './pages/Categories'
import CategoryForm from './components/CategoryForm'
import Users from './pages/Users'
import AddUser from './pages/AddUser'
import Distribuidores from './pages/Distribuidores'
import AddDistribuidor from './pages/AddDistribuidor'
import Parceiros from './pages/Parceiros'
import AddParceiro from './pages/AddParceiro'
import { FilterProvider } from './context/FilterContext'
import { useAuth } from './context/AuthContext'
import { AuthProvider } from './context/AuthContext'

function App() {
  console.log("[App] Renderizando...");

  return (
    <AuthProvider>
      <FilterProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas protegidas aninhadas */}
          <Route element={<ProtectedRoute />}>
            {/* Rotas que usam o Layout */}
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/produtos" element={<Layout><Products /></Layout>} />
            <Route path="/produtos/adicionar" element={<Layout><AddProduct /></Layout>} />
            <Route path="/produtos/editar/:id" element={<Layout><AddProduct /></Layout>} />
            <Route path="/perfil" element={<Layout><EditProfile /></Layout>} />
            <Route path="/categorias" element={<Layout><Categories /></Layout>} />
            <Route path="/categorias/nova" element={<Layout><CategoryForm /></Layout>} />
            <Route path="/categorias/editar/:id" element={<Layout><CategoryForm /></Layout>} />
            <Route path="/usuarios" element={<Layout><Users /></Layout>} />
            <Route path="/distribuidores" element={<Layout><Distribuidores /></Layout>} />
            <Route path="/distribuidores/adicionar" element={<Layout><AddDistribuidor /></Layout>} />
            <Route path="/distribuidores/editar/:id" element={<Layout><AddDistribuidor /></Layout>} />
            <Route path="/parceiros" element={<Layout><Parceiros /></Layout>} />
            <Route path="/parceiros/adicionar" element={<Layout><AddParceiro /></Layout>} />
            <Route path="/parceiros/editar/:id" element={<Layout><AddParceiro /></Layout>} />
            
            {/* Rotas apenas para administradores */}
            <Route element={<AdminRoute />}>
              <Route path="/usuarios/adicionar" element={<Layout><AddUser /></Layout>} />
              <Route path="/usuarios/editar/:id" element={<Layout><AddUser /></Layout>} />
            </Route>
          </Route>
          
          {/* Rota padrão - Agora fora do ProtectedRoute, mas precisa checar auth */}
          <Route path="*" element={<AuthRedirect />} />
        </Routes>
      </FilterProvider>
    </AuthProvider>
  )
}

// Componente auxiliar para redirecionamento da rota *
function AuthRedirect() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null; // ou loading spinner
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

export default App

import React, { useEffect, useState } from 'react'
import ProductForm from './ProductForm'
import CategoryForm from './CategoryForm'
import { fetchProducts, fetchCategories } from '../utils/api'

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchProducts().then(setProducts)
    fetchCategories().then(setCategories)
  }, [])

  return (
    <div>
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl mb-2">Products</h2>
          <ProductForm />
        </div>
        <div>
          <h2 className="text-xl mb-2">Categories</h2>
          <CategoryForm />
        </div>
      </div>
    </div>
  )
}

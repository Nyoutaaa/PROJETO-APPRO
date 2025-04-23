export interface Product {
  id: number
  name: string
  short_description: string
  description: string
  category: string
  price_original: number
  price_promotional: number
  price_display: number
  images: string[]
  slug: string
  created_at: string
}

export interface Category {
  id: number
  name: string
  image: string
  slug: string
  created_at: string
} 
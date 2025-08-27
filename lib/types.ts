export interface Product {
    id: string
    name: string
    description: string | null
    price_cents: number
    original_price_cents: number | null
    image_url: string | null
    active: boolean
    created_at: string
    updated_at?: string
    ingredients?: string[]
    categories?: string[]
}

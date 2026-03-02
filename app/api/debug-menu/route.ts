import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)

    if (prodError) {
      return Response.json({
        error: 'Erro ao buscar produtos',
        details: prodError
      }, { status: 500 })
    }

    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')

    return Response.json({
      totalProducts: products?.length || 0,
      products: products || [],
      categories: categories || [],
      errors: catError ? catError.message : null
    })
  } catch (e: any) {
    return Response.json({
      error: 'Erro geral',
      message: e.message
    }, { status: 500 })
  }
}

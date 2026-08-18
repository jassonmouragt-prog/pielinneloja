import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { SiteHeader } from '@/components/site/SiteHeader'
import { SiteFooter } from '@/components/site/SiteFooter'
import { Products } from '@/components/site/Products'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/categoria/$slug')({
  params: {
    parse: (params) => ({
      slug: z.string().parse(params.slug),
    }),
  },
  component: CategoryPage,
})

function CategoryPage() {
  const { slug } = Route.useParams()
  
  // Format slug back to display name (e.g., "maquiagem" -> "Maquiagem")
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')

  const { data: categoryProducts, isLoading } = useQuery({
    queryKey: ['category-products', slug],
    queryFn: async () => {
      // Try to find by slug-ified name
      const { data: allCategories } = await supabase
        .from('categories')
        .select('id, name')

      const catData = allCategories?.find(c => 
        c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-') === slug
      )

      if (!catData) return []


      const { data: prodData } = await supabase
        .from('products')
        .select(`
          *,
          product_images(url, is_main)
        `)
        .eq('category_id', catData.id)
        .order('created_at', { ascending: false })

      return prodData || []
    }
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      
      <main className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">{categoryName}</h1>
          <div className="h-1 w-20 bg-pink mx-auto rounded-full" />
        </header>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-pink" />
          </div>
        ) : categoryProducts && categoryProducts.length > 0 ? (
          <Products products={categoryProducts} />
        ) : (
          <div className="text-center py-20 bg-cream/30 rounded-2xl border border-dashed border-pink/20">
            <p className="text-muted-foreground text-lg">
              Nenhum produto encontrado nesta categoria no momento.
            </p>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}

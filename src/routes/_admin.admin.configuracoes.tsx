import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Loader2, Save, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const categorySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  tone: z.enum(['pink', 'lilac']),
  image_url: z.string().nullable().optional(),
})



type CategoryValues = z.infer<typeof categorySchema>

export const Route = createFileRoute('/_admin/admin/configuracoes')({
  component: AdminSettingsPage,
})

function AdminSettingsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)


  const { data: categories, refetch } = useQuery({
    queryKey: ['admin-categories-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      tone: 'pink',
      image_url: null,
    },

  })

  const onSubmit = async (values: CategoryValues) => {
    setIsSubmitting(true)
    try {
      const payload: any = {
        name: values.name,
        tone: values.tone,
        image_url: values.image_url ?? null
      }

      const { error } = await supabase
        .from('categories')
        .insert([payload])
      
      if (error) throw error
      
      toast.success('Categoria adicionada com sucesso!')
      setIsDialogOpen(false)
      form.reset()
      setImagePreview(null)
      refetch()
    } catch (error: any) {
      toast.error('Erro: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `categories/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('product-images')
        .createSignedUrl(filePath, 315360000) // 10 years

      if (signedUrlError) throw signedUrlError

      form.setValue('image_url', signedUrlData.signedUrl)
      toast.success('Imagem enviada!')
    } catch (error: any) {
      toast.error('Erro no upload: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }


  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Tem certeza? Isso pode afetar produtos vinculados a esta categoria.')) return
    
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      toast.success('Categoria excluída!')
      refetch()
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as opções globais da sua loja.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Categorias */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Categorias</CardTitle>
              <CardDescription>Gerencie as categorias de produtos.</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-pink hover:bg-pink/90">
                  <Plus className="h-4 w-4 mr-1" />
                  Nova
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Categoria</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Maquiagem" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tom visual</FormLabel>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="radio" 
                                value="pink" 
                                checked={field.value === 'pink'} 
                                onChange={() => field.onChange('pink')}
                              />
                              Pink
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="radio" 
                                value="lilac" 
                                checked={field.value === 'lilac'} 
                                onChange={() => field.onChange('lilac')}
                              />
                              Lilás
                            </label>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ícone da Categoria</label>
                      <div className="flex items-center gap-4">
                        <div className={`relative flex size-20 items-center justify-center overflow-hidden rounded-full border border-dashed border-border bg-muted ${form.watch('tone') === 'pink' ? 'bg-pink/10' : 'bg-purple-100'}`}>
                          {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="h-full w-full object-contain" />
                          ) : (
                            <Upload className="size-6 text-muted-foreground" />
                          )}
                          {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Loader2 className="size-6 animate-spin text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                            className="cursor-pointer"
                          />
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            Formatos: PNG, JPG ou WEBP. Recomendado: 128x128px.
                          </p>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting} className="bg-pink">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories?.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-border ${cat.tone === 'pink' ? 'bg-pink/10' : 'bg-purple-100'}`}>
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className={`w-3 h-3 rounded-full ${cat.tone === 'pink' ? 'bg-pink' : 'bg-purple-400'}`} />
                      )}
                    </div>
                    <span className="font-medium">{cat.name}</span>
                  </div>

                  <Button variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => handleDeleteCategory(cat.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loja Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Loja</CardTitle>
            <CardDescription>Dados de contato e vendas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">WhatsApp de Vendas</label>
              <div className="flex gap-2">
                <Input defaultValue="5584994085244" readOnly className="bg-gray-50" />
              </div>
              <p className="text-[10px] text-muted-foreground italic">* O número é fixo conforme requisitos do projeto.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL do Instagram</label>
              <Input defaultValue="https://www.instagram.com/sualojinhamakeup/" readOnly className="bg-gray-50" />
            </div>
            <Button disabled className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Edit2, Trash2, AlertCircle, Loader2, Upload, X, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  subtitle: z.string().optional(),
  description: z.string().min(5, 'Descrição deve ter pelo menos 5 caracteres'),
  price: z.coerce.number().min(0.01, 'Preço deve ser maior que zero'),
  category_id: z.string().min(1, 'Selecione uma categoria'),
  stock_quantity: z.coerce.number().int().min(0, 'Estoque deve ser maior ou igual a 0'),
  status: z.enum(['active', 'inactive']),
  variations: z.array(z.object({
    name: z.string().min(1, 'Nome da variação é obrigatório'),
    options: z.array(z.string().min(1, 'Opção não pode ser vazia'))
  })).default([]),
})

type ProductFormValues = z.infer<typeof productSchema>

type ProductSearch = {
  editId?: string | undefined
}

export const Route = createFileRoute('/_admin/admin/produtos')({
  component: AdminProductsPage,
  validateSearch: (search: Record<string, unknown>): ProductSearch => {
    return {
      editId: (search['editId'] as string) || undefined,
    }
  },
})

function AdminProductsPage() {
  const { editId } = Route.useSearch()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { data: products, refetch } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(id, name),
          product_images(url, is_main)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      subtitle: '',
      description: '',
      price: 0,
      category_id: '',
      stock_quantity: 0,
      status: 'active',
      variations: [],
    },
  })

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    form.reset({
      name: product.name,
      subtitle: product.subtitle || '',
      description: product.description || '',
      price: Number(product.price),
      category_id: product.category_id,
      stock_quantity: product.stock_quantity,
      status: product.status as 'active' | 'inactive',
      variations: Array.isArray(product.variations) ? product.variations : [],
    })
    
    // Set preview if image exists
    if (product.product_images?.[0]?.url) {
      setImagePreview(product.product_images[0].url)
    } else {
      setImagePreview(null)
    }
    
    setIsDialogOpen(true)
  }

  // Handle direct navigation to edit from dashboard
  useEffect(() => {
    if (editId && products) {
      const product = products.find(p => p.id === editId)
      if (product) {
        handleEdit(product)
      }
    }
  }, [editId, products])

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      const { error } = await supabase.from('products').delete().eq('id', productToDelete)
      if (error) throw error
      toast.success('Produto excluído com sucesso!')
      setIsDeleteDialogOpen(false)
      setProductToDelete(null)
      refetch()
    } catch (error: any) {
      toast.error('Erro ao excluir produto: ' + error.message)
    }
  }

  const onSubmit = async (values: ProductFormValues) => {
    if (!imagePreview && !editingProduct) {
      toast.error('Por favor, selecione uma imagem para o produto.')
      return
    }
    
    setIsSubmitting(true)
    try {
      let productId = editingProduct?.id
      const isNew = !editingProduct

      const payload = {
        name: values.name,
        subtitle: values.subtitle || null,
        description: values.description || null,
        price: values.price,
        category_id: values.category_id || null,
        stock_quantity: values.stock_quantity,
        status: values.status,
        variations: values.variations || [],
      }

      console.log('Iniciando persistência do produto:', isNew ? 'Novo' : 'Edição', payload)

      if (editingProduct) {
        console.log('Atualizando produto existente:', productId)
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', productId)
        if (error) {
          console.error('Erro no update do produto:', error)
          throw error
        }
      } else {
        console.log('Inserindo novo produto...')
        const { data, error } = await supabase
          .from('products')
          .insert([payload])
          .select()
          .single()
        if (error) {
          console.error('Erro no insert do produto:', error)
          if (error.code === '42501') {
            throw new Error('Permissão negada ao inserir produto. Verifique se você é um administrador.')
          }
          throw error
        }
        productId = data.id
        
        // Record initial stock movement
        if (values.stock_quantity > 0) {
          const { error: stockError } = await supabase.from('stock_movements').insert([{
            product_id: productId,
            quantity: values.stock_quantity,
            type: 'in',
            notes: 'Estoque inicial'
          }])
          if (stockError) console.error('Erro ao registrar estoque inicial:', stockError)
        }
      }

      // Handle image upload if a new file is selected
      if (imageFile) {
        console.log('Iniciando upload de imagem para o produto:', productId)
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${productId}-${Date.now()}.${fileExt}`
        const filePath = `products/${fileName}`

        setUploadProgress(10)
        console.log('Tentando upload para bucket product-images, path:', filePath)
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false
          })
        setUploadProgress(70)

        if (uploadError) {
          console.error('Upload error details:', uploadError)
          let errorMsg = 'Falha ao fazer upload da imagem.'
          if (uploadError.message.includes('Permission denied') || uploadError.message.includes('42501')) {
            errorMsg = 'Permissão negada no storage. Contate o suporte.'
          }
          setUploadProgress(0)
          throw new Error(errorMsg + ' (' + (uploadError.message || 'Erro no Storage') + ')')
        }
        setUploadProgress(100)

        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('product-images')
          .createSignedUrl(filePath, 315360000) // 10 years

        if (signedUrlError) {
          console.error('Error creating signed URL:', signedUrlError)
          throw signedUrlError
        }

        const publicUrl = signedUrlData.signedUrl;

        console.log('Imagem carregada com sucesso, URL:', publicUrl)

        // Delete old image references
        const { error: deleteError } = await supabase.from('product_images').delete().eq('product_id', productId)
        if (deleteError) console.warn('Erro (não crítico) ao deletar imagens antigas:', deleteError)

        const { error: imageError } = await supabase
          .from('product_images')
          .insert([{ product_id: productId, url: publicUrl, is_main: true }])
        
        if (imageError) {
          console.error('Erro ao salvar referência da imagem no banco:', imageError)
          throw imageError
        }
      }

      toast.success(editingProduct ? 'Produto atualizado!' : 'Produto criado!')
      setIsDialogOpen(false)
      setEditingProduct(null)
      setImageFile(null)
      setImagePreview(null)
      form.reset({
        name: '',
        subtitle: '',
        description: '',
        price: 0,
        category_id: '',
        stock_quantity: 0,
        status: 'active',
        variations: [],
      })
      refetch()
    } catch (error: any) {
      console.error('Erro detalhado ao salvar produto:', error)
      let errorMessage = 'Não foi possível salvar o produto. Verifique os dados e tente novamente.'
      
      if (error.message) {
        if (error.message.includes('Permission denied') || error.code === '42501') {
          errorMessage = 'Você não tem permissão para realizar esta ação.'
        } else {
          errorMessage = error.message
        }
      }

      toast.error(errorMessage, {
        description: error.details || error.hint || undefined,
        duration: 5000
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">Gerencie seu catálogo e estoque.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setEditingProduct(null)
            form.reset()
            setImageFile(null)
            setImagePreview(null)
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-pink hover:bg-pink/90">
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
              <DialogDescription>
                Preencha as informações do produto abaixo.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Base Líquida" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtítulo / Marca</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Ruby Rose Feels" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Descrição detalhada do produto..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stock_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estoque</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name || ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="inactive">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="col-span-full space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Imagem do Produto</label>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null
                            setImageFile(file)
                            if (file) {
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                setImagePreview(reader.result as string)
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="flex h-10 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {imageFile ? 'Trocar Foto' : 'Upload Foto'}
                        </label>
                        {(imageFile || imagePreview) && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setImageFile(null)
                              setImagePreview(null)
                            }}
                            className="text-red-500"
                          >
                            <X className="mr-1 h-4 w-4" /> Remover
                          </Button>
                        )}
                      </div>
                      
                      {imagePreview && (
                        <div className="relative aspect-square w-32 overflow-hidden rounded-lg border bg-gray-50">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Enviando imagem...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div 
                        className="h-full bg-pink transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button type="submit" className="bg-pink hover:bg-pink/90" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Buscar produtos..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="hidden md:table-cell">Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                        {product.product_images?.[0]?.url && (
                          <img 
                            src={product.product_images[0].url} 
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm sm:text-base">{product.name}</span>
                        <span className="text-xs text-muted-foreground md:hidden">{product.categories?.name}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{product.categories?.name}</TableCell>
                  <TableCell>R$ {Number(product.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.stock_quantity}
                      {(product.stock_quantity ?? 0) <= 5 && (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                      {product.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500" 
                        onClick={() => {
                          setProductToDelete(product.id)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredProducts?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o produto
              de nosso catálogo e removerá os dados de estoque associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
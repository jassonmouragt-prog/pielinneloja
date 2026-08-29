import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Edit2, Trash2, AlertCircle, Loader2, Upload, X, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { useServerFn } from "@tanstack/react-start";
import { listAdminProducts, listCategories } from "@/lib/queries.queries";
import { upsertProduct, deleteProduct, listCategoriesAdmin } from "@/lib/admin/admin.queries";
import { syncProductVariations, getProductWithVariations } from "@/lib/product-variations.queries";
import { publicImageUrl } from "@/lib/storage/public-url";

const productSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  subtitle: z.string().optional(),
  description: z.string().min(5, "Descrição deve ter pelo menos 5 caracteres"),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que zero"),
  category_id: z.string().min(1, "Selecione uma categoria"),
  stock_quantity: z.coerce.number().int().min(0, "Estoque deve ser maior ou igual a 0"),
  status: z.enum(["active", "inactive"]),
  variations: z.array(
    z.object({
      name: z.string().min(1, "Nome da variação é obrigatório"),
      options: z.array(
        z.object({
          value: z.string().min(1, "Opção não pode ser vazia"),
          stock: z.number().int().min(0, "Estoque inválido"),
        }),
      ),
    }),
  ),
});

type ProductFormValues = z.infer<typeof productSchema>;

function VariationOptionInput({ onAdd }: { onAdd: (val: string) => void }) {
  const [value, setValue] = useState("");

  const handleAdd = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue("");
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Nova opção..."
        className="h-9"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
          }
        }}
      />
      <Button type="button" variant="secondary" size="sm" onClick={handleAdd}>
        Adicionar
      </Button>
    </div>
  );
}

type ProductSearch = {
  editId?: string | undefined;
};

export const Route = createFileRoute("/_admin/admin/produtos")({
  component: AdminProductsPage,
  validateSearch: (search: Record<string, unknown>): ProductSearch => {
    return {
      editId: (search["editId"] as string) || undefined,
    };
  },
});

function AdminProductsPage() {
  const { editId } = Route.useSearch();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [variationProduct, setVariationProduct] = useState<any | null>(null);
  const [isVariationDialogOpen, setIsVariationDialogOpen] = useState(false);
  const [isLoadingVariations, setIsLoadingVariations] = useState(false);
  const [isSavingVariations, setIsSavingVariations] = useState(false);
  const [activeVariations, setActiveVariations] = useState<
    Array<{ name: string; options: Array<{ value: string; stock: number }> }>
  >([]);

  const listProductsFn = useServerFn(listAdminProducts);
  const listCategoriesFn = useServerFn(listCategories);
  const upsertProductFn = useServerFn(upsertProduct);
  const deleteProductFn = useServerFn(deleteProduct);
  const syncVariationsFn = useServerFn(syncProductVariations);
  const getProductVariationsFn = useServerFn(getProductWithVariations);

  const { data: products, refetch } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => listProductsFn(),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategoriesFn(),
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      subtitle: "",
      description: "",
      price: 0,
      category_id: "",
      stock_quantity: 0,
      status: "active",
      variations: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variations",
  });

  const { fields: optionFieldsArray } = useFieldArray({
    control: form.control,
    name: "variations",
  });

  const loadProductVariations = async (productId: string) => {
    try {
      const data = await getProductVariationsFn({ data: { productId } });
      if (!data) return;
      const variationsForForm = data.variations.map((v: any) => ({
        name: v.name,
        options: v.options.map((o: any) => ({ value: o.value, stock: o.stock })),
      }));
      form.setValue("variations", variationsForForm as any);
    } catch (e) {
      console.error("Failed to load product variations", e);
    }
  };

  const handleOpenVariations = async (product: any) => {
    setVariationProduct(product);
    setIsVariationDialogOpen(true);
    setIsLoadingVariations(true);
    try {
      const data = await getProductVariationsFn({ data: { productId: product.id } });
      if (data && data.variations && data.variations.length > 0) {
        setActiveVariations(
          data.variations.map((v: any) => ({
            name: v.name,
            options: (v.options || []).map((o: any) => ({
              value: typeof o === "string" ? o : o.value,
              stock: typeof o === "object" && typeof o.stock === "number" ? o.stock : 0,
            })),
          })),
        );
      } else if (Array.isArray(product.variations) && product.variations.length > 0) {
        setActiveVariations(
          product.variations.map((v: any) => ({
            name: v.name,
            options: (v.options || []).map((o: any) => ({
              value: typeof o === "string" ? o : o.value,
              stock: typeof o === "object" && typeof o.stock === "number" ? o.stock : 0,
            })),
          })),
        );
      } else {
        setActiveVariations([]);
      }
    } catch (err) {
      console.error("Erro ao carregar variações:", err);
      toast.error("Erro ao carregar variações do produto.");
    } finally {
      setIsLoadingVariations(false);
    }
  };

  const handleSaveVariations = async () => {
    if (!variationProduct) return;
    setIsSavingVariations(true);
    try {
      const cleaned = activeVariations
        .filter((v) => v.name.trim().length > 0)
        .map((v) => ({
          name: v.name.trim(),
          options: v.options.filter((o) => o.value.trim().length > 0),
        }));

      await syncVariationsFn({
        data: {
          productId: variationProduct.id,
          variations: cleaned,
        },
      });

      toast.success("Variações e estoque atualizados com sucesso!");
      setIsVariationDialogOpen(false);
      setVariationProduct(null);
      setActiveVariations([]);
      refetch();
    } catch (error: any) {
      console.error("Erro ao salvar variações:", error);
      toast.error(error.message || "Erro ao salvar variações.");
    } finally {
      setIsSavingVariations(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      subtitle: product.subtitle || "",
      description: product.description || "",
      price: Number(product.price),
      category_id: product.categoryId || "",
      stock_quantity: product.stockQuantity,
      status: (product.status as "active" | "inactive") || "active",
      variations: [],
    });

    loadProductVariations(product.id);

    const firstImage = product.product_images?.[0]?.url;
    if (firstImage) {
      setImagePreview(publicImageUrl(firstImage));
    } else {
      setImagePreview(null);
    }

    setIsDialogOpen(true);
  };

  useEffect(() => {
    if (editId && products) {
      const product = products.find((p: any) => p.id === editId);
      if (product) {
        handleEdit(product);
      }
    }
  }, [editId, products]);

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProductFn({ data: { id: productToDelete } });
      toast.success("Produto excluído com sucesso!");
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
      refetch();
    } catch (error: any) {
      toast.error("Erro ao excluir produto: " + error.message);
    }
  };

  const onSubmit = async (values: ProductFormValues) => {
    if (!imagePreview && !editingProduct) {
      toast.error("Por favor, selecione uma imagem para o produto.");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);
    try {
      let imageBase64: string | null = null;
      let imageContentType: string | null = null;
      let imageFileName: string | null = null;
      if (imageFile) {
        const buffer = await imageFile.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, Array.from(chunk));
        }
        imageBase64 = btoa(binary);
        imageContentType = imageFile.type;
        imageFileName = imageFile.name;
        setUploadProgress(60);
      }

      const result = await upsertProductFn({
        data: {
          id: editingProduct?.id,
          name: values.name,
          subtitle: values.subtitle || null,
          description: values.description,
          price: values.price,
          categoryId: values.category_id || null,
          stockQuantity: values.stock_quantity,
          status: values.status,
          variations: values.variations || [],
          imageBase64,
          imageContentType,
          imageFileName,
        },
      });
      setUploadProgress(100);

      const finalProductId = result.id;
      if (finalProductId) {
        const variationsForSync = (values.variations || []).map((v) => ({
          name: v.name,
          options: v.options.map((o) => ({ value: o.value, stock: o.stock })),
        }));
        try {
          await syncVariationsFn({
            data: { productId: finalProductId, variations: variationsForSync },
          });
        } catch (e) {
          console.error("Failed to sync variations", e);
        }
      }

      toast.success(editingProduct ? "Produto atualizado!" : "Produto criado!");
      setIsDialogOpen(false);
      setEditingProduct(null);
      setImageFile(null);
      setImagePreview(null);
      form.reset({
        name: "",
        subtitle: "",
        description: "",
        price: 0,
        category_id: "",
        stock_quantity: 0,
        status: "active",
        variations: [],
      });
      refetch();
    } catch (error: any) {
      console.error("Erro ao salvar produto:", error);
      toast.error(error.message || "Não foi possível salvar o produto.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const filteredProducts = products?.filter((p: any) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">Gerencie seu catálogo e estoque.</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingProduct(null);
              form.reset({
                name: "",
                subtitle: "",
                description: "",
                price: 0,
                category_id: "",
                stock_quantity: 0,
                status: "active",
                variations: [],
              });
              setImageFile(null);
              setImagePreview(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-pink hover:bg-pink/90">
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
              <DialogDescription>Preencha as informações do produto abaixo.</DialogDescription>
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((cat: any) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name || ""}
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
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

                  <div className="col-span-full space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <Tag className="size-4" />
                        Variações do Produto (Ex: Cor, Tamanho, Tipo)
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ name: "", options: [] })}
                      >
                        <Plus className="size-4 mr-1" />
                        Add Variação
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {fields.map((field, vIndex) => (
                        <div
                          key={field.id}
                          className="p-4 rounded-lg border bg-muted/30 relative space-y-4"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
                            onClick={() => remove(vIndex)}
                          >
                            <X className="size-4" />
                          </Button>

                          <FormField
                            control={form.control}
                            name={`variations.${vIndex}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome da Variação (Ex: Cor)</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Nome da variação..." />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="space-y-2">
                            <Label>Opções + Estoque por opção</Label>
                            <div className="space-y-1.5 mb-2">
                              {form.watch(`variations.${vIndex}.options`)?.map((opt, oIndex) => (
                                <div
                                  key={oIndex}
                                  className="flex items-center gap-2 bg-white border rounded-md p-1.5 pr-1"
                                >
                                  <span className="text-xs flex-1 pl-1 truncate">{opt.value}</span>
                                  <div className="flex items-center gap-1">
                                    <Label className="text-[10px] text-muted-foreground">Estoque:</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      className="h-7 w-20 text-xs"
                                      value={opt.stock}
                                      onChange={(e) => {
                                        const currentOptions = form.getValues(
                                          `variations.${vIndex}.options`,
                                        );
                                        const updated = currentOptions.map((o, i) =>
                                          i === oIndex ? { ...o, stock: parseInt(e.target.value) || 0 } : o,
                                        );
                                        form.setValue(
                                          `variations.${vIndex}.options`,
                                          updated,
                                        );
                                      }}
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentOptions = form.getValues(
                                        `variations.${vIndex}.options`,
                                      );
                                      form.setValue(
                                        `variations.${vIndex}.options`,
                                        currentOptions.filter((_, i) => i !== oIndex),
                                      );
                                    }}
                                    className="text-muted-foreground hover:text-destructive px-1"
                                  >
                                    <X className="size-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <VariationOptionInput
                              onAdd={(val) => {
                                const currentOptions =
                                  form.getValues(`variations.${vIndex}.options`) || [];
                                if (!currentOptions.some((o: any) => o.value === val)) {
                                  form.setValue(`variations.${vIndex}.options`, [
                                    ...currentOptions,
                                    { value: val, stock: 0 },
                                  ]);
                                }
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-full space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Imagem do Produto
                    </label>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setImageFile(file);
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setImagePreview(reader.result as string);
                              };
                              reader.readAsDataURL(file);
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
                          {imageFile ? "Trocar Foto" : "Upload Foto"}
                        </label>
                        {(imageFile || imagePreview) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
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
                  <Button
                    type="submit"
                    className="bg-pink hover:bg-pink/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingProduct ? "Salvar Alterações" : "Criar Produto"}
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
              {filteredProducts?.map((product: any) => {
                const imageUrl = publicImageUrl(product.product_images?.[0]?.url);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          {imageUrl && (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm sm:text-base">{product.name}</span>
                          <span className="text-xs text-muted-foreground md:hidden">
                            {product.categories?.name}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.categories?.name}
                    </TableCell>
                    <TableCell>R$ {Number(product.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.stockQuantity}
                        {(product.stockQuantity ?? 0) <= 5 && (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={product.status === "active" ? "default" : "secondary"}>
                        {product.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 px-2.5 text-xs text-foreground/80 hover:text-pink hover:border-pink/40"
                          title="Gerenciar Variações"
                          onClick={() => handleOpenVariations(product)}
                        >
                          <Tag className="h-3.5 w-3.5 text-pink" />
                          <span className="hidden sm:inline">Variações</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Editar Produto"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          title="Excluir Produto"
                          onClick={() => {
                            setProductToDelete(product.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o produto de nosso
              catálogo e removerá os dados de estoque associados.
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

      {/* Modal de Edição Rápida de Variações */}
      <Dialog open={isVariationDialogOpen} onOpenChange={setIsVariationDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Tag className="size-5 text-pink" />
              Editar Variações - {variationProduct?.name}
            </DialogTitle>
            <DialogDescription>
              Adicione ou altere variações (ex: Cores, Tons, Tamanhos) e configure o estoque específico de cada opção.
            </DialogDescription>
          </DialogHeader>

          {isLoadingVariations ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-pink" />
              <p className="text-sm">Carregando variações...</p>
            </div>
          ) : (
            <div className="space-y-5 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground">
                    O estoque total do produto será sincronizado com a soma das opções:
                  </span>
                  <div className="text-sm font-semibold text-foreground">
                    Total em estoque:{" "}
                    <span className="text-pink font-bold">
                      {activeVariations.reduce(
                        (total, v) =>
                          total + v.options.reduce((sum, opt) => sum + (Number(opt.stock) || 0), 0),
                        0,
                      )}
                    </span>{" "}
                    unidades
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setActiveVariations((prev) => [...prev, { name: "", options: [] }])
                  }
                  className="gap-1.5"
                >
                  <Plus className="size-4" />
                  Novo Grupo
                </Button>
              </div>

              {activeVariations.length === 0 ? (
                <div className="p-8 text-center border border-dashed rounded-lg bg-muted/20 space-y-3">
                  <Tag className="size-8 mx-auto text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Este produto ainda não possui variações configuradas.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setActiveVariations([{ name: "Cor", options: [] }])
                    }
                  >
                    <Plus className="size-4 mr-1.5" />
                    Adicionar Primeira Variação
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeVariations.map((group, gIndex) => (
                    <div
                      key={gIndex}
                      className="p-4 rounded-xl border bg-muted/20 relative space-y-3.5"
                    >
                      <div className="flex items-center justify-between gap-3 pr-8">
                        <div className="flex-1 max-w-xs">
                          <Label className="text-xs font-semibold mb-1 block">
                            Nome da Variação (ex: Cor, Tom, Tamanho)
                          </Label>
                          <Input
                            placeholder="Ex: Cor ou Tom"
                            value={group.name}
                            onChange={(e) => {
                              const updated = [...activeVariations];
                              updated[gIndex] = { ...updated[gIndex]!, name: e.target.value };
                              setActiveVariations(updated);
                            }}
                            className="h-8 bg-white text-sm"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setActiveVariations((prev) => prev.filter((_, i) => i !== gIndex));
                          }}
                          title="Remover grupo de variação"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>

                      <div className="space-y-2 border-t pt-3">
                        <Label className="text-xs font-medium text-foreground">
                          Opções e Estoque Individual
                        </Label>

                        <div className="space-y-1.5">
                          {group.options.map((opt, oIndex) => (
                            <div
                              key={oIndex}
                              className="flex items-center gap-2 bg-white border rounded-md p-1.5 px-2.5 shadow-sm"
                            >
                              <span className="text-xs font-medium flex-1 truncate">{opt.value}</span>
                              <div className="flex items-center gap-1.5">
                                <Label className="text-[11px] text-muted-foreground whitespace-nowrap">
                                  Qtd:
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  className="h-7 w-20 text-xs text-center font-medium"
                                  value={opt.stock}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    const updated = [...activeVariations];
                                    const updatedOptions = [...(updated[gIndex]?.options || [])];
                                    updatedOptions[oIndex] = {
                                      ...updatedOptions[oIndex]!,
                                      stock: isNaN(val) ? 0 : Math.max(0, val),
                                    };
                                    updated[gIndex] = {
                                      ...updated[gIndex]!,
                                      options: updatedOptions,
                                    };
                                    setActiveVariations(updated);
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...activeVariations];
                                  const updatedOptions = (updated[gIndex]?.options || []).filter(
                                    (_, i) => i !== oIndex,
                                  );
                                  updated[gIndex] = {
                                    ...updated[gIndex]!,
                                    options: updatedOptions,
                                  };
                                  setActiveVariations(updated);
                                }}
                                className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                                title="Excluir opção"
                              >
                                <X className="size-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="pt-1">
                          <VariationOptionInput
                            onAdd={(val) => {
                              const updated = [...activeVariations];
                              const currentOptions = updated[gIndex]?.options || [];
                              if (!currentOptions.some((o) => o.value.toLowerCase() === val.toLowerCase())) {
                                updated[gIndex] = {
                                  ...updated[gIndex]!,
                                  options: [...currentOptions, { value: val, stock: 0 }],
                                };
                                setActiveVariations(updated);
                              } else {
                                toast.error(`A opção "${val}" já existe neste grupo.`);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsVariationDialogOpen(false);
                setVariationProduct(null);
              }}
              disabled={isSavingVariations}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveVariations}
              disabled={isSavingVariations || isLoadingVariations}
              className="bg-pink hover:bg-pink-dark text-white font-medium"
            >
              {isSavingVariations ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                "Salvar Variações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

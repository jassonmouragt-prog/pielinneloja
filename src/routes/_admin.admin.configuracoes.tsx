import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Loader2, Save, Upload, Pencil, AlertCircle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { resetAllSales } from "@/lib/sales.functions";
import { upsertCategory, deleteCategory, listCategoriesAdmin } from "@/lib/admin/admin.queries";
import { publicImageUrl } from "@/lib/storage/public-url";

const categorySchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  tone: z.string().min(4, "Selecione uma cor válida"),
  image_url: z.string().nullable().optional(),
});

type CategoryValues = z.infer<typeof categorySchema>;

export const Route = createFileRoute("/_admin/admin/configuracoes")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const resetSalesFn = useServerFn(resetAllSales);
  const listCategoriesAdminFn = useServerFn(listCategoriesAdmin);
  const upsertCategoryFn = useServerFn(upsertCategory);
  const deleteCategoryFn = useServerFn(deleteCategory);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const { data: categories, refetch } = useQuery({
    queryKey: ["admin-categories-settings"],
    queryFn: () => listCategoriesAdminFn(),
  });

  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      tone: "#FF69B4",
      image_url: null,
    },
  });

  const onSubmit = async (values: CategoryValues) => {
    setIsSubmitting(true);
    try {
      let imageBase64: string | null = null;
      let imageContentType: string | null = null;
      let imageFileName: string | null = null;
      if (pendingFile) {
        const buffer = await pendingFile.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, Array.from(chunk));
        }
        imageBase64 = btoa(binary);
        imageContentType = pendingFile.type;
        imageFileName = pendingFile.name;
      }

      await upsertCategoryFn({
        data: {
          id: editingCategory?.id,
          name: values.name,
          tone: values.tone,
          imageBase64,
          imageContentType,
          imageFileName,
        },
      });

      toast.success(
        editingCategory ? "Categoria atualizada com sucesso!" : "Categoria adicionada com sucesso!",
      );
      setIsDialogOpen(false);
      setEditingCategory(null);
      setPendingFile(null);
      setImagePreview(null);
      form.reset();
      refetch();
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato inválido! Use PNG, JPG ou WEBP.");
      e.target.value = "";
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("O arquivo é muito grande! O limite é 2MB.");
      e.target.value = "";
      return;
    }

    setPendingFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      tone: category.tone || "#FF69B4",
      image_url: category.imageUrl,
    });
    setImagePreview(publicImageUrl(category.imageUrl));
    setPendingFile(null);
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Tem certeza? Isso pode afetar produtos vinculados a esta categoria.")) return;
    try {
      await deleteCategoryFn({ data: { id } });
      toast.success("Categoria excluída!");
      refetch();
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message);
    }
  };

  const handleResetSales = async () => {
    setIsResetting(true);
    try {
      await resetSalesFn();
      toast.success("Todas as vendas foram zeradas com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin-sales"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-billing-stats"] });
      setIsResetDialogOpen(false);
    } catch (error: any) {
      toast.error("Erro ao zerar vendas: " + error.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as opções globais da sua loja.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Categorias</CardTitle>
              <CardDescription>Gerencie as categorias de produtos.</CardDescription>
            </div>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setEditingCategory(null);
                  form.reset({ name: "", tone: "#FF69B4", image_url: null });
                  setImagePreview(null);
                  setPendingFile(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm" className="bg-pink hover:bg-pink/90">
                  <Plus className="h-4 w-4 mr-1" />
                  Nova
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] sm:max-w-md max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                  </DialogTitle>
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
                          <FormLabel>Cor da Categoria (RGB)</FormLabel>
                          <div className="flex items-center gap-3">
                            <FormControl>
                              <Input
                                type="color"
                                {...field}
                                className="w-12 h-10 p-1 cursor-pointer"
                              />
                            </FormControl>
                            <Input
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              placeholder="#000000"
                              className="font-mono"
                            />
                            <div
                              className="w-10 h-10 rounded border"
                              style={{ backgroundColor: field.value }}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ícone da Categoria</label>
                      <div className="flex items-center gap-4">
                        <div
                          className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border border-dashed border-border transition-colors"
                          style={{ backgroundColor: `${form.watch("tone")}1A` }}
                        >
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="h-full w-full object-contain"
                            />
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
                            onChange={handleImageSelect}
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
              {categories?.map((cat: any) => {
                const iconUrl = publicImageUrl(cat.imageUrl);
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-border"
                        style={{ backgroundColor: cat.tone ? `${cat.tone}1A` : undefined }}
                      >
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt={cat.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.tone || "#FF69B4" }}
                          />
                        )}
                      </div>
                      <span className="font-medium">{cat.name}</span>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-500 h-8 w-8"
                        onClick={() => handleEditCategory(cat)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 h-8 w-8"
                        onClick={() => handleDeleteCategory(cat.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

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
              <p className="text-[10px] text-muted-foreground italic">
                * O número é fixo conforme requisitos do projeto.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL do Instagram</label>
              <Input
                defaultValue="https://www.instagram.com/sualojinhamakeup/"
                readOnly
                className="bg-gray-50"
              />
            </div>
            <Button disabled className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-red-100 bg-red-50/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-600">Gerenciamento de Dados</CardTitle>
          </div>
          <CardDescription>Ações críticas que afetam os dados da loja.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-red-200 bg-red-50">
            <div>
              <p className="font-semibold text-red-900">Zerar Histórico de Vendas</p>
              <p className="text-sm text-red-700">
                Esta ação apagará permanentemente todas as vendas e itens registrados.
              </p>
            </div>

            <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Zerar Vendas
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Você tem certeza absoluta?</DialogTitle>
                  <DialogDescription>
                    Esta ação é irreversível. Todas as vendas, itens de venda e movimentações de
                    estoque vinculadas a vendas serão deletados permanentemente.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 gap-2">
                  <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleResetSales} disabled={isResetting}>
                    {isResetting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Zerando...
                      </>
                    ) : (
                      "Sim, Zerar Tudo"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

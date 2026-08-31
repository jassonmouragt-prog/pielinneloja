import { createFileRoute, redirect, useRouter, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";
import { resolveAssetUrl } from "@/lib/assets";
import { useServerFn } from "@tanstack/react-start";
import { signIn } from "@/lib/auth/auth.functions";
import { tokenStorage } from "@/lib/auth/token-storage";

export const Route = createFileRoute("/admin/login")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const token = tokenStorage.get();
    if (token) {
      throw redirect({ to: "/admin/dashboard" });
    }
  },
  component: AdminLoginPage,
});

function parseLoginError(error: any): string {
  if (!error) return "Erro ao realizar login. Tente novamente.";

  if (typeof error === "string") return error;

  const raw = error.message ?? error.error?.message ?? "";
  const lower = String(raw).toLowerCase();

  if (lower.includes("e-mail ou senha incorretos"))
    return "E-mail ou senha incorretos. Verifique e tente novamente.";
  if (
    lower.includes("credenciais") ||
    lower.includes("invalid login") ||
    lower.includes("invalid credentials")
  )
    return "E-mail ou senha incorretos. Verifique e tente novamente.";
  if (
    lower.includes("acesso negado") ||
    lower.includes("não autorizado") ||
    lower.includes("forbidden")
  )
    return "Acesso negado. Apenas administradores podem acessar esta área.";
  if (lower.includes("obrigatório") || lower.includes("required"))
    return "E-mail e senha são obrigatórios.";
  if (lower.includes("e-mail inválido") || lower.includes("invalid email"))
    return "Formato de e-mail inválido.";
  if (lower.includes("network") || lower.includes("fetch") || lower.includes("failed to fetch"))
    return "Erro de conexão. Verifique sua internet e tente novamente.";

  if (raw) return raw;
  return "Erro ao realizar login. Tente novamente.";
}

function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const signInFn = useServerFn(signIn);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();

      if (!cleanEmail || !cleanPassword) {
        toast.error("E-mail e senha são obrigatórios");
        throw new Error("E-mail e senha são obrigatórios");
      }

      const result = await signInFn({ data: { email: cleanEmail, password: cleanPassword } });

      tokenStorage.set(result.token);
      toast.success("Login realizado com sucesso!");

      await router.invalidate();
      router.navigate({ to: "/admin/dashboard" });
    } catch (error: any) {
      console.error("Erro no login:", error);
      const message = parseLoginError(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <Link to="/">
              <img src={resolveAssetUrl(logoAsset)} alt="Logo" className="h-20 w-auto" />
            </Link>
          </div>
          <CardTitle className="text-center text-2xl font-bold">Admin Pielinne</CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para gerenciar a loja
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-pink hover:bg-pink/90" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

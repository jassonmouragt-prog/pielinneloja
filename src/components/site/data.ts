import catAcessorios from "@/assets/cat-acessorios.png";
import catCabelos from "@/assets/cat-cabelos.png";
import catCorpo from "@/assets/cat-corpo.png";
import catKits from "@/assets/cat-kits.png";
import catMaquiagem from "@/assets/cat-maquiagem.png";
import catSkincare from "@/assets/cat-skincare.png";
import ig1 from "@/assets/ig-1.jpg";
import ig2 from "@/assets/ig-2.jpg";
import ig3 from "@/assets/ig-3.jpg";
import ig4 from "@/assets/ig-4.jpg";
import ig5 from "@/assets/ig-5.jpg";
import prodBase from "@/assets/prod-base.png";
import prodHidratante from "@/assets/prod-hidratante.png";
import prodLipTint from "@/assets/prod-liptint.png";
import prodMascara from "@/assets/prod-mascara.png";
import prodPo from "@/assets/prod-po.png";

export const navLinks = [
  "Maquiagem",
  "Skincare",
  "Cabelos",
  "Corpo",
  "Acessórios",
  "Kits",
  "Novidades",
  "Promoções",
];

export const categories = [
  { name: "Maquiagem", image: catMaquiagem, tone: "pink" as const },
  { name: "Skincare", image: catSkincare, tone: "lilac" as const },
  { name: "Cabelos", image: catCabelos, tone: "pink" as const },
  { name: "Corpo", image: catCorpo, tone: "lilac" as const },
  { name: "Acessórios", image: catAcessorios, tone: "lilac" as const },
  { name: "Kits", image: catKits, tone: "pink" as const },
  { name: "Novidades", image: null, tone: "pink" as const },
];

export const products = [
  {
    name: "Base Líquida",
    subtitle: "Ruby Rose Feels",
    image: prodBase,
    rating: 4.5,
    reviews: 120,
    price: "R$ 20,00",
  },
  {
    name: "Lip Tint Melu",
    subtitle: "by Ruby Rose",
    image: prodLipTint,
    rating: 4,
    reviews: 98,
    price: "R$ 15,00",
  },
  {
    name: "Pó Translúcido",
    subtitle: "Playboy",
    image: prodPo,
    rating: 4.5,
    reviews: 76,
    price: "R$ 20,00",
  },
  {
    name: "Máscara de Cílios",
    subtitle: "Dailus",
    image: prodMascara,
    rating: 4.5,
    reviews: 64,
    price: "R$ 15,00",
  },
  {
    name: "Hidratante Labial",
    subtitle: "Melu",
    image: prodHidratante,
    rating: 4.5,
    reviews: 52,
    price: "R$ 10,00",
  },
];

export const instagramPosts = [
  { image: "https://vdtitubyemidexqovgnd.supabase.co/storage/v1/object/public/lovable-uploads/6173b22b-2be1-43e7-88f5-44f2e9603099.png", alt: "Destaque de cores e produtos" },
  { image: "https://vdtitubyemidexqovgnd.supabase.co/storage/v1/object/public/lovable-uploads/4523c6f4-c242-4f32-beeb-9d628eb58686.png", alt: "Organização e beleza na loja" },
  { image: "https://vdtitubyemidexqovgnd.supabase.co/storage/v1/object/public/lovable-uploads/87349942-887e-40d0-86ec-3162608490a6.png", alt: "Ambiente da loja" },
  { image: "https://vdtitubyemidexqovgnd.supabase.co/storage/v1/object/public/lovable-uploads/967d32c5-7a4c-47ea-bc9b-32f22b8265a0.png", alt: "Variedade de maquiagens" },
  { image: "https://vdtitubyemidexqovgnd.supabase.co/storage/v1/object/public/lovable-uploads/273934f7-e455-4034-8c85-23c348f32247.png", alt: "Kits especiais" },
];

export const footerColumns = [
  {
    title: "Institucional",
    links: [
      "Sobre nós",
      "Política de Privacidade",
      "Trocas e Devoluções",
      "Perguntas Frequentes",
      "Fale Conosco",
    ],
  },
  {
    title: "Ajuda",
    links: [
      "Como Comprar",
      "Formas de Pagamento",
      "Prazo de Entrega",
      "Rastreamento",
      "Cancelamentos",
    ],
  },
  {
    title: "Categorias",
    links: ["Maquiagem", "Skincare", "Cabelos", "Corpo", "Acessórios", "Kits"],
  },
];
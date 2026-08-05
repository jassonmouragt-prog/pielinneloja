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
    price: "R$ 24,90",
  },
  {
    name: "Lip Tint Melu",
    subtitle: "by Ruby Rose",
    image: prodLipTint,
    rating: 4,
    reviews: 98,
    price: "R$ 16,90",
  },
  {
    name: "Pó Translúcido",
    subtitle: "Playboy",
    image: prodPo,
    rating: 4.5,
    reviews: 76,
    price: "R$ 29,90",
  },
  {
    name: "Máscara de Cílios",
    subtitle: "Dailus",
    image: prodMascara,
    rating: 4.5,
    reviews: 64,
    price: "R$ 19,90",
  },
  {
    name: "Hidratante Labial",
    subtitle: "Melu",
    image: prodHidratante,
    rating: 4.5,
    reviews: 52,
    price: "R$ 14,90",
  },
];

export const instagramPosts = [
  { image: ig1, alt: "Prateleiras da loja repletas de maquiagem" },
  { image: ig2, alt: "Batons e lip glosses cor-de-rosa" },
  { image: ig3, alt: "Kits de presente com produtos de beleza" },
  { image: ig4, alt: "Pó compacto lilás na mão" },
  { image: ig5, alt: "Atendente da loja Sua Lojinha Maakeup" },
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
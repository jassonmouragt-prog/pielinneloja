import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
}

interface InstagramResponse {
  data: InstagramMedia[];
}

// Cache simples em memória (dura enquanto o worker estiver vivo)
let cachedPosts: InstagramMedia[] | null = null;
let lastFetch = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hora

export const getInstagramPosts = createServerFn({ method: "GET" }).handler(async () => {
  const token = process.env["INSTAGRAM_ACCESS_TOKEN"];

  if (!token) {
    console.error("INSTAGRAM_ACCESS_TOKEN not found in environment");
    return [];
  }

  // Verificar cache
  const now = Date.now();
  if (cachedPosts && now - lastFetch < CACHE_DURATION) {
    return cachedPosts;
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${token}&limit=10`,
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Erro ao buscar posts do Instagram");
    }

    const data: InstagramResponse = await response.json();

    // Filtrar apenas imagens ou carrosséis (ou tratar vídeos com thumbnail)
    const posts = data.data.map((item) => ({
      ...item,
      display_url:
        item.media_type === "VIDEO" ? item.thumbnail_url || item.media_url : item.media_url,
    }));

    cachedPosts = posts;
    lastFetch = now;

    return posts;
  } catch (error) {
    console.error("Instagram API Error:", error);
    // Se falhar e tiver cache antigo, retorna o cache mesmo que expirado
    return cachedPosts || [];
  }
});

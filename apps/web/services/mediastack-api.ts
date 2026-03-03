import { EXTERNAL_APIS_CONFIG } from "@/constants";

export interface NewsPagination {
  limit: number;
  offset: number;
  count: number;
  total: number;
}

export interface NewsArticle {
  author: string | null;
  title: string;
  description: string;
  url: string;
  source: string;
  image: string | null;
  category: string;
  language: string;
  country: string;
  published_at: string; // ISO 8601
}

export interface NewsResponse {
  pagination: NewsPagination;
  data: NewsArticle[];
}

export async function fetchMediastackAPI(): Promise<NewsResponse> {
  const API_KEY = process.env.NEWS_API_KEY;

  const response = await fetch(`${EXTERNAL_APIS_CONFIG.MEDIASTACK_BASE_URL}?access_key=${API_KEY}&countries=br&limit=5`, {
    next: { revalidate: 6 * 60 * 60 }, // 6 hours
  });

  if (!response.ok) {
    throw new Error("Falha ao buscar dados da API externa");
  }

  const responseJson = await response.json();

  return responseJson;
}
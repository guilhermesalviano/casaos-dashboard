import { APIS, EXTERNAL_SERVICES, UPDATE_INTERVAL_MS } from "@/config/config";
import { SerpApiGoogleNewsResponse } from "@/types/services";

export async function fetchGoogleNewsAPI(): Promise<SerpApiGoogleNewsResponse> {
  const SERPAPI_KEY = APIS.serpApiKey;
 
  const response = await fetch(
    `${EXTERNAL_SERVICES.serpApi}?engine=google_news_light&api_key=${SERPAPI_KEY}&q=breaking+news+world`,
    { next: { revalidate: UPDATE_INTERVAL_MS } }
  );

  if (!response.ok) {
    throw new Error("Falha ao buscar dados da API externa 'serpapi'");
  }

  const responseJson = await response.json();

  return responseJson;
}
import { APIS, EXTERNAL_SERVICES } from "@/config/config";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import logger from "@/lib/logger";
import { ErrorResponse, SerpApiGoogleNewsResponse } from "@/types/services";
import { toLogError } from "@/utils/to-logger-error";

export async function fetchGoogleNewsAPI(): Promise<SerpApiGoogleNewsResponse | ErrorResponse> {
  const url = `${EXTERNAL_SERVICES.serpApi}?engine=google_news_light&api_key=${APIS.serpApiKey}&q=breaking+news+world`;
 
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    logger.error("Error fetching Google News API: ", response.status, toLogError(response.text().catch(() => "")));
    const errorMessage = `Google News request failed with status ${response.status}`;
    return { error: errorMessage };
  }

  const responseJson = await response.json();

  return responseJson;
}
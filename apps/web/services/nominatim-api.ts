import { EXTERNAL_SERVICES, UPDATE_INTERVAL_MS } from "@/config/config";
import { LocationResponse, NominatimProps } from "@/types/services";

export async function fetchNominatimAPI({latitude, longitude}: NominatimProps): Promise<LocationResponse> {
  const response = await fetch(`${EXTERNAL_SERVICES.nominatim}?format=jsonv2&lat=${latitude}&lon=${longitude}`, {
    headers: {
      'User-Agent': 'CoreDash/1.0',
    },
    next: { revalidate: UPDATE_INTERVAL_MS },
  });

  if (!response.ok) {
    throw new Error("Falha ao buscar dados da API externa 'Nominatim'");
  }

  const responseJson = await response.json();

  return responseJson;
}
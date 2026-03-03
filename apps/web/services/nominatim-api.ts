import { EXTERNAL_APIS_CONFIG } from "@/constants";

export interface LocationResponse {
  place_id:     number;
  licence:      string;
  osm_type:     string;
  osm_id:       number;
  lat:          string; // Note: vem como string na API
  lon:          string;
  category:     string;
  type:         string;
  place_rank:   number;
  importance:   number;
  addresstype:  string;
  name:         string;
  display_name: string;
  address:      Address;
  boundingbox:  string[];
}

export interface Address {
  suburb:          string;
  city:            string;
  municipality:    string;
  state_district:  string;
  state:           string;
  "ISO3166-2-lvl4": string;
  region:          string;
  postcode:        string;
  country:         string;
  country_code:    string;
}

interface NominatimProps {
  latitude: string;
  longitude: string;
}

export async function fetchNominatimAPI({latitude, longitude}: NominatimProps): Promise<LocationResponse> {
  const response = await fetch(`${EXTERNAL_APIS_CONFIG.NOMINATIM_BASE_URL}/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`, {
    next: { revalidate: EXTERNAL_APIS_CONFIG.UPDATE_INTERVAL_MS },
  });

  if (!response.ok) {
    throw new Error("Falha ao buscar dados da API externa");
  }

  const responseJson = await response.json();

  return responseJson;
}
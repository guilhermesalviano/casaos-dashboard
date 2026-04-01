import fs from "fs";
import path from "path";
import { fetchNominatimAPI } from "@/services/nominatim-api";
import { LOCATION } from "@/config/config";

const CONFIG_PATH = path.join(process.cwd(), ".location-cache");

interface LocationCache {
  state: string;
  city: string;
}

function readCache(): LocationCache | null {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    return null;
  }
}

function writeCache(data: LocationCache): void {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    console.warn("Could not write location cache:", CONFIG_PATH);
  }
}

export default async function getUserCity(): Promise<LocationCache> {
  const cached = readCache();
  if (cached) {
    console.log("[cache]: return user location from cache.");
    return cached;
  };

  const res = await fetchNominatimAPI({
    latitude: LOCATION.latitude,
    longitude: LOCATION.longitude,
  });

  const location: LocationCache = {
    state:        res.address.state,
    city:         res.address.city,
  };

  writeCache(location);
  return location;
}
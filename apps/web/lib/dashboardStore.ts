const STALE_MS = 20 * 60 * 1000;

type Status = "idle" | "loading" | "success" | "error";

interface StoreSlice<T> {
  data: T | null;
  status: Status;
  lastFetchedAt: number;
}

interface DashboardStore {
  weather: StoreSlice<any>;
  news:    StoreSlice<any>;
  stocks:  StoreSlice<any>;
}

type Listener = () => void;

let store: DashboardStore = {
  weather: { data: null, status: "idle", lastFetchedAt: 0 },
  news:    { data: null, status: "idle", lastFetchedAt: 0 },
  stocks:  { data: null, status: "idle", lastFetchedAt: 0 },
};

const listeners = new Set<Listener>();

function setSlice(key: keyof DashboardStore, patch: Partial<StoreSlice<any>>) {
  store = { ...store, [key]: { ...store[key], ...patch } };
  listeners.forEach((l) => l());
}

async function fetchSlice(key: keyof DashboardStore, endpoint: string) {
  setSlice(key, { status: "loading" });
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error();
    const { data } = await res.json();
    setSlice(key, { data, status: "success", lastFetchedAt: Date.now() });
  } catch {
    setSlice(key, { status: "error" });
  }
}

const fetchers: Record<keyof DashboardStore, () => Promise<void>> = {
  weather: () => fetchSlice("weather", "/api/weather?limit=6"),
  news:    () => fetchSlice("news",    "/api/news"),
  stocks:  () => fetchSlice("stocks",  "/api/stocks"),
};

export async function fetchAll() {
  await Promise.all(Object.values(fetchers).map((f) => f()));
}

function handleVisibility() {
  if (document.visibilityState !== "visible") return;
  const now = Date.now();

  const stale = (Object.keys(fetchers) as (keyof DashboardStore)[])
    .filter((key) => now - store[key].lastFetchedAt > STALE_MS);

  if (stale.length) {
    Promise.all(stale.map((key) => fetchers[key]()));
  };
}

let subscriberCount = 0;

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  if (++subscriberCount === 1) {
    fetchAll();
    document.addEventListener("visibilitychange", handleVisibility);
  }

  return () => {
    listeners.delete(listener);
    if (--subscriberCount === 0) {
      document.removeEventListener("visibilitychange", handleVisibility);
    }
  };
}

export function getSnapshot(): DashboardStore {
  return store;
}
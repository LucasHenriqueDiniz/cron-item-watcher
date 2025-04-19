export interface CsTradeItem {
  id: string;
  a: string; // AppID (730 for CS2)
  n: string; // Name
  p: number; // Price
  c: string; // Color
  s: string; // StatTrak?
  t: string; // Type
  nd: string; // Base name
  wn: string; // Wear name (FT, MW, etc)
  w: string; // Wear value (float)
  // Other properties might be present
}

export interface MannCoItem {
  id: number;
  name: string;
  price: number;
  image: string;
  url: string;
  quality: string;
  effect: string;
  // Other properties might be present
}

export interface WatchConfig {
  cs_trade: {
    enabled: boolean;
    watchTerms: string[];
    maxPrice: number | null;
  };
  mann_co: {
    enabled: boolean;
    watchTerms: string[];
    maxPrice: number | null;
  };
  discord: {
    username: string;
    avatarUrl: string;
  };
}

export interface StoredData {
  cs_trade: Record<string, CsTradeItem>;
  mann_co: Record<string, MannCoItem>;
  lastUpdate: string;
}

export interface MatchedItem {
  source: "cs_trade" | "mann_co";
  name: string;
  price: number;
  id: string | number;
  imageUrl?: string;
  itemUrl?: string;
  matchedTerm: string;
}

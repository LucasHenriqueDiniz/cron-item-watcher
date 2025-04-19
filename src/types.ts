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
  _game?: string; // Custom property to track game
  // Other properties might be present
}

export interface WatchConfig {
  // Site-specific game filter settings
  cs_trade: {
    enabled: boolean;
    watchTerms: string[];
    ignoredTerms: string[]; // Terms to ignore/exclude
    maxPrice: number | null;
    watchGames: {
      tf2: boolean; // 440
      cs2: boolean; // 730
      dota2: boolean; // 570
      rust: boolean; // 252490
    };
  };

  mann_co: {
    enabled: boolean;
    watchTerms: string[];
    ignoredTerms: string[]; // Terms to ignore/exclude
    maxPrice: number | null;
    watchGames: {
      tf2: boolean; // 440
      cs2: boolean; // 730
      dota2: boolean; // 570
      rust: boolean; // 252490
    };
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
  game?: string; // Game identifier (tf2, cs2, etc.)
}

// Game ID mappings
export const GAME_IDS = {
  tf2: "440",
  cs2: "730",
  dota2: "570",
  rust: "252490",
};

// Mappings for MannCo.store URLs
export const MANNCO_GAME_URLS = {
  tf2: "tf2",
  cs2: "cs2",
  dota2: "dota2",
  rust: "rust",
};

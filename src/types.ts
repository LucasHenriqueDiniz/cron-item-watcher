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
  effect_url?: string; // URL for the effect image
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
    minPrice: number | null; // Minimum price threshold
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
    minPrice: number | null; // Minimum price threshold
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
  effect?: string; // Effect name
  effectUrl?: string; // URL for effect image
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

// Game emojis for Discord messages - using custom Discord emoji format
export const GAME_EMOJIS = {
  tf2: "<:tf2:1063141924673966221>", // Replace with actual emoji ID from your Discord server
  cs2: "<:CS2:1148239924064165948>", // Replace with actual emoji ID from your Discord server
  dota2: "<:dota2:1063141908953694239>", // Replace with actual emoji ID from your Discord server
  rust: "<:rust:1019728503882645547>", // Replace with actual emoji ID from your Discord server
  mannco: "<:manncoCoins:1153146552328663050>", // Replace with actual emoji ID
  unknown: "🎮", // Fallback to Unicode emoji
};

export const MESSAGE_EMOJIS = {
  mannco: "<:manncoCoins:1153146552328663050>", // Replace with actual emoji ID
  cs_trade: "<:csmoney:1176343313247383633>", // Replace with actual emoji ID
  blue_arrow: "<:BlueArrow:1164763220611973182>", // Replace with actual emoji ID
  blue_dot: "<:b_dot2:1163636601126133832>", // Replace with actual emoji ID
  unknown: "❓", // Fallback to Unicode emoji
};

export interface CsTradeItem {
  id: string;
  n: string; // nome
  p: number; // preço
  image?: string;
  itemUrl?: string;
  game?: string;
  effect?: string;
  effectId?: number;
  [key: string]: any; // outros campos
}

export interface MannCoItem {
  id: number;
  name: string;
  price: number;
  image?: string;
  imageUrl?: string;
  itemUrl?: string;
  game?: string;
  effect?: string;
  effectId?: number;
  effectUrl?: string;
  // New fields for Steam inventory items
  steamId?: string;
  assetId?: string;
  classId?: string;
  instanceId?: string;
  [key: string]: any; // outros campos
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

// Novo tipo para unificar o armazenamento no banco de dados
export interface DbItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  itemUrl?: string;
  game?: string;
  effect?: string;
  effectId?: number;
  data: string; // Para armazenar dados adicionais em JSON
}

// Novo tipo para efeito (nova tabela)
export interface Effect {
  id: number;
  name: string;
  imageUrl?: string;
}

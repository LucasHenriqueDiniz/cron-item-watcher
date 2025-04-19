import { WatchConfig } from "./types.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Default configuration
const defaultConfig: WatchConfig = {
  cs_trade: {
    enabled: true,
    watchTerms: ["Dragon Lore", "Unusual"],
    ignoredTerms: ["Graffiti", "Sticker", "Case"],
    maxPrice: null, // Set a price limit in dollars ex 150000
    minPrice: 0, // Minimum price to consider (0 = no minimum)
    watchGames: {
      tf2: true, // 440
      cs2: true, // 730
      dota2: false, // 570
      rust: false, // 252490
    },
  },

  mann_co: {
    enabled: true,
    watchTerms: ["Australium", "Unusual"],
    ignoredTerms: ["Graffiti", "Case"],
    maxPrice: null, // No price limit
    minPrice: 0, // Minimum price to consider (0 = no minimum)
    watchGames: {
      tf2: true, // 440
      cs2: false, // 730
      dota2: false, // 570
      rust: false, // 252490
    },
  },

  discord: {
    username: "Item Watcher",
    avatarUrl: "https://i.imgur.com/oBPXx0D.png",
  },
};

// Load configuration from file or use default
let config: WatchConfig;
const configPath = path.join(__dirname, "..", "data", "config.json");

try {
  if (fs.existsSync(configPath)) {
    const configFile = fs.readFileSync(configPath, "utf8");
    const loadedConfig = JSON.parse(configFile);

    // Ensure required properties exist, use defaults if they don't
    config = {
      cs_trade: {
        enabled: loadedConfig.cs_trade?.enabled ?? defaultConfig.cs_trade.enabled,
        watchTerms: loadedConfig.cs_trade?.watchTerms ?? defaultConfig.cs_trade.watchTerms,
        ignoredTerms: loadedConfig.cs_trade?.ignoredTerms ?? defaultConfig.cs_trade.ignoredTerms,
        maxPrice: loadedConfig.cs_trade?.maxPrice ?? defaultConfig.cs_trade.maxPrice,
        minPrice: loadedConfig.cs_trade?.minPrice ?? defaultConfig.cs_trade.minPrice, // Add minPrice
        watchGames: loadedConfig.cs_trade?.watchGames ?? defaultConfig.cs_trade.watchGames,
      },
      mann_co: {
        enabled: loadedConfig.mann_co?.enabled ?? defaultConfig.mann_co.enabled,
        watchTerms: loadedConfig.mann_co?.watchTerms ?? defaultConfig.mann_co.watchTerms,
        ignoredTerms: loadedConfig.mann_co?.ignoredTerms ?? defaultConfig.mann_co.ignoredTerms,
        maxPrice: loadedConfig.mann_co?.maxPrice ?? defaultConfig.mann_co.maxPrice,
        minPrice: loadedConfig.mann_co?.minPrice ?? defaultConfig.mann_co.minPrice, // Add minPrice
        watchGames: loadedConfig.mann_co?.watchGames ?? defaultConfig.mann_co.watchGames,
      },
      discord: {
        username: loadedConfig.discord?.username ?? defaultConfig.discord.username,
        avatarUrl: loadedConfig.discord?.avatarUrl ?? defaultConfig.discord.avatarUrl,
      },
    };
    console.log("Configuration loaded from file");
  } else {
    config = defaultConfig;
    // Create config directory if it doesn't exist
    const configDir = path.join(__dirname, "..", "data");
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    // Save default config
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log("Default configuration saved to file");
  }
} catch (error) {
  console.error("Error loading configuration, using default:", error);
  config = defaultConfig;
}

export default config;

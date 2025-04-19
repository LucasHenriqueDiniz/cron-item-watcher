import { WatchConfig } from "./types.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Default configuration
const defaultConfig: WatchConfig = {
  cs_trade: {
    enabled: true,
    watchTerms: ["Howl", "Dragon Lore", "Butterfly Knife"],
    ignoredTerms: ["Graffiti", "Sticker", "Case"],
    maxPrice: 150000, // Set a price limit in dollars
    watchGames: {
      tf2: true, // 440
      cs2: true, // 730
      dota2: true, // 570
      rust: true, // 252490
    },
  },

  mann_co: {
    enabled: true,
    watchTerms: ["Unusual", "Australium", "Strange"],
    ignoredTerms: ["Graffiti", "Case"],
    maxPrice: null, // No price limit
    watchGames: {
      tf2: true, // 440
      cs2: true, // 730
      dota2: true, // 570
      rust: true, // 252490
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
    config = JSON.parse(configFile);
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

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
    maxPrice: 150000, // Set a price limit in dollars
  },
  mann_co: {
    enabled: true,
    watchTerms: ["Unusual", "Australium", "Strange"],
    maxPrice: null, // No price limit
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

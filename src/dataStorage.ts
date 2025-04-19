import fs from "fs";
import path from "path";
import { CsTradeItem, MannCoItem, StoredData } from "./types.js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATA_FILE = path.join(__dirname, "..", "data", "items.json");
const DATA_DIR = path.join(__dirname, "..", "data");

// Initialize with empty data
const defaultData: StoredData = {
  cs_trade: {},
  mann_co: {},
  lastUpdate: new Date().toISOString(),
};

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load stored data
export function loadStoredData(): StoredData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf8");
      return JSON.parse(data) as StoredData;
    }
  } catch (error) {
    console.error("Error loading stored data:", error);
  }

  // Return default data if file doesn't exist or there's an error
  return defaultData;
}

// Save data to file
export function saveStoredData(data: StoredData): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log("Data saved successfully");
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

// Find new items
export function findNewCsTradeItems(current: CsTradeItem[], stored: Record<string, CsTradeItem>): CsTradeItem[] {
  return current.filter((item) => !stored[item.id]);
}

export function findNewMannCoItems(current: MannCoItem[], stored: Record<string, MannCoItem>): MannCoItem[] {
  return current.filter((item) => !stored[item.id.toString()]);
}

// Update stored data with new items
export function updateStoredData(data: StoredData, newCsTradeItems: CsTradeItem[], newMannCoItems: MannCoItem[]): StoredData {
  const updatedData = { ...data };

  newCsTradeItems.forEach((item) => {
    updatedData.cs_trade[item.id] = item;
  });

  newMannCoItems.forEach((item) => {
    updatedData.mann_co[item.id.toString()] = item;
  });

  updatedData.lastUpdate = new Date().toISOString();

  return updatedData;
}

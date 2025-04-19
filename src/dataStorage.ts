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
      console.log(`Loading stored data: file size ${(data.length / 1024).toFixed(2)} KB`);

      const parsedData = JSON.parse(data) as StoredData;
      const csTradeCount = Object.keys(parsedData.cs_trade).length;
      const mannCoCount = Object.keys(parsedData.mann_co).length;

      console.log(`Loaded ${csTradeCount} CS.Trade items and ${mannCoCount} MannCo items from storage`);
      return parsedData;
    } else {
      console.log("No stored data found, using default empty data");
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
    const csTradeCount = Object.keys(data.cs_trade).length;
    const mannCoCount = Object.keys(data.mann_co).length;

    console.log(`Saving data to storage: ${csTradeCount} CS.Trade items, ${mannCoCount} MannCo items`);

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log("Data saved successfully to", DATA_FILE);
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

// Find new items
export function findNewCsTradeItems(current: CsTradeItem[], stored: Record<string, CsTradeItem>): CsTradeItem[] {
  console.log(`Comparing ${current.length} current CS.Trade items against ${Object.keys(stored).length} stored items`);

  // Items are new if they don't exist in storage or if price has changed
  const newItems = current.filter((item) => {
    const storedItem = stored[item.id];
    return !storedItem || storedItem.p !== item.p;
  });

  console.log(`Found ${newItems.length} new or updated CS.Trade items`);

  if (newItems.length > 0 && newItems.length < 10) {
    // Log the first few new items for debugging
    console.log(
      "Sample new items:",
      newItems.slice(0, 3).map((item) => ({ id: item.id, name: item.n, price: item.p }))
    );
  }

  return newItems;
}

export function findNewMannCoItems(current: MannCoItem[], stored: Record<string, MannCoItem>): MannCoItem[] {
  console.log(`Comparing ${current.length} current MannCo items against ${Object.keys(stored).length} stored items`);

  // Items are new if they don't exist in storage or if price has changed
  const newItems = current.filter((item) => {
    const storedItem = stored[item.id.toString()];
    return !storedItem || storedItem.price !== item.price;
  });

  console.log(`Found ${newItems.length} new or updated MannCo items`);

  if (newItems.length > 0 && newItems.length < 10) {
    // Log the first few new items for debugging
    console.log(
      "Sample new items:",
      newItems.slice(0, 3).map((item) => ({ id: item.id, name: item.name, price: item.price }))
    );
  }

  return newItems;
}

// Update stored data with new items
export function updateStoredData(data: StoredData, newCsTradeItems: CsTradeItem[], newMannCoItems: MannCoItem[]): StoredData {
  const updatedData = { ...data };

  // Update CS.Trade items
  newCsTradeItems.forEach((item) => {
    updatedData.cs_trade[item.id] = item;
  });

  // Update MannCo items
  newMannCoItems.forEach((item) => {
    updatedData.mann_co[item.id.toString()] = item;
  });

  updatedData.lastUpdate = new Date().toISOString();

  const csTradeCount = Object.keys(updatedData.cs_trade).length;
  const mannCoCount = Object.keys(updatedData.mann_co).length;
  console.log(`Data updated: now tracking ${csTradeCount} CS.Trade items and ${mannCoCount} MannCo items`);

  return updatedData;
}

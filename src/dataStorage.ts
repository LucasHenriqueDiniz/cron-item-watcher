import fs from "fs";
import path from "path";
import { CsTradeItem, MannCoItem, StoredData } from "./types.js";
import { fileURLToPath } from "url";
import * as db from "./database.js";

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

// Inicializa o banco de dados na primeira vez que o módulo é carregado
(async () => {
  try {
    await db.initDatabase();
    console.log("Database initialized successfully");

    // Verificar se precisamos migrar dados do JSON para o banco de dados
    if (fs.existsSync(DATA_FILE)) {
      console.log("Found existing JSON file, checking if migration is needed...");
      // Implementar migração de dados do JSON para o SQLite se necessário
      // (código de migração seria adicionado aqui se necessário)
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
})();

// Load stored data - agora usando o banco de dados
export async function loadStoredData(): Promise<StoredData> {
  try {
    return await db.loadStoredData();
  } catch (error) {
    console.error("Error loading stored data from database:", error);
    return defaultData;
  }
}

// Save data to file - agora atualizada para usar banco de dados
export async function saveStoredData(data: StoredData): Promise<void> {
  try {
    const csTradeItems = Object.values(data.cs_trade);
    const mannCoItems = Object.values(data.mann_co);

    await db.saveNewCsTradeItems(csTradeItems);
    await db.saveNewMannCoItems(mannCoItems);
    await db.updateLastUpdateTime();

    console.log(`Saved ${csTradeItems.length} CS.Trade items and ${mannCoItems.length} MannCo items to database`);
  } catch (error) {
    console.error("Error saving data to database:", error);
  }
}

// Find new items - agora usando o banco de dados
export async function findNewCsTradeItems(current: CsTradeItem[]): Promise<CsTradeItem[]> {
  // O parâmetro stored não é mais necessário quando usamos o banco de dados
  return db.findNewCsTradeItems(current);
}

export async function findNewMannCoItems(current: MannCoItem[]): Promise<MannCoItem[]> {
  // O parâmetro stored não é mais necessário quando usamos o banco de dados
  return db.findNewMannCoItems(current);
}

// Update stored data with new items - mantido para compatibilidade
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

  // Atualiza o banco de dados em segundo plano
  (async () => {
    await db.saveNewCsTradeItems(newCsTradeItems);
    await db.saveNewMannCoItems(newMannCoItems);
    await db.updateLastUpdateTime();
  })();

  const csTradeCount = Object.keys(updatedData.cs_trade).length;
  const mannCoCount = Object.keys(updatedData.mann_co).length;
  console.log(`Data updated: now tracking ${csTradeCount} CS.Trade items and ${mannCoCount} MannCo items`);

  return updatedData;
}

// Nova função para limpar itens antigos periodicamente
export async function cleanupOldItems(daysToKeep: number = 30): Promise<void> {
  await db.cleanupOldItems(daysToKeep);
}

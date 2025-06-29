import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { CsTradeItem, MannCoItem, StoredData, Effect } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH = path.join(__dirname, '..', 'data', 'items.db');

// Inicializa a conexão com o banco de dados
export async function initDatabase() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  // Criar tabelas se não existirem
  await db.exec(`
    CREATE TABLE IF NOT EXISTS cs_trade_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      image_url TEXT,
      item_url TEXT,
      game TEXT,
      effect_id INTEGER,
      data TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS mann_co_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      image_url TEXT,
      item_url TEXT,
      game TEXT,
      effect_id INTEGER,
      data TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS effects (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS meta_data (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Inserir ou atualizar última atualização
  await db.run(
    `INSERT OR REPLACE INTO meta_data (key, value) VALUES ('lastUpdate', ?) 
    ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    new Date().toISOString()
  );

  return db;
}

// Função para inserir ou atualizar um efeito
export async function saveEffect(effect: Effect): Promise<void> {
  if (!effect || !effect.name) return;
  
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
  
  await db.run(
    `INSERT OR REPLACE INTO effects (id, name, image_url)
     VALUES (?, ?, ?)`,
    effect.id,
    effect.name,
    effect.imageUrl
  );
}

// Função para obter informações de um efeito pelo ID
export async function getEffectById(id: number): Promise<Effect | null> {
  if (!id) return null;
  
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
  
  const effect = await db.get('SELECT * FROM effects WHERE id = ?', id);
  return effect ? {
    id: effect.id,
    name: effect.name,
    imageUrl: effect.image_url
  } : null;
}

// Obtém dados armazenados (compatível com a interface antiga)
export async function loadStoredData(): Promise<StoredData> {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  console.log('Loading stored data from database');

  // Carregar itens CS Trade
  const csTradeItems = await db.all('SELECT * FROM cs_trade_items');
  const csTradeMap: Record<string, CsTradeItem> = {};
  
  for (const item of csTradeItems) {
    // Reconstruir o objeto no formato original
    const baseItem = {
      ...JSON.parse(item.data || '{}'),
      id: item.id,
      n: item.name,
      p: item.price,
      itemUrl: item.item_url,
      game: item.game
    };
    
    // Se tiver efeito, carregar do banco de dados de efeitos
    if (item.effect_id) {
      const effect = await getEffectById(item.effect_id);
      if (effect) {
        baseItem.effect = effect.name;
        baseItem.effectId = effect.id;
      }
    }
    
    csTradeMap[item.id] = baseItem;
  }
  
  console.log(`Loaded ${csTradeItems.length} CS.Trade items from database`);

  // Carregar itens MannCo
  const mannCoItems = await db.all('SELECT * FROM mann_co_items');
  const mannCoMap: Record<string, MannCoItem> = {};
  
  for (const item of mannCoItems) {
    // Reconstruir o objeto no formato original
    const baseItem = {
      ...JSON.parse(item.data || '{}'),
      id: parseInt(item.id, 10),
      name: item.name,
      price: item.price,
      imageUrl: item.image_url,
      itemUrl: item.item_url,
      game: item.game
    };
    
    // Se tiver efeito, carregar do banco de dados de efeitos
    if (item.effect_id) {
      const effect = await getEffectById(item.effect_id);
      if (effect) {
        baseItem.effect = effect.name;
        baseItem.effectId = effect.id;
        baseItem.effectUrl = effect.imageUrl;
      }
    }
    
    mannCoMap[item.id] = baseItem;
  }
  
  console.log(`Loaded ${mannCoItems.length} MannCo items from database`);

  // Carregar última atualização
  const lastUpdateRow = await db.get(
    "SELECT value FROM meta_data WHERE key = 'lastUpdate'"
  );
  const lastUpdate = lastUpdateRow?.value || new Date().toISOString();

  return {
    cs_trade: csTradeMap,
    mann_co: mannCoMap,
    lastUpdate
  };
}

// Salvar itens CS.Trade
export async function saveNewCsTradeItems(items: CsTradeItem[]): Promise<void> {
  if (!items.length) return;

  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  const stmt = await db.prepare(`
    INSERT OR REPLACE INTO cs_trade_items 
    (id, name, price, image_url, item_url, game, effect_id, data, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  for (const item of items) {
    // Salvar efeito se existir
    if (item.effectId && item.effect) {
      await saveEffect({
        id: item.effectId,
        name: item.effect,
        imageUrl: item.image
      });
    }
    
    // Separamos os campos principais e armazenamos o objeto completo no campo data
    const { id, n: name, p: price, image, itemUrl, game, effect, effectId, ...rest } = item;
    
    await stmt.run(
      id, 
      name, 
      price,
      image || null,
      itemUrl || null,
      game || null,
      effectId || null,
      JSON.stringify(rest)
    );
  }

  await stmt.finalize();
  console.log(`Saved ${items.length} new CS.Trade items to database`);
}

// Salvar itens Mann.Co
export async function saveNewMannCoItems(items: MannCoItem[]): Promise<void> {
  if (!items.length) return;

  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  const stmt = await db.prepare(`
    INSERT OR REPLACE INTO mann_co_items 
    (id, name, price, image_url, item_url, game, effect_id, data, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  for (const item of items) {
    // Salvar efeito se existir
    if (item.effectId && item.effect) {
      await saveEffect({
        id: item.effectId,
        name: item.effect,
        imageUrl: item.effectUrl
      });
    }
    
    // Separamos os campos principais e armazenamos o objeto completo no campo data
    const { 
      id, 
      name, 
      price, 
      imageUrl, 
      image,
      itemUrl, 
      game, 
      effect,
      effectId,
      effectUrl,
      ...rest 
    } = item;
    
    await stmt.run(
      id.toString(), 
      name, 
      price, 
      imageUrl || image || null,
      itemUrl || null,
      game || null,
      effectId || null,
      JSON.stringify(rest)
    );
  }

  await stmt.finalize();
  console.log(`Saved ${items.length} new MannCo items to database`);
}

// Atualiza a data de última atualização
export async function updateLastUpdateTime(): Promise<void> {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  await db.run(
    `INSERT OR REPLACE INTO meta_data (key, value) VALUES ('lastUpdate', ?)`,
    new Date().toISOString()
  );
}

// Encontrar novos itens CS.Trade (comparando com o banco de dados)
export async function findNewCsTradeItems(items: CsTradeItem[]): Promise<CsTradeItem[]> {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  console.log(`Comparing ${items.length} current CS.Trade items against database`);
  
  const newItems: CsTradeItem[] = [];
  
  for (const item of items) {
    // Verifica se o item existe e se o preço é diferente
    const existingItem = await db.get(
      'SELECT id, price FROM cs_trade_items WHERE id = ?', 
      item.id
    );
    
    if (!existingItem || existingItem.price !== item.p) {
      newItems.push(item);
    }
  }

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

// Encontrar novos itens Mann.Co (comparando com o banco de dados)
export async function findNewMannCoItems(items: MannCoItem[]): Promise<MannCoItem[]> {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  console.log(`Comparing ${items.length} current MannCo items against database`);
  
  const newItems: MannCoItem[] = [];
  
  for (const item of items) {
    // Verifica se o item existe e se o preço é diferente
    const existingItem = await db.get(
      'SELECT id, price FROM mann_co_items WHERE id = ?', 
      item.id.toString()
    );
    
    if (!existingItem || existingItem.price !== item.price) {
      newItems.push(item);
    }
  }

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

// Método para limpar itens antigos (algo que era difícil com JSON)
export async function cleanupOldItems(daysToKeep: number = 30): Promise<void> {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  const cutoffDateString = cutoffDate.toISOString();
  
  const csDeleted = await db.run(
    `DELETE FROM cs_trade_items WHERE updated_at < ?`,
    cutoffDateString
  );
  
  const mannCoDeleted = await db.run(
    `DELETE FROM mann_co_items WHERE updated_at < ?`,
    cutoffDateString
  );
  
  console.log(`Cleanup completed: Removed ${csDeleted.changes} old CS.Trade items and ${mannCoDeleted.changes} old MannCo items`);
}

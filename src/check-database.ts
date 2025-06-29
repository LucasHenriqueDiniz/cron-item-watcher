import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { DB_PATH } from './database.js';

// Diretório onde o script está sendo executado
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Caminho para o banco de dados
const dbPath = DB_PATH || path.join(__dirname, '..', 'data', 'items.db');

/**
 * Script para verificar o estado atual do banco de dados
 */
async function checkDatabaseStatus() {
  console.log("====== Verificando o Estado do Banco de Dados ======");
  console.log(`Path do banco: ${dbPath}`);

  try {
    // Tentar abrir o banco de dados
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    console.log("✅ Conexão com o banco de dados estabelecida!");
    
    // Verificar as tabelas
    console.log("\nTabelas disponíveis:");
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    tables.forEach(table => {
      console.log(`- ${table.name}`);
    });
    
    // Contar registros em cada tabela
    console.log("\nContagem de registros por tabela:");
    for (const table of tables) {
      const count = await db.get(`SELECT COUNT(*) as count FROM ${table.name}`);
      console.log(`- ${table.name}: ${count.count} registros`);
    }
    
    // Verificar última atualização
    const lastUpdate = await db.get("SELECT value FROM meta_data WHERE key = 'lastUpdate'");
    if (lastUpdate) {
      console.log(`\nÚltima atualização: ${lastUpdate.value}`);
    } else {
      console.log("\nNenhum registro de última atualização encontrado.");
    }
    
    // Mostrar amostra de dados
    console.log("\nAmostra de itens CS.Trade:");
    const csTradeItems = await db.all("SELECT * FROM cs_trade_items LIMIT 3");
    console.log(csTradeItems);
    
    console.log("\nAmostra de itens MannCo:");
    const mannCoItems = await db.all("SELECT * FROM mann_co_items LIMIT 3");
    console.log(mannCoItems);
    
    console.log("\n✅ Verificação de banco de dados concluída com sucesso!");
    
  } catch (error) {
    console.error("\n❌ ERRO ao verificar o banco de dados:", error);
    if ((error as any).code === 'SQLITE_CANTOPEN') {
      console.error("O banco de dados não existe ou não pode ser acessado.");
      console.error(`Caminho esperado: ${dbPath}`);
      console.error("Execute 'npm run init:db' para inicializar o banco de dados.");
    }
  }
}

checkDatabaseStatus();

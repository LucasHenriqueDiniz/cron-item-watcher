// Script para testar a inicialização e operações do banco de dados
import { initDatabase, loadStoredData, saveNewCsTradeItems, saveNewMannCoItems, cleanupOldItems } from './database.js';

async function testDatabase() {
  console.log("============================================");
  console.log("Testando a inicialização do banco de dados...");
  console.log("============================================");
  
  try {
    // 1. Inicializar o banco de dados
    console.log("\n1. Inicializando o banco de dados...");
    const db = await initDatabase();
    console.log("✅ Banco de dados inicializado com sucesso!");
    
    // 2. Inserir alguns dados de teste
    console.log("\n2. Inserindo dados de teste...");
    const testCsTradeItem = {
      id: "test1",
      n: "Test CS Trade Item",
      p: 123.45,
      image: "https://example.com/image1.png",
      itemUrl: "https://example.com/item1",
      game: "tf2",
      effect: "Test Effect",
      effectId: 123
    };
    
    const testMannCoItem = {
      id: 12345,
      name: "Test MannCo Item",
      price: 67.89,
      imageUrl: "https://example.com/image2.png",
      itemUrl: "https://example.com/item2",
      game: "tf2",
      effect: "Test Effect",
      effectId: 456,
      effectUrl: "https://example.com/effect.png"
    };
    
    await saveNewCsTradeItems([testCsTradeItem]);
    await saveNewMannCoItems([testMannCoItem]);
    console.log("✅ Dados de teste inseridos com sucesso!");
    
    // 3. Carregar dados armazenados
    console.log("\n3. Carregando dados armazenados...");
    const storedData = await loadStoredData();
    console.log(`✅ Dados carregados: ${Object.keys(storedData.cs_trade).length} itens CS.Trade, ${Object.keys(storedData.mann_co).length} itens MannCo`);
    console.log(`Última atualização: ${storedData.lastUpdate}`);
    
    // 4. Executar limpeza de itens antigos
    console.log("\n4. Testando limpeza de itens antigos...");
    await cleanupOldItems(30);
    console.log("✅ Limpeza de itens antigos concluída!");
    
    console.log("\n============================================");
    console.log("✅ Todos os testes do banco de dados concluídos com sucesso!");
    console.log("============================================");
    
  } catch (error) {
    console.error("❌ ERRO nos testes do banco de dados:", error);
    process.exit(1);
  }
}

testDatabase();

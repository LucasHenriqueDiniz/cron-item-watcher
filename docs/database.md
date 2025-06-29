# Estrutura do Banco de Dados

O Item Watcher Server utiliza um banco de dados SQLite para armazenamento eficiente de dados. Este documento explica a estrutura do banco de dados e como ele é usado pelo sistema.

## Localização

O banco de dados está localizado em:

```
data/items.db
```

## Tabelas Principais

### cs_trade_items

Armazena os itens do CS.Trade.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | TEXT | Identificador único do item (PRIMARY KEY) |
| name | TEXT | Nome do item |
| price | REAL | Preço do item |
| image_url | TEXT | URL da imagem do item |
| item_url | TEXT | URL do item no site |
| game | TEXT | Identificador do jogo (tf2, cs2, etc.) |
| effect_id | INTEGER | Referência ao ID do efeito (se for unusual) |
| data | TEXT | Dados adicionais em formato JSON |
| created_at | TIMESTAMP | Data de criação do registro |
| updated_at | TIMESTAMP | Data da última atualização |

### mann_co_items

Armazena os itens do MannCo.Store ou da API de Inventário da Steam.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | TEXT | Identificador único do item (PRIMARY KEY) |
| name | TEXT | Nome do item |
| price | REAL | Preço do item |
| image_url | TEXT | URL da imagem do item |
| item_url | TEXT | URL do item no site |
| game | TEXT | Identificador do jogo (tf2, cs2, etc.) |
| effect_id | INTEGER | Referência ao ID do efeito (se for unusual) |
| data | TEXT | Dados adicionais em formato JSON |
| created_at | TIMESTAMP | Data de criação do registro |
| updated_at | TIMESTAMP | Data da última atualização |

### effects

Armazena informações sobre efeitos de itens unusual.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INTEGER | ID do efeito (PRIMARY KEY) |
| name | TEXT | Nome do efeito |
| image_url | TEXT | URL da imagem do efeito |

### meta_data

Armazena metadados do sistema.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| key | TEXT | Nome da chave (PRIMARY KEY) |
| value | TEXT | Valor associado |

## Operações Comuns

### Inicialização do Banco de Dados

```typescript
import { initDatabase } from './database.js';

// Inicializa o banco de dados (cria tabelas se não existirem)
await initDatabase();
```

### Salvar Novos Itens

```typescript
import { saveNewCsTradeItems, saveNewMannCoItems } from './database.js';

// Salvar itens do CS.Trade
await saveNewCsTradeItems(csTradeItems);

// Salvar itens do MannCo ou Steam
await saveNewMannCoItems(mannCoItems);
```

### Carregar Dados Armazenados

```typescript
import { loadStoredData } from './database.js';

// Carrega todos os dados armazenados no formato compatível com a interface StoredData
const storedData = await loadStoredData();
```

### Encontrar Novos Itens

```typescript
import { findNewCsTradeItems, findNewMannCoItems } from './database.js';

// Encontrar novos itens do CS.Trade (comparando com o banco de dados)
const newCsTradeItems = await findNewCsTradeItems(currentCsTradeItems);

// Encontrar novos itens do MannCo (comparando com o banco de dados)
const newMannCoItems = await findNewMannCoItems(currentMannCoItems);
```

### Limpeza de Dados Antigos

```typescript
import { cleanupOldItems } from './database.js';

// Limpar itens mais antigos que 30 dias
await cleanupOldItems(30);
```

## Vantagens do Banco de Dados SQLite

1. **Eficiência**: Busca e armazenamento mais eficientes que o JSON
2. **Durabilidade**: Dados mais protegidos contra corrupção
3. **Limpeza automática**: Remoção de itens antigos para manter o desempenho
4. **Consultas complexas**: Possibilidade de executar consultas mais avançadas

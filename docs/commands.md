# Comandos do Item Watcher Server

Este documento contém os comandos mais comuns para gerenciar o Item Watcher Server.

## Comandos Básicos

### Instalação e Configuração

```bash
# Configuração inicial automatizada
./setup.sh

# Instalação manual de dependências
npm install

# Compilar o código TypeScript
npm run build

# Inicializar o banco de dados
npm run init:db
```

### Executar o Servidor

```bash
# Iniciar o servidor (versão de produção)
npm run start:server

# Iniciar o servidor (versão de desenvolvimento)
npm run dev:server

# Executar verificação única (não como servidor)
npm run start
```

### Gerenciamento do Banco de Dados

```bash
# Verificar o estado atual do banco de dados
npm run check:db

# Testar as operações de banco de dados
npm run test:db
```

### Desenvolvimento

```bash
# Compilação contínua (watch mode)
npm run watch

# Compilar e executar em modo de desenvolvimento
npm run dev
```

## Verificações Específicas

Se você quiser executar verificações apenas para um serviço específico:

```bash
# Verificar apenas CS.Trade
npm run start -- --cs-trade-only

# Verificar apenas MannCo
npm run start -- --mannco-only
```

## Comandos de Manutenção

```bash
# Verificar erros TypeScript
tsc --noEmit

# Limpar e recompilar tudo
rm -rf dist/ && npm run build
```

## Estrutura de Arquivos

- `src/` - Código fonte TypeScript
- `dist/` - Código compilado JavaScript
- `data/` - Dados e configurações
  - `items.db` - Banco de dados SQLite
  - `config.json` - Configuração do aplicativo

# Guia de Início Rápido

Este guia mostra como iniciar rapidamente o Item Watcher Server em seu ambiente.

## Pré-requisitos

- Node.js v14 ou superior
- npm

## Passos para Iniciar

### 1. Setup Inicial

O método mais fácil é usar o script de configuração automatizado:

```bash
# No diretório do projeto
./setup.sh
```

Este script irá:
- Instalar todas as dependências
- Criar arquivo .env (se necessário)
- Compilar o código TypeScript
- Inicializar o banco de dados
- Exibir o status atual do banco de dados

### 2. Configuração do Discord Webhook

Edite o arquivo `.env` e adicione seu URL de webhook do Discord:

```
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/seu-webhook-url-aqui
```

### 3. Configuração dos Termos de Busca

Edite `data/config.json` para personalizar:
- Termos de busca (`watchTerms`)
- Termos a ignorar (`ignoredTerms`)
- Limites de preço (`maxPrice`, `minPrice`)
- Jogos a monitorar (`watchGames`)

### 4. Iniciando o Servidor

```bash
# Modo de produção
npm run start:server

# Modo de desenvolvimento (recompila ao fazer alterações)
npm run dev:server
```

### 5. Verificando o Status

Abra em seu navegador:

```
http://localhost:3000/status
```

Isso mostrará o status atual do servidor, incluindo:
- Se está rodando
- Quando foi a última verificação de itens
- Quando será a próxima verificação

## Solução de Problemas

Se encontrar problemas:

1. Verifique se o banco de dados está inicializado:
   ```bash
   npm run check:db
   ```

2. Teste o banco de dados:
   ```bash
   npm run test:db
   ```

3. Verifique os logs para erros

## Próximos Passos

- Consulte `docs/commands.md` para mais comandos disponíveis
- Consulte `docs/database.md` para detalhes sobre a estrutura do banco de dados

# Item Watcher Server

Uma aplicação baseada em servidor que monitora itens específicos no CS.Trade e nos inventários de bots da Steam, enviando notificações via webhooks do Discord quando itens correspondentes são encontrados.

## Como Funciona

1. O servidor executa continuamente, verificando novos itens em intervalos regulares (padrão: 15 minutos)
2. Obtém os itens mais recentes do CS.Trade usando a API deles
3. Verifica os inventários dos bots da Steam usando a API de Inventário da Steam (quando configurado)
4. Armazena itens em um banco de dados SQLite para armazenamento e recuperação eficientes
5. Compara os itens com dados previamente armazenados para encontrar novos itens
6. Verifica se novos itens correspondem aos termos de busca especificados
7. Envia notificações para seu canal do Discord via webhook quando encontra correspondências
8. Periodicamente limpa dados antigos para manter o desempenho ideal

## Configuração Rápida (Método Automatizado)

O método mais fácil para configurar o sistema:

1. Clone este repositório
2. Execute o script de configuração: `./setup.sh`
3. Edite o arquivo `.env` gerado com seu URL de webhook do Discord
4. Inicie o servidor: `npm run start:server`

## Configuração Manual

Se preferir configurar manualmente:

1. Clone este repositório
2. Instale as dependências: `npm install`
3. Copie `.env.example` para `.env` e atualize com seu URL de webhook do Discord
4. Adicione IDs de bots da Steam para monitorar no arquivo .env (opcional)
5. Compile a aplicação: `npm run build`
6. Inicialize o banco de dados: `npm run init:db`
7. Inicie o servidor: `npm run start:server`
8. Acesse o status do servidor em http://localhost:3000/status
9. (Opcional) Modifique a configuração em `data/config.json` para personalizar termos de busca e limites de preço

## Configuração

Você pode personalizar as seguintes configurações em `data/config.json`:

### Configurações do Sistema

- **Intervalo de Verificação**: Configure no arquivo `.env` com a variável `CHECK_INTERVAL_MS` (em milissegundos)
- **Porta do Servidor**: Configure no arquivo `.env` com a variável `PORT` (padrão: 3000)

### Banco de Dados SQLite

O sistema utiliza SQLite para armazenar dados de forma eficiente. O banco de dados é inicializado automaticamente quando você executa:

```bash
npm run init:db
```

Para verificar o estado atual do banco de dados:

```bash
npm run check:db
```

Para testar as operações do banco de dados:

```bash
npm run test:db
```

### CS.Trade e MannCo Configurações:

  - Games to watch: TF2, CS2, Dota 2, and Rust
  - Watch terms and terms to ignore
  - Maximum and minimum price thresholds

- MannCo settings:

  - Games to watch: TF2, CS2, Dota 2, and Rust
  - Watch terms and terms to ignore
  - Maximum and minimum price thresholds

- Discord webhook appearance (username and avatar)

## Game Support

- **CS.Trade**: Supports TF2, CS2, Dota 2, and Rust items
- **MannCo.Store**: Supports TF2, CS2, Dota 2, and Rust items

## Web Scraping

This application uses puppeteer for web scraping to access MannCo.store. This approach:

1. Bypasses Cloudflare protection
2. Works in GitHub Actions environment
3. Doesn't require any cookies or manual intervention
4. Supports all game categories on MannCo.store

## Known Issues

### Server Resource Usage

Web scraping with a headless browser consumes more resources than simple API requests. If you're running this on a low-resource server, consider:

1. Running less frequently (e.g., hourly instead of every 30 minutes)
2. Limiting the number of games you're tracking
3. Setting a page limit for item collection

### CS.Trade API Format

The CS.Trade API response format may change over time. If you see errors related to invalid data format, check the logs for details about the current structure and update the code accordingly.

## Configuração Local

Para executar o projeto localmente, siga estas etapas:

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/cron-item-watcher.git
   cd cron-item-watcher
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:

   - Copie o arquivo `.env.example` para `.env`
   - Preencha as variáveis necessárias, como `DISCORD_WEBHOOK_URL`

4. Configure suas preferências:

   - Edite o arquivo `data/config.json` para definir termos de busca, limites de preço, etc.
   - Se o arquivo não existir, será criado automaticamente na primeira execução

5. Compile o código TypeScript:

   ```bash
   npm run build
   ```

6. Execute o aplicativo:
   ```bash
   npm start
   ```

## Modos de Execução

- Executar para todos os sites:

  ```bash
  npm start
  ```

- Executar apenas para CS.Trade:

  ```bash
  npm start -- --cs-trade-only
  ```

- Executar apenas para MannCo:
  ```bash
  npm start -- --mannco-only
  ```

## Desenvolvimento

Para desenvolvimento local com recompilação automática:

1. Inicie o modo de observação TypeScript:

   ```bash
   npm run watch
   ```

2. Em outro terminal, execute o aplicativo quando necessário:
   ```bash
   npm start
   ```

## Estrutura do Banco de Dados

O aplicativo utiliza SQLite para armazenar itens e informações relacionadas:

- `cs_trade_items`: Itens do CS.Trade
- `mann_co_items`: Itens do MannCo.store
- `effects`: Efeitos compartilhados entre itens
- `meta_data`: Metadados como última atualização

## Limpeza de Dados

O banco de dados é automaticamente limpo periodicamente para remover itens antigos. Por padrão, mantém os itens dos últimos 30 dias.

## License

MIT

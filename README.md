# Cron Item Watcher

A GitHub Actions-based bot that watches for specific items on CS.Trade and MannCo.Store, and sends notifications via Discord webhooks when matching items are found.

## How It Works

1. The bot runs on a schedule via GitHub Actions (every 30 minutes by default)
2. It fetches the latest items from CS.Trade using their API
3. It scrapes MannCo.Store using a headless browser to bypass Cloudflare protection
4. Compares the items with previously saved data to find new items
5. Checks if any new items match your specified watch terms
6. Sends notifications to your Discord channel via webhook for any matches
7. Updates the stored data for the next run

## Setup

1. Fork this repository
2. Add a Discord webhook URL as a repository secret named `DISCORD_WEBHOOK_URL`
3. (Optional) Modify the configuration in `data/config.json` to customize watch terms and price limits
4. Enjoy automatic notifications when matching items appear!

## Configuration

You can customize the following in `data/config.json`:

- CS.Trade settings:

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

## License

MIT

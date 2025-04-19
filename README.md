# Cron Item Watcher

A GitHub Actions-based bot that watches for specific items on CS.Trade and MannCo.Store, and sends notifications via Discord webhooks when matching items are found.

## How It Works

1. The bot runs on a schedule via GitHub Actions (every 30 minutes by default)
2. It fetches the latest items from CS.Trade and MannCo.Store
3. Compares the items with previously saved data to find new items
4. Checks if any new items match your specified watch terms
5. Sends notifications to your Discord channel via webhook for any matches
6. Updates the stored data for the next run

## Setup

1. Fork this repository
2. Add a Discord webhook URL as a repository secret named `DISCORD_WEBHOOK_URL`
3. (Optional) Modify the configuration in `data/config.json` to customize watch terms and price limits
4. Enjoy automatic notifications when matching items appear!

## Configuration

You can customize the following in `data/config.json`:

- Watch terms for each site
- Maximum price thresholds
- Discord webhook appearance

## License

MIT
